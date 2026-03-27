import api from "./api";

export type AdminTeamRole = "admin" | "gerente" | "tecnico" | "user";

export interface AdminTeamMember {
  id: string;
  email: string;
  name: string;
  role: AdminTeamRole;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  module_overrides?: Record<string, boolean>;
  has_module_overrides?: boolean;
}

export interface AdminModule {
  key: string;
  label: string;
}

export interface ModulePermissions {
  effective: string[];
  overrides: Record<string, boolean>;
  role: AdminTeamRole;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const ROLE_LABELS: Record<AdminTeamRole, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  tecnico: "Técnico",
  user: "Usuário",
};

export const getRoleLabel = (role: AdminTeamRole) => ROLE_LABELS[role] || role;

export const adminTeamService = {
  async getAll(): Promise<AdminTeamMember[]> {
    const res = await api.get<ApiResponse<AdminTeamMember[]>>("/admin-team");
    if (res.data?.success && res.data.data) return res.data.data;
    return [];
  },

  async getById(id: string): Promise<AdminTeamMember | null> {
    const res = await api.get<ApiResponse<AdminTeamMember & { module_overrides?: Record<string, boolean> }>>(
      `/admin-team/${id}`
    );
    if (res.data?.success && res.data.data) return res.data.data as AdminTeamMember;
    return null;
  },

  async getModules(): Promise<AdminModule[]> {
    const res = await api.get<ApiResponse<AdminModule[]>>("/admin-team/modules");
    if (res.data?.success && res.data.data) return res.data.data;
    return [];
  },

  async getDefaultModulesForRole(role: AdminTeamRole): Promise<string[]> {
    const res = await api.get<ApiResponse<string[]>>(`/admin-team/modules/default-for-role/${role}`);
    if (res.data?.success && Array.isArray(res.data.data)) return res.data.data;
    return [];
  },

  async getModulePermissions(id: string): Promise<ModulePermissions | null> {
    const res = await api.get<ApiResponse<ModulePermissions>>(`/admin-team/${id}/module-permissions`);
    if (res.data?.success && res.data.data) return res.data.data;
    return null;
  },

  async create(data: { email: string; password: string; name: string; role: AdminTeamRole }): Promise<AdminTeamMember> {
    const res = await api.post<ApiResponse<AdminTeamMember>>("/admin-team", data);
    if (!res.data?.success || !res.data.data) throw new Error(res.data?.error || "Erro ao criar usuário");
    return res.data.data;
  },

  async update(
    id: string,
    data: { name?: string; email?: string; role?: AdminTeamRole }
  ): Promise<AdminTeamMember> {
    const res = await api.put<ApiResponse<AdminTeamMember>>(`/admin-team/${id}`, data);
    if (!res.data?.success || !res.data.data) throw new Error(res.data?.error || "Erro ao atualizar usuário");
    return res.data.data;
  },

  async updateStatus(id: string, active: boolean): Promise<AdminTeamMember> {
    const res = await api.put<ApiResponse<AdminTeamMember>>(`/admin-team/${id}/status`, { active });
    if (!res.data?.success || !res.data.data) throw new Error(res.data?.error || "Erro ao alterar status");
    return res.data.data;
  },

  async setPassword(id: string, newPassword: string): Promise<void> {
    const res = await api.put<ApiResponse<null>>(`/admin-team/${id}/password`, { newPassword });
    if (!res.data?.success) throw new Error(res.data?.error || "Erro ao definir senha");
  },

  async setModuleOverrides(id: string, overrides: Record<string, boolean>): Promise<void> {
    const res = await api.put<ApiResponse<null>>(`/admin-team/${id}/module-overrides`, { overrides });
    if (!res.data?.success) throw new Error(res.data?.error || "Erro ao atualizar módulos");
  },

  async delete(id: string): Promise<void> {
    const res = await api.delete<ApiResponse<null>>(`/admin-team/${id}`);
    if (!res.data?.success) throw new Error(res.data?.error || "Erro ao remover usuário");
  },

  async duplicate(
    id: string,
    data: { email: string; name: string; password: string }
  ): Promise<AdminTeamMember> {
    const res = await api.post<ApiResponse<AdminTeamMember>>(`/admin-team/${id}/duplicate`, data);
    if (!res.data?.success || !res.data.data) throw new Error(res.data?.error || "Erro ao duplicar");
    return res.data.data;
  },
};
