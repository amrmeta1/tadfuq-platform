package auth

// Permission represents a fine-grained action on a resource.
type Permission string

const (
	PermTenantCreate      Permission = "tenant:create"
	PermTenantRead        Permission = "tenant:read"
	PermTenantUpdate      Permission = "tenant:update"
	PermTenantDelete      Permission = "tenant:delete"
	PermMemberAdd         Permission = "member:add"
	PermMemberRead        Permission = "member:read"
	PermMemberRemove      Permission = "member:remove"
	PermMemberRoleChange  Permission = "member:role_change"
	PermRoleCreate        Permission = "role:create"
	PermRoleRead          Permission = "role:read"
	PermRoleUpdate        Permission = "role:update"
	PermAuditRead         Permission = "audit:read"
	PermUserReadSelf      Permission = "user:read_self"

	// Ingestion Service permissions
	PermIngestionImport   Permission = "ingestion:import"
	PermIngestionRead     Permission = "ingestion:read"
	PermIngestionSync     Permission = "ingestion:sync"
	PermBankAccountCreate Permission = "bank_account:create"
	PermBankAccountRead   Permission = "bank_account:read"
)

// RolePermissions maps Keycloak client roles to the set of permissions they grant.
// This is the central RBAC permission matrix for the platform.
var RolePermissions = map[string][]Permission{
	"tenant_admin": {
		PermTenantCreate,
		PermTenantRead,
		PermTenantUpdate,
		PermTenantDelete,
		PermMemberAdd,
		PermMemberRead,
		PermMemberRemove,
		PermMemberRoleChange,
		PermRoleCreate,
		PermRoleRead,
		PermRoleUpdate,
		PermAuditRead,
		PermUserReadSelf,
		PermIngestionImport,
		PermIngestionRead,
		PermIngestionSync,
		PermBankAccountCreate,
		PermBankAccountRead,
	},
	"owner": {
		PermTenantRead,
		PermTenantUpdate,
		PermMemberAdd,
		PermMemberRead,
		PermMemberRemove,
		PermMemberRoleChange,
		PermRoleRead,
		PermAuditRead,
		PermUserReadSelf,
		PermIngestionImport,
		PermIngestionRead,
		PermIngestionSync,
		PermBankAccountCreate,
		PermBankAccountRead,
	},
	"finance_manager": {
		PermTenantRead,
		PermMemberRead,
		PermRoleRead,
		PermAuditRead,
		PermUserReadSelf,
		PermIngestionImport,
		PermIngestionRead,
		PermIngestionSync,
		PermBankAccountCreate,
		PermBankAccountRead,
	},
	"accountant_readonly": {
		PermTenantRead,
		PermMemberRead,
		PermRoleRead,
		PermUserReadSelf,
		PermIngestionRead,
		PermBankAccountRead,
	},
}

// ResolvePermissions returns all permissions granted by the given roles.
func ResolvePermissions(roles []string) []Permission {
	seen := make(map[Permission]struct{})
	var perms []Permission
	for _, role := range roles {
		for _, p := range RolePermissions[role] {
			if _, ok := seen[p]; !ok {
				seen[p] = struct{}{}
				perms = append(perms, p)
			}
		}
	}
	return perms
}

// HasPermission checks whether the given set of permissions includes the target.
func HasPermission(perms []Permission, target Permission) bool {
	for _, p := range perms {
		if p == target {
			return true
		}
	}
	return false
}
