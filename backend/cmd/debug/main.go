package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"

	"github.com/finch-co/cashflow/internal/debug"
)

const (
	colorReset  = "\033[0m"
	colorRed    = "\033[31m"
	colorGreen  = "\033[32m"
	colorYellow = "\033[33m"
	colorBlue   = "\033[34m"
	colorCyan   = "\033[36m"
)

func main() {
	verbose := flag.Bool("verbose", false, "Enable verbose output")
	jsonOutput := flag.Bool("json", false, "Output results as JSON")
	flag.Parse()

	fmt.Println(colorCyan + "╔════════════════════════════════════════════════════════╗" + colorReset)
	fmt.Println(colorCyan + "║     CashFlow.ai Diagnostic Tool                       ║" + colorReset)
	fmt.Println(colorCyan + "╚════════════════════════════════════════════════════════╝" + colorReset)
	fmt.Println()

	runner := debug.DefaultRunner(*verbose)
	report := runner.RunAll()

	if *jsonOutput {
		outputJSON(report)
		return
	}

	outputFormatted(report)

	// Exit with error code if unhealthy
	if !report.Summary.Healthy {
		os.Exit(1)
	}
}

func outputJSON(report debug.DiagnosticReport) {
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	encoder.Encode(report)
}

func outputFormatted(report debug.DiagnosticReport) {
	fmt.Printf("%sEnvironment:%s %s\n", colorBlue, colorReset, report.Environment)
	fmt.Printf("%sVersion:%s %s\n", colorBlue, colorReset, report.Version)
	fmt.Printf("%sTimestamp:%s %s\n", colorBlue, colorReset, report.Timestamp.Format("2006-01-02 15:04:05"))
	fmt.Println()

	fmt.Println(colorCyan + "Running Diagnostic Checks..." + colorReset)
	fmt.Println(colorCyan + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + colorReset)
	fmt.Println()

	for i, check := range report.Checks {
		statusColor := colorGreen
		statusSymbol := "✓"

		switch check.Status {
		case "fail":
			statusColor = colorRed
			statusSymbol = "✗"
		case "warn":
			statusColor = colorYellow
			statusSymbol = "⚠"
		}

		fmt.Printf("%s[%s] %s%s\n", statusColor, statusSymbol, check.Name, colorReset)
		fmt.Printf("    %s%s%s\n", statusColor, check.Message, colorReset)
		fmt.Printf("    Duration: %v\n", check.Duration)

		if len(check.Suggestions) > 0 {
			fmt.Printf("    %sSuggestions:%s\n", colorYellow, colorReset)
			for _, suggestion := range check.Suggestions {
				fmt.Printf("      • %s\n", suggestion)
			}
		}

		if i < len(report.Checks)-1 {
			fmt.Println()
		}
	}

	fmt.Println()
	fmt.Println(colorCyan + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + colorReset)
	fmt.Println()

	// Summary
	fmt.Println(colorCyan + "Summary" + colorReset)
	fmt.Println(colorCyan + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + colorReset)
	fmt.Printf("Total Checks:  %d\n", report.Summary.Total)
	fmt.Printf("%sPassed:%s        %d\n", colorGreen, colorReset, report.Summary.Passed)
	fmt.Printf("%sFailed:%s        %d\n", colorRed, colorReset, report.Summary.Failed)
	fmt.Printf("%sWarnings:%s      %d\n", colorYellow, colorReset, report.Summary.Warned)
	fmt.Printf("Total Duration: %v\n", report.TotalDuration)
	fmt.Println()

	if report.Summary.Healthy {
		fmt.Printf("%s✓ System is HEALTHY%s\n", colorGreen, colorReset)
	} else {
		fmt.Printf("%s✗ System has ISSUES - review failed checks above%s\n", colorRed, colorReset)
	}
	fmt.Println()
}
