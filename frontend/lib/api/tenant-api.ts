import { tenantApi } from "./client";
import type {
  ApiResponse,
  ApiListResponse,
  Tenant,
  CreateTenantInput,
  User,
  Membership,
  AddMemberInput,
  ChangeMemberRoleInput,
  AuditLog,
} from "./types";

export async function getProfile(): Promise<ApiResponse<User>> {
  return tenantApi.get("/me");
}

export async function listTenants(): Promise<ApiListResponse<Tenant>> {
  return tenantApi.get("/tenants");
}

export async function getTenant(id: string): Promise<ApiResponse<Tenant>> {
  return tenantApi.get(`/tenants/${id}`);
}

export async function createTenant(
  input: CreateTenantInput
): Promise<ApiResponse<Tenant>> {
  return tenantApi.post("/tenants", input);
}

export async function listMembers(
  tenantId: string,
  limit = 20,
  offset = 0
): Promise<ApiListResponse<Membership>> {
  return tenantApi.get(`/tenants/${tenantId}/members`, {
    limit: String(limit),
    offset: String(offset),
  });
}

export async function addMember(
  tenantId: string,
  input: AddMemberInput
): Promise<ApiResponse<Membership>> {
  return tenantApi.post(`/tenants/${tenantId}/members`, input);
}

export async function removeMember(
  tenantId: string,
  membershipId: string
): Promise<void> {
  return tenantApi.delete(`/tenants/${tenantId}/members/${membershipId}`);
}

export async function changeMemberRole(
  tenantId: string,
  input: ChangeMemberRoleInput
): Promise<ApiResponse<Membership>> {
  return tenantApi.post(`/tenants/${tenantId}/roles`, input);
}

export async function listAuditLogs(
  limit = 20,
  offset = 0
): Promise<ApiListResponse<AuditLog>> {
  return tenantApi.get("/audit-logs", {
    limit: String(limit),
    offset: String(offset),
  });
}
