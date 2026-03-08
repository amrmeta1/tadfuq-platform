package debug

import (
	"fmt"
	"os"
	"time"
)

// Runner executes all diagnostic checks
type Runner struct {
	checkers []Checker
	verbose  bool
}

// NewRunner creates a new diagnostic runner
func NewRunner(verbose bool) *Runner {
	return &Runner{
		checkers: []Checker{},
		verbose:  verbose,
	}
}

// AddChecker adds a checker to the runner
func (r *Runner) AddChecker(checker Checker) {
	r.checkers = append(r.checkers, checker)
}

// RunAll executes all registered checkers
func (r *Runner) RunAll() DiagnosticReport {
	start := time.Now()

	report := DiagnosticReport{
		Timestamp:   start,
		Environment: r.detectEnvironment(),
		Version:     r.getVersion(),
		Checks:      []CheckResult{},
	}

	for _, checker := range r.checkers {
		if r.verbose {
			fmt.Printf("Running check: %s...\n", checker.Name())
		}
		result := checker.Check()
		report.Checks = append(report.Checks, result)
	}

	report.TotalDuration = time.Since(start)
	report.Summary = r.calculateSummary(report.Checks)

	return report
}

func (r *Runner) detectEnvironment() string {
	if os.Getenv("KUBERNETES_SERVICE_HOST") != "" {
		return "kubernetes"
	}
	if _, err := os.Stat("/.dockerenv"); err == nil {
		return "docker"
	}
	return "local"
}

func (r *Runner) getVersion() string {
	version := os.Getenv("APP_VERSION")
	if version == "" {
		version = "unknown"
	}
	return version
}

func (r *Runner) calculateSummary(checks []CheckResult) Summary {
	summary := Summary{
		Total:   len(checks),
		Passed:  0,
		Failed:  0,
		Warned:  0,
		Healthy: true,
	}

	for _, check := range checks {
		switch check.Status {
		case "pass":
			summary.Passed++
		case "fail":
			summary.Failed++
			summary.Healthy = false
		case "warn":
			summary.Warned++
		}
	}

	return summary
}

// DefaultRunner creates a runner with all standard checks
func DefaultRunner(verbose bool) *Runner {
	runner := NewRunner(verbose)

	// Server checks
	runner.AddChecker(NewServerChecker())
	runner.AddChecker(NewEnvironmentChecker([]string{
		"PORT",
		"DB_HOST",
		"DB_NAME",
	}))
	runner.AddChecker(NewHealthEndpointChecker(os.Getenv("PORT")))

	// Frontend checks
	runner.AddChecker(NewFrontendAssetsChecker("../frontend"))
	runner.AddChecker(NewStaticFileServingChecker("3000"))

	// Docker checks
	runner.AddChecker(NewDockerfileChecker("Dockerfile"))
	runner.AddChecker(NewDockerImageChecker([]string{
		"/app",
		"/app/package.json",
	}))

	// Kubernetes checks
	runner.AddChecker(NewKubernetesManifestChecker("../deploy/k8s"))
	runner.AddChecker(NewKubernetesRuntimeChecker())

	// API checks
	runner.AddChecker(NewAPIConnectivityChecker("../frontend"))

	return runner
}
