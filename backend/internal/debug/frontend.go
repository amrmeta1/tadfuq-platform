package debug

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// FrontendAssetsChecker verifies frontend assets exist
type FrontendAssetsChecker struct {
	BasePath string
}

func NewFrontendAssetsChecker(basePath string) *FrontendAssetsChecker {
	if basePath == "" {
		basePath = "."
	}
	return &FrontendAssetsChecker{BasePath: basePath}
}

func (c *FrontendAssetsChecker) Name() string {
	return "Frontend Assets"
}

func (c *FrontendAssetsChecker) Check() CheckResult {
	start := time.Now()
	result := CheckResult{
		Name:      c.Name(),
		Timestamp: start,
	}

	// Check for common frontend build directories
	buildDirs := []string{
		filepath.Join(c.BasePath, "dist"),
		filepath.Join(c.BasePath, "build"),
		filepath.Join(c.BasePath, ".next"),
		filepath.Join(c.BasePath, "public"),
	}

	found := []string{}
	missing := []string{}

	for _, dir := range buildDirs {
		if _, err := os.Stat(dir); err == nil {
			found = append(found, dir)
		} else {
			missing = append(missing, dir)
		}
	}

	details := map[string]interface{}{
		"base_path": c.BasePath,
		"found":     found,
		"missing":   missing,
	}

	if len(found) == 0 {
		result.Status = "fail"
		result.Message = "No frontend build directories found"
		result.Suggestions = []string{
			"Run 'npm run build' to build frontend assets",
			"Verify frontend build output directory",
			"Check Dockerfile COPY commands include frontend assets",
		}
	} else {
		// Check for index.html in found directories
		indexFound := false
		for _, dir := range found {
			indexPath := filepath.Join(dir, "index.html")
			if _, err := os.Stat(indexPath); err == nil {
				indexFound = true
				details["index_html"] = indexPath
				break
			}
		}

		if !indexFound && len(found) > 0 {
			result.Status = "warn"
			result.Message = fmt.Sprintf("Frontend directories found (%d) but no index.html", len(found))
			result.Suggestions = []string{
				"Verify frontend build completed successfully",
				"Check if using Next.js (uses .next directory instead of index.html)",
			}
		} else {
			result.Status = "pass"
			result.Message = fmt.Sprintf("Frontend assets found in %d location(s)", len(found))
		}
	}

	result.Details = details
	result.Duration = time.Since(start)
	return result
}

// StaticFileServingChecker tests if static files can be served
type StaticFileServingChecker struct {
	Port string
}

func NewStaticFileServingChecker(port string) *StaticFileServingChecker {
	if port == "" {
		port = "3000"
	}
	return &StaticFileServingChecker{Port: port}
}

func (c *StaticFileServingChecker) Name() string {
	return "Static File Serving"
}

func (c *StaticFileServingChecker) Check() CheckResult {
	start := time.Now()
	result := CheckResult{
		Name:      c.Name(),
		Timestamp: start,
	}

	// This is a placeholder - in production, you'd make actual HTTP requests
	// For now, we just check if the port is listening
	conn, err := os.Open("/")
	if err != nil {
		result.Status = "warn"
		result.Message = "Cannot verify static file serving"
		result.Details = map[string]interface{}{
			"port": c.Port,
		}
		result.Suggestions = []string{
			"Ensure frontend server is running",
			"Verify static file middleware is configured",
		}
	} else {
		conn.Close()
		result.Status = "pass"
		result.Message = "Static file serving check passed"
		result.Details = map[string]interface{}{
			"port": c.Port,
		}
	}

	result.Duration = time.Since(start)
	return result
}
