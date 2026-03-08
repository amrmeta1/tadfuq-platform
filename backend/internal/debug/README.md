# CashFlow.ai Debugging Agent

Automated diagnostic system for detecting deployment and runtime issues.

## Features

The debugging agent automatically checks:

1. ✅ **Server Configuration** - Verifies server listens on 0.0.0.0 and correct port
2. ✅ **Environment Variables** - Ensures all required env vars are set
3. ✅ **Health Endpoint** - Confirms health endpoint is accessible
4. ✅ **Frontend Assets** - Checks for dist/, build/, .next/, public/ directories
5. ✅ **Static File Serving** - Verifies static files can be served
6. ✅ **Dockerfile** - Inspects Dockerfile for best practices
7. ✅ **Docker Image** - Verifies expected files exist in container
8. ✅ **Kubernetes Manifests** - Checks for port mismatches and localhost refs
9. ✅ **Kubernetes Runtime** - Detects if running in K8s cluster
10. ✅ **API Connectivity** - Scans for hardcoded localhost URLs

## Usage

### CLI Tool

Run diagnostics from command line:

```bash
# Basic usage
go run cmd/debug/main.go

# Verbose output
go run cmd/debug/main.go -verbose

# JSON output
go run cmd/debug/main.go -json
```

### HTTP Endpoint

Add to your server router:

```go
import "github.com/yourusername/cashflow/backend/internal/debug"

// In your router setup
debugHandler := debug.NewHandler(true)
router.HandleFunc("/debug/status", debugHandler.StatusHandler)
router.HandleFunc("/debug/simple", debugHandler.SimpleStatusHandler)
```

Then access:

```bash
# Full diagnostic report
curl http://localhost:8080/debug/status

# Simple status
curl http://localhost:8080/debug/simple
```

### Programmatic Usage

```go
import "github.com/yourusername/cashflow/backend/internal/debug"

// Create runner with default checks
runner := debug.DefaultRunner(true)

// Run all diagnostics
report := runner.RunAll()

// Check if healthy
if !report.Summary.Healthy {
    log.Error("System has issues!")
}

// Iterate through results
for _, check := range report.Checks {
    fmt.Printf("%s: %s\n", check.Name, check.Status)
    if check.Status == "fail" {
        for _, suggestion := range check.Suggestions {
            fmt.Printf("  - %s\n", suggestion)
        }
    }
}
```

### Custom Checks

Add your own diagnostic checks:

```go
type MyCustomChecker struct{}

func (c *MyCustomChecker) Name() string {
    return "My Custom Check"
}

func (c *MyCustomChecker) Check() debug.CheckResult {
    result := debug.CheckResult{
        Name:      c.Name(),
        Timestamp: time.Now(),
    }
    
    // Your check logic here
    if everythingOk {
        result.Status = "pass"
        result.Message = "Everything is fine"
    } else {
        result.Status = "fail"
        result.Message = "Something is wrong"
        result.Suggestions = []string{
            "Try fixing X",
            "Check Y configuration",
        }
    }
    
    return result
}

// Add to runner
runner := debug.NewRunner(true)
runner.AddChecker(&MyCustomChecker{})
```

## Running in Kubernetes

### As a CronJob

Create a diagnostic CronJob:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cashflow-diagnostics
spec:
  schedule: "*/15 * * * *"  # Every 15 minutes
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: diagnostics
            image: your-registry/cashflow/backend:latest
            command: ["/app/debug"]
            args: ["-json"]
          restartPolicy: OnFailure
```

### As a Sidecar

Add to your deployment:

```yaml
containers:
- name: app
  image: your-registry/cashflow/backend:latest
  # ... your app config

- name: diagnostics
  image: your-registry/cashflow/backend:latest
  command: ["/bin/sh"]
  args:
    - -c
    - |
      while true; do
        /app/debug -json > /tmp/diagnostics.json
        sleep 300
      done
```

### As an Init Container

Run diagnostics before starting main container:

```yaml
initContainers:
- name: pre-flight-check
  image: your-registry/cashflow/backend:latest
  command: ["/app/debug"]
```

## Output Format

### CLI Output

```
╔════════════════════════════════════════════════════════╗
║     CashFlow.ai Diagnostic Tool                       ║
╚════════════════════════════════════════════════════════╝

Environment: kubernetes
Version: 1.0.0
Timestamp: 2026-03-07 23:45:00

Running Diagnostic Checks...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[✓] Server Configuration
    Server configuration is correct
    Duration: 2ms

[✗] Frontend Assets
    No frontend build directories found
    Duration: 5ms
    Suggestions:
      • Run 'npm run build' to build frontend assets
      • Verify frontend build output directory

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Checks:  10
Passed:        8
Failed:        1
Warnings:      1
Total Duration: 45ms

✗ System has ISSUES - review failed checks above
```

### JSON Output

```json
{
  "timestamp": "2026-03-07T23:45:00Z",
  "environment": "kubernetes",
  "version": "1.0.0",
  "checks": [
    {
      "name": "Server Configuration",
      "status": "pass",
      "message": "Server configuration is correct",
      "duration": 2000000,
      "timestamp": "2026-03-07T23:45:00Z"
    },
    {
      "name": "Frontend Assets",
      "status": "fail",
      "message": "No frontend build directories found",
      "suggestions": [
        "Run 'npm run build' to build frontend assets",
        "Verify frontend build output directory"
      ],
      "duration": 5000000,
      "timestamp": "2026-03-07T23:45:00Z"
    }
  ],
  "summary": {
    "total": 10,
    "passed": 8,
    "failed": 1,
    "warned": 1,
    "healthy": false
  },
  "total_duration": 45000000
}
```

### HTTP Endpoint Response

Simple status endpoint (`/debug/simple`):

```json
{
  "server": "ok",
  "health": "ok",
  "frontend_assets": "fail",
  "api_connection": "ok",
  "docker_image": "ok",
  "kubernetes": "ok",
  "overall_healthy": false,
  "timestamp": "2026-03-07T23:45:00Z"
}
```

## Common Issues and Auto-Fix Suggestions

### Issue: Server not listening on 0.0.0.0

**Suggestion:**
```
Set SERVER_ADDR to 0.0.0.0 or :PORT to listen on all interfaces
```

### Issue: Missing environment variables

**Suggestion:**
```
Set the following environment variables: DB_HOST, DB_NAME
Check your .env file or Kubernetes ConfigMap/Secret
```

### Issue: Frontend assets missing

**Suggestion:**
```
Run 'npm run build' to build frontend assets
Check Dockerfile COPY commands include frontend assets
```

### Issue: Localhost references in code

**Suggestion:**
```
Replace localhost URLs with relative paths (e.g., '/api/endpoint')
Use environment variables for API URLs (NEXT_PUBLIC_API_BASE_URL)
```

### Issue: Port mismatch in Kubernetes

**Suggestion:**
```
Ensure containerPort matches service targetPort
Verify ingress paths are correct
```

## Integration with CI/CD

### GitHub Actions

```yaml
- name: Run Diagnostics
  run: |
    go run cmd/debug/main.go -json > diagnostics.json
    
- name: Upload Diagnostics
  uses: actions/upload-artifact@v3
  with:
    name: diagnostics
    path: diagnostics.json
```

### Pre-deployment Check

```bash
#!/bin/bash
go run cmd/debug/main.go
if [ $? -ne 0 ]; then
  echo "Diagnostics failed! Aborting deployment."
  exit 1
fi
```

## Monitoring Integration

Export metrics to Prometheus:

```go
// TODO: Add Prometheus metrics exporter
```

Send alerts to Slack:

```go
// TODO: Add Slack webhook integration
```

## Development

### Adding New Checks

1. Create a new checker in appropriate file (e.g., `server.go`, `frontend.go`)
2. Implement the `Checker` interface
3. Add to `DefaultRunner()` in `runner.go`
4. Update documentation

### Testing

```bash
go test ./internal/debug/...
```

## License

Internal tool for CashFlow.ai platform
