package debug

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// KubernetesManifestChecker verifies Kubernetes manifests
type KubernetesManifestChecker struct {
	ManifestDir string
}

func NewKubernetesManifestChecker(manifestDir string) *KubernetesManifestChecker {
	return &KubernetesManifestChecker{ManifestDir: manifestDir}
}

func (c *KubernetesManifestChecker) Name() string {
	return "Kubernetes Manifests"
}

func (c *KubernetesManifestChecker) Check() CheckResult {
	start := time.Now()
	result := CheckResult{
		Name:      c.Name(),
		Timestamp: start,
	}

	if _, err := os.Stat(c.ManifestDir); os.IsNotExist(err) {
		result.Status = "warn"
		result.Message = fmt.Sprintf("Kubernetes manifest directory not found: %s", c.ManifestDir)
		result.Details = map[string]interface{}{
			"path": c.ManifestDir,
		}
		result.Duration = time.Since(start)
		return result
	}

	issues := []string{}
	manifests := map[string]interface{}{}

	// Walk through manifest directory
	err := filepath.Walk(c.ManifestDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() || (!strings.HasSuffix(path, ".yaml") && !strings.HasSuffix(path, ".yml")) {
			return nil
		}

		manifestIssues := c.checkManifest(path)
		if len(manifestIssues) > 0 {
			manifests[filepath.Base(path)] = manifestIssues
			issues = append(issues, manifestIssues...)
		}

		return nil
	})

	if err != nil {
		result.Status = "fail"
		result.Message = fmt.Sprintf("Error reading manifests: %v", err)
		result.Duration = time.Since(start)
		return result
	}

	details := map[string]interface{}{
		"manifest_dir": c.ManifestDir,
		"manifests":    manifests,
		"issues":       issues,
	}

	suggestions := []string{}
	if len(issues) > 0 {
		result.Status = "warn"
		result.Message = fmt.Sprintf("Found %d potential issue(s) in Kubernetes manifests", len(issues))
		suggestions = append(suggestions, "Review manifest configurations")
		suggestions = append(suggestions, "Ensure containerPort matches service targetPort")
		suggestions = append(suggestions, "Verify ingress paths are correct")
	} else {
		result.Status = "pass"
		result.Message = "Kubernetes manifests look good"
	}

	result.Details = details
	result.Suggestions = suggestions
	result.Duration = time.Since(start)
	return result
}

func (c *KubernetesManifestChecker) checkManifest(path string) []string {
	issues := []string{}

	file, err := os.Open(path)
	if err != nil {
		return issues
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	inDeployment := false
	inService := false
	containerPort := ""
	targetPort := ""

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		if strings.Contains(line, "kind: Deployment") {
			inDeployment = true
		}
		if strings.Contains(line, "kind: Service") {
			inService = true
		}

		if inDeployment && strings.Contains(line, "containerPort:") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				containerPort = strings.TrimSpace(parts[1])
			}
		}

		if inService && strings.Contains(line, "targetPort:") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				targetPort = strings.TrimSpace(parts[1])
			}
		}

		// Check for localhost references
		if strings.Contains(line, "localhost") && !strings.HasPrefix(line, "#") {
			issues = append(issues, fmt.Sprintf("Found localhost reference in %s", filepath.Base(path)))
		}
	}

	// Verify port consistency
	if containerPort != "" && targetPort != "" && containerPort != targetPort {
		issues = append(issues, fmt.Sprintf("Port mismatch in %s: containerPort=%s, targetPort=%s", filepath.Base(path), containerPort, targetPort))
	}

	return issues
}

// KubernetesRuntimeChecker checks if running in Kubernetes
type KubernetesRuntimeChecker struct{}

func NewKubernetesRuntimeChecker() *KubernetesRuntimeChecker {
	return &KubernetesRuntimeChecker{}
}

func (c *KubernetesRuntimeChecker) Name() string {
	return "Kubernetes Runtime"
}

func (c *KubernetesRuntimeChecker) Check() CheckResult {
	start := time.Now()
	result := CheckResult{
		Name:      c.Name(),
		Timestamp: start,
	}

	// Check for Kubernetes environment variables
	k8sEnvVars := []string{
		"KUBERNETES_SERVICE_HOST",
		"KUBERNETES_SERVICE_PORT",
	}

	inK8s := false
	foundVars := []string{}

	for _, envVar := range k8sEnvVars {
		if val := os.Getenv(envVar); val != "" {
			inK8s = true
			foundVars = append(foundVars, envVar)
		}
	}

	details := map[string]interface{}{
		"in_kubernetes": inK8s,
		"k8s_env_vars":  foundVars,
		"namespace":     os.Getenv("POD_NAMESPACE"),
		"pod_name":      os.Getenv("POD_NAME"),
	}

	if inK8s {
		result.Status = "pass"
		result.Message = "Running in Kubernetes cluster"
	} else {
		result.Status = "warn"
		result.Message = "Not running in Kubernetes (local environment)"
	}

	result.Details = details
	result.Duration = time.Since(start)
	return result
}
