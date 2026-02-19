// Package domain — role.go
// RBAC roles are managed by Keycloak client roles.
// The available roles are: tenant_admin, owner, finance_manager, accountant_readonly.
// Permission resolution is handled by internal/auth/permissions.go.
package domain

// ValidRoles lists the Keycloak client roles recognized by the platform.
var ValidRoles = []string{
	"tenant_admin",
	"owner",
	"finance_manager",
	"accountant_readonly",
}

// IsValidRole checks whether a role string is a recognized Keycloak client role.
func IsValidRole(role string) bool {
	for _, r := range ValidRoles {
		if r == role {
			return true
		}
	}
	return false
}
