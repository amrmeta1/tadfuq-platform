package debug

import (
	"fmt"
	"net"
	"os"
	"strings"
	"time"
)

// ServerChecker verifies server configuration
type ServerChecker struct {
	ExpectedHost string
	ExpectedPort string
}

func NewServerChecker() *ServerChecker {
	return &ServerChecker{
		ExpectedHost: "0.0.0.0",
		ExpectedPort: os.Getenv("PORT"),
	}
}

func (c *ServerChecker) Name() string {
	return "Server Configuration"
}

func (c *ServerChecker) Check() CheckResult {
	start := time.Now()
	result := CheckResult{
		Name:      c.Name(),
		Timestamp: start,
	}

	// Check if server is listening on correct address
	port := c.ExpectedPort
	if port == "" {
		port = "8080"
	}

	details := map[string]interface{}{
		"expected_host": c.ExpectedHost,
		"expected_port": port,
		"env_port":      os.Getenv("PORT"),
	}

	// Verify port is valid
	if _, err := net.LookupPort("tcp", port); err != nil {
		result.Status = "fail"
		result.Message = fmt.Sprintf("Invalid port configuration: %s", port)
		result.Suggestions = []string{
			"Set PORT environment variable to a valid port number",
			"Ensure port is between 1-65535",
		}
		result.Details = details
		result.Duration = time.Since(start)
		return result
	}

	// Check if we're listening on 0.0.0.0 (all interfaces)
	serverAddr := os.Getenv("SERVER_ADDR")
	if serverAddr != "" && !strings.HasPrefix(serverAddr, "0.0.0.0") && !strings.HasPrefix(serverAddr, ":") {
		result.Status = "warn"
		result.Message = fmt.Sprintf("Server may not be accessible externally (listening on %s)", serverAddr)
		result.Suggestions = []string{
			"Set SERVER_ADDR to 0.0.0.0 or :PORT to listen on all interfaces",
			"Current address may only be accessible locally",
		}
		details["server_addr"] = serverAddr
	} else {
		result.Status = "pass"
		result.Message = "Server configuration is correct"
	}

	result.Details = details
	result.Duration = time.Since(start)
	return result
}

// EnvironmentChecker verifies required environment variables
type EnvironmentChecker struct {
	RequiredVars []string
}

func NewEnvironmentChecker(requiredVars []string) *EnvironmentChecker {
	return &EnvironmentChecker{
		RequiredVars: requiredVars,
	}
}

func (c *EnvironmentChecker) Name() string {
	return "Environment Variables"
}

func (c *EnvironmentChecker) Check() CheckResult {
	start := time.Now()
	result := CheckResult{
		Name:      c.Name(),
		Timestamp: start,
	}

	missing := []string{}
	present := map[string]string{}

	for _, varName := range c.RequiredVars {
		value := os.Getenv(varName)
		if value == "" {
			missing = append(missing, varName)
		} else {
			// Mask sensitive values
			if strings.Contains(strings.ToLower(varName), "secret") ||
				strings.Contains(strings.ToLower(varName), "password") ||
				strings.Contains(strings.ToLower(varName), "key") {
				present[varName] = "***REDACTED***"
			} else {
				present[varName] = value
			}
		}
	}

	details := map[string]interface{}{
		"required": c.RequiredVars,
		"present":  present,
		"missing":  missing,
	}

	if len(missing) > 0 {
		result.Status = "fail"
		result.Message = fmt.Sprintf("Missing %d required environment variable(s)", len(missing))
		result.Suggestions = []string{
			fmt.Sprintf("Set the following environment variables: %s", strings.Join(missing, ", ")),
			"Check your .env file or Kubernetes ConfigMap/Secret",
		}
	} else {
		result.Status = "pass"
		result.Message = "All required environment variables are set"
	}

	result.Details = details
	result.Duration = time.Since(start)
	return result
}

// HealthEndpointChecker verifies health endpoint is accessible
type HealthEndpointChecker struct {
	Port string
}

func NewHealthEndpointChecker(port string) *HealthEndpointChecker {
	if port == "" {
		port = "8080"
	}
	return &HealthEndpointChecker{Port: port}
}

func (c *HealthEndpointChecker) Name() string {
	return "Health Endpoint"
}

func (c *HealthEndpointChecker) Check() CheckResult {
	start := time.Now()
	result := CheckResult{
		Name:      c.Name(),
		Timestamp: start,
	}

	// Try to connect to health endpoint
	conn, err := net.DialTimeout("tcp", fmt.Sprintf("localhost:%s", c.Port), 2*time.Second)
	if err != nil {
		result.Status = "warn"
		result.Message = "Cannot verify health endpoint (server may not be running)"
		result.Details = map[string]interface{}{
			"port":  c.Port,
			"error": err.Error(),
		}
		result.Suggestions = []string{
			"Ensure server is running",
			fmt.Sprintf("Check if port %s is accessible", c.Port),
			"Verify health endpoint is implemented at /healthz or /health",
		}
	} else {
		conn.Close()
		result.Status = "pass"
		result.Message = "Server is listening and accessible"
		result.Details = map[string]interface{}{
			"port": c.Port,
		}
	}

	result.Duration = time.Since(start)
	return result
}
