package debug

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"time"
)

// DockerfileChecker inspects Dockerfile for common issues
type DockerfileChecker struct {
	DockerfilePath string
}

func NewDockerfileChecker(dockerfilePath string) *DockerfileChecker {
	return &DockerfileChecker{DockerfilePath: dockerfilePath}
}

func (c *DockerfileChecker) Name() string {
	return "Dockerfile Configuration"
}

func (c *DockerfileChecker) Check() CheckResult {
	start := time.Now()
	result := CheckResult{
		Name:      c.Name(),
		Timestamp: start,
	}

	if _, err := os.Stat(c.DockerfilePath); os.IsNotExist(err) {
		result.Status = "warn"
		result.Message = fmt.Sprintf("Dockerfile not found at %s", c.DockerfilePath)
		result.Details = map[string]interface{}{
			"path": c.DockerfilePath,
		}
		result.Suggestions = []string{
			"Verify Dockerfile path",
			"Check if using different Dockerfile (e.g., Dockerfile.prod)",
		}
		result.Duration = time.Since(start)
		return result
	}

	file, err := os.Open(c.DockerfilePath)
	if err != nil {
		result.Status = "fail"
		result.Message = fmt.Sprintf("Cannot read Dockerfile: %v", err)
		result.Duration = time.Since(start)
		return result
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)

	checks := map[string]bool{
		"multi_stage":    false,
		"expose":         false,
		"copy_assets":    false,
		"entrypoint_cmd": false,
		"workdir":        false,
	}

	details := map[string]interface{}{
		"path": c.DockerfilePath,
	}

	lineNum := 0
	for scanner.Scan() {
		lineNum++
		line := strings.TrimSpace(scanner.Text())
		upper := strings.ToUpper(line)

		if strings.HasPrefix(upper, "FROM ") {
			if strings.Contains(upper, "AS ") {
				checks["multi_stage"] = true
			}
		}
		if strings.HasPrefix(upper, "EXPOSE ") {
			checks["expose"] = true
			details["exposed_port"] = strings.TrimPrefix(upper, "EXPOSE ")
		}
		if strings.HasPrefix(upper, "COPY ") {
			if strings.Contains(upper, "DIST") ||
				strings.Contains(upper, "BUILD") ||
				strings.Contains(upper, ".NEXT") ||
				strings.Contains(upper, "PUBLIC") {
				checks["copy_assets"] = true
			}
		}
		if strings.HasPrefix(upper, "CMD ") || strings.HasPrefix(upper, "ENTRYPOINT ") {
			checks["entrypoint_cmd"] = true
		}
		if strings.HasPrefix(upper, "WORKDIR ") {
			checks["workdir"] = true
		}
	}

	issues := []string{}
	suggestions := []string{}

	if !checks["multi_stage"] {
		issues = append(issues, "No multi-stage build detected")
		suggestions = append(suggestions, "Consider using multi-stage builds to reduce image size")
	}
	if !checks["expose"] {
		issues = append(issues, "No EXPOSE directive found")
		suggestions = append(suggestions, "Add EXPOSE directive to document which port the container listens on")
	}
	if !checks["copy_assets"] {
		issues = append(issues, "No frontend assets COPY detected")
		suggestions = append(suggestions, "Ensure COPY commands include frontend build artifacts (dist/, build/, .next/, public/)")
	}
	if !checks["entrypoint_cmd"] {
		issues = append(issues, "No CMD or ENTRYPOINT found")
		suggestions = append(suggestions, "Add CMD or ENTRYPOINT to specify how to run the application")
	}

	details["checks"] = checks
	details["issues"] = issues

	if len(issues) > 2 {
		result.Status = "fail"
		result.Message = fmt.Sprintf("Found %d critical Dockerfile issues", len(issues))
	} else if len(issues) > 0 {
		result.Status = "warn"
		result.Message = fmt.Sprintf("Found %d Dockerfile warning(s)", len(issues))
	} else {
		result.Status = "pass"
		result.Message = "Dockerfile follows best practices"
	}

	result.Details = details
	result.Suggestions = suggestions
	result.Duration = time.Since(start)
	return result
}

// DockerImageChecker verifies Docker image content (when running inside container)
type DockerImageChecker struct {
	ExpectedFiles []string
}

func NewDockerImageChecker(expectedFiles []string) *DockerImageChecker {
	return &DockerImageChecker{ExpectedFiles: expectedFiles}
}

func (c *DockerImageChecker) Name() string {
	return "Docker Image Content"
}

func (c *DockerImageChecker) Check() CheckResult {
	start := time.Now()
	result := CheckResult{
		Name:      c.Name(),
		Timestamp: start,
	}

	// Check if running in container
	if _, err := os.Stat("/.dockerenv"); os.IsNotExist(err) {
		result.Status = "warn"
		result.Message = "Not running in Docker container"
		result.Details = map[string]interface{}{
			"in_container": false,
		}
		result.Duration = time.Since(start)
		return result
	}

	missing := []string{}
	found := []string{}

	for _, file := range c.ExpectedFiles {
		if _, err := os.Stat(file); os.IsNotExist(err) {
			missing = append(missing, file)
		} else {
			found = append(found, file)
		}
	}

	details := map[string]interface{}{
		"in_container":   true,
		"expected_files": c.ExpectedFiles,
		"found":          found,
		"missing":        missing,
	}

	if len(missing) > 0 {
		result.Status = "fail"
		result.Message = fmt.Sprintf("Missing %d expected file(s) in Docker image", len(missing))
		result.Suggestions = []string{
			"Verify Dockerfile COPY commands include all necessary files",
			fmt.Sprintf("Missing files: %s", strings.Join(missing, ", ")),
			"Rebuild Docker image with correct COPY directives",
		}
	} else {
		result.Status = "pass"
		result.Message = "All expected files present in Docker image"
	}

	result.Details = details
	result.Duration = time.Since(start)
	return result
}
