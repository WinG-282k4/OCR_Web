/**
 * API Client — UIBuilder Frontend
 * Connects to Django Backend at localhost:8000
 * Auto-injects JWT Bearer token + handles 401 refresh
 */

import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearAuth,
} from './auth';
import type {
  BEProject,
  BEScreen,
  BEComponent,
  User,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token');

  const res = await fetch(`${API_BASE}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearAuth();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await res.json();
  saveTokens(data.access, refresh);
  return data.access;
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  isFormData = false
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, { ...options, headers });

  // 401 → try refresh once
  if (response.status === 401 && token) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) =>
        apiFetch<T>(endpoint, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        }, isFormData)
      );
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);
      return apiFetch<T>(endpoint, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      }, isFormData);
    } catch (err) {
      processQueue(err, null);
      // Redirect to login
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    let errData: any;
    try {
      errData = await response.json();
    } catch {
      errData = { error: `HTTP ${response.status}` };
    }
    const msg =
      errData?.detail ||
      errData?.error ||
      errData?.message ||
      `Request failed: ${response.status}`;
    throw new Error(msg);
  }

  // 204 No Content
  if (response.status === 204) return {} as T;

  return response.json() as Promise<T>;
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data: RegisterRequest) =>
    apiFetch<{ user: User; tokens: AuthTokens; message: string }>(
      '/auth/register/',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  login: (data: LoginRequest) =>
    apiFetch<{ user: User; tokens: AuthTokens; message: string }>(
      '/auth/login/',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  logout: (refreshToken: string) =>
    apiFetch<{ message: string }>('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  me: () => apiFetch<User>('/auth/me/', { method: 'GET' }),

  refreshToken: (refresh: string) =>
    apiFetch<{ access: string }>('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiFetch<{ message: string; tokens: AuthTokens }>(
      '/auth/change-password/',
      {
        method: 'POST',
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      }
    ),
};

// ─── Projects API ────────────────────────────────────────────────────────────

export const projectsAPI = {
  list: (limit = 20, offset = 0) =>
    apiFetch<{ count: number; results: BEProject[] }>(
      `/projects/?limit=${limit}&offset=${offset}`,
      { method: 'GET' }
    ),

  get: (projectId: string) =>
    apiFetch<BEProject>(`/projects/${projectId}/`, { method: 'GET' }),

  create: (data: { name: string; description?: string; theme?: Record<string, string>; tags?: string[] }) =>
    apiFetch<BEProject>('/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (projectId: string, data: Partial<BEProject>) =>
    apiFetch<BEProject>(`/projects/${projectId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (projectId: string) =>
    apiFetch<void>(`/projects/${projectId}/`, { method: 'DELETE' }),

  export: (
    projectId: string,
    options: { format?: string; include_navigation?: boolean; screens?: string[] } = {}
  ) =>
    apiFetch<any>(`/projects/${projectId}/export/`, {
      method: 'POST',
      body: JSON.stringify(options),
    }),
};

// ─── Screens API ─────────────────────────────────────────────────────────────

export const screensAPI = {
  list: (projectId: string) =>
    apiFetch<{ count: number; results: BEScreen[] }>(
      `/projects/${projectId}/screens/`,
      { method: 'GET' }
    ),

  get: (projectId: string, screenId: string) =>
    apiFetch<BEScreen>(
      `/projects/${projectId}/screens/${screenId}/`,
      { method: 'GET' }
    ),

  create: (projectId: string, data: { name: string; width?: number; height?: number; components?: BEComponent[] }) =>
    apiFetch<{ screen: BEScreen; message: string }>(
      `/projects/${projectId}/screens/`,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  /**
   * Save components for a screen (creates a new version automatically)
   */
  updateComponents: (
    projectId: string,
    screenId: string,
    components: BEComponent[],
    versionDescription = 'Manual edit'
  ) =>
    apiFetch<{ screen: BEScreen; message: string }>(
      `/projects/${projectId}/screens/${screenId}/update_components/`,
      {
        method: 'POST',
        body: JSON.stringify({
          components,
          create_version: true,
          version_description: versionDescription,
        }),
      }
    ),

  update: (projectId: string, screenId: string, data: Partial<BEScreen>) =>
    apiFetch<{ screen: BEScreen; message: string }>(
      `/projects/${projectId}/screens/${screenId}/`,
      { method: 'PATCH', body: JSON.stringify(data) }
    ),

  delete: (projectId: string, screenId: string) =>
    apiFetch<void>(`/projects/${projectId}/screens/${screenId}/`, { method: 'DELETE' }),

  duplicate: (projectId: string, screenId: string, newName: string) =>
    apiFetch<{ screen: BEScreen; message: string }>(
      `/projects/${projectId}/screens/${screenId}/duplicate/`,
      { method: 'POST', body: JSON.stringify({ new_name: newName }) }
    ),

  export: (projectId: string, screenId: string, format = 'html') =>
    apiFetch<{ format: string; code: string; filename: string }>(
      `/projects/${projectId}/screens/${screenId}/export/?format=${format}`,
      { method: 'GET' }
    ),
};

// ─── OCR API ─────────────────────────────────────────────────────────────────

export const ocrAPI = {
  /**
   * Upload image → BE calls Nanonets → creates Screen automatically
   */
  upload: async (
    projectId: string,
    imageFile: File,
    screenName?: string,
    confidence = 0.7
  ) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('confidence_threshold', confidence.toString());
    if (screenName) formData.append('screen_name', screenName);
    formData.append('auto_create_screen', 'true');

    return apiFetch<{
      ocr_analysis: { id: string; status: string };
      screen?: { id: string; name: string };
      message: string;
    }>(
      `/projects/${projectId}/ocr/upload/`,
      { method: 'POST', body: formData },
      true // isFormData
    );
  },

  getStatus: (projectId: string, ocrId: string) =>
    apiFetch<{ status: string; progress: number; message: string; component_count?: number }>(
      `/projects/${projectId}/ocr/${ocrId}/status/`,
      { method: 'GET' }
    ),

  listHistory: (projectId: string) =>
    apiFetch<any[]>(`/projects/${projectId}/ocr/`, { method: 'GET' }),
};

// ─── Versions API ────────────────────────────────────────────────────────────

export const versionsAPI = {
  list: (projectId: string, screenId: string) =>
    apiFetch<{ versions: any[] }>(
      `/projects/${projectId}/screens/${screenId}/versions/`,
      { method: 'GET' }
    ),

  restore: (projectId: string, screenId: string, versionNumber: number) =>
    apiFetch<any>(
      `/projects/${projectId}/screens/${screenId}/restore/${versionNumber}/`,
      { method: 'POST' }
    ),
};

// ─── Members API ─────────────────────────────────────────────────────────────

export const membersAPI = {
  list: (projectId: string) =>
    apiFetch<{ count: number; results: any[] }>(
      `/projects/${projectId}/members/`,
      { method: 'GET' }
    ),

  invite: (projectId: string, userEmail: string, role: 'editor' | 'viewer') =>
    apiFetch<any>(`/projects/${projectId}/members/`, {
      method: 'POST',
      body: JSON.stringify({ user_email: userEmail, role }),
    }),
};

// ─── Health API ──────────────────────────────────────────────────────────────

export const healthAPI = {
  check: () => apiFetch<{ status: string; version?: string; database?: string }>('/health/', { method: 'GET' }),
};

// ─── Default export ──────────────────────────────────────────────────────────

export default {
  auth: authAPI,
  projects: projectsAPI,
  screens: screensAPI,
  ocr: ocrAPI,
  versions: versionsAPI,
  members: membersAPI,
  health: healthAPI,
};
