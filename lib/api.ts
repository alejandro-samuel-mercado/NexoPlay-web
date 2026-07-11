// API base URL for NexoPlay
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const API = {
  AUTH: {
    LOGIN: `${API_BASE}/api/auth/login`,
    REGISTER: `${API_BASE}/api/auth/register`,
    REFRESH: `${API_BASE}/api/auth/refresh`,
    LOGOUT: `${API_BASE}/api/auth/logout`,
    ME: `${API_BASE}/api/auth/me`,
  },
  CONTENT: {
    BASE: `${API_BASE}/api/content`,
    CONFIG: `${API_BASE}/api/content/config`,
    FEATURED: `${API_BASE}/api/content/featured`,
    TRENDING: `${API_BASE}/api/content/trending`,
    RECENT: `${API_BASE}/api/content/recent`,
    GENRES: `${API_BASE}/api/content/genres`,
    TYPES: `${API_BASE}/api/content/types`,
    DETAIL: (id: string) => `${API_BASE}/api/content/${id}`,
    PREVIEW: (id: string) => `${API_BASE}/api/content/${id}/preview`,
  },
  DOWNLOADS: {
    REDEEM: `${API_BASE}/api/downloads/redeem`,
    DOWNLOAD: (contentId: string) => `${API_BASE}/api/downloads/content/${contentId}`,
    HISTORY: `${API_BASE}/api/downloads/history`,
    LIBRARY: `${API_BASE}/api/downloads/library`,
  },
  ADMIN: {
    DASHBOARD: `${API_BASE}/api/admin/dashboard`,
    USERS: `${API_BASE}/api/admin/users`,
    USER: (id: string) => `${API_BASE}/api/admin/users/${id}`,
    USER_SUB: (id: string) => `${API_BASE}/api/admin/users/${id}/subscription`,
    PLANS: `${API_BASE}/api/admin/plans`,
    PLAN: (id: string) => `${API_BASE}/api/admin/plans/${id}`,
    CODES: `${API_BASE}/api/admin/codes`,
    CODE: (id: string) => `${API_BASE}/api/admin/codes/${id}`,
    CONTENT: `${API_BASE}/api/admin/content`,
    CONTENT_VISIBILITY: (id: string) => `${API_BASE}/api/admin/content/${id}/visibility`,
    CONFIG: `${API_BASE}/api/admin/config`,
  },
  MYLIST: `${API_BASE}/api/mylist`,
  TOKENS: {
    WALLET: `${API_BASE}/api/tokens/wallet`,
    HISTORY: `${API_BASE}/api/tokens/history`,
    PACKAGES: `${API_BASE}/api/tokens/packages`,
    GIFT_SUBSCRIPTION: `${API_BASE}/api/tokens/gift-subscription`,
    REWARD_WATCH: `${API_BASE}/api/tokens/reward/watch`,
    WEEKLY_PACK: `${API_BASE}/api/tokens/weekly-pack`,
    ADMIN_GRANT: `${API_BASE}/api/tokens/admin/grant`,
    ADMIN_DEDUCT: `${API_BASE}/api/tokens/admin/deduct`,
    ADMIN_PACKAGES: `${API_BASE}/api/tokens/admin/packages`,
    ADMIN_PACKAGE: (id: string) => `${API_BASE}/api/tokens/admin/packages/${id}`,
    ADMIN_WEEKLY_PACK: `${API_BASE}/api/tokens/admin/weekly-pack`,
  },

  PROFILES: {
    list: async () => fetchAPI('/api/profiles'),
    create: async (data: { name: string; avatarUrl?: string; isKids?: boolean; pinCode?: string }) =>
      fetchAPI('/api/profiles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: async (id: string, data: Partial<{ name: string; avatarUrl: string; isKids: boolean; pinCode: string }>) =>
      fetchAPI(`/api/profiles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (id: string) =>
      fetchAPI(`/api/profiles/${id}`, { method: 'DELETE' }),
  },

  ADS: {
    active: async (countryCode?: string) => 
      fetchAPI(`/api/ads/active${countryCode ? `?country=${countryCode}` : ''}`),
    impression: async (data: { campaignId: string; userId?: string; deviceType?: string }) =>
      fetchAPI('/api/ads/impression', { method: 'POST', body: JSON.stringify(data) }),
    click: async (data: { campaignId: string; userId?: string }) =>
      fetchAPI('/api/ads/click', { method: 'POST', body: JSON.stringify(data) }),
    admin: {
      stats: async () => fetchAPI('/api/ads/admin/stats'),
      create: async (data: any) => fetchAPI('/api/ads/admin/campaigns', { method: 'POST', body: JSON.stringify(data) }),
    },
  },

  PUBLIC_API: {
    listKeys: async () => fetchAPI('/api/public/keys'),
    createKey: async (name: string) => fetchAPI('/api/public/keys', { method: 'POST', body: JSON.stringify({ name }) }),
    revokeKey: async (id: string) => fetchAPI(`/api/public/keys/${id}`, { method: 'DELETE' }),
  },
};

// Fetch wrapper with auth
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nexo_access_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Error en la solicitud');
  }
  return res.json();
}
