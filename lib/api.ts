// API base URL for Vexa
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
    DOWNLOAD: (contentId: string, lang = '') => `${API_BASE}/api/downloads/content/${contentId}${lang ? '?audio=' + encodeURIComponent(lang) : ''}`,
    HISTORY: `${API_BASE}/api/downloads/history`,
    LIBRARY: `${API_BASE}/api/downloads/library`,
  },
  ADMIN: {
    DASHBOARD: `${API_BASE}/api/admin/dashboard`,
    USERS: `${API_BASE}/api/admin/users`,
    USER: (id: string) => `${API_BASE}/api/admin/users/${id}`,
    USER_SUB: (id: string) => `${API_BASE}/api/admin/users/${id}/subscription`,
    SUBSCRIPTIONS: `${API_BASE}/api/admin/subscriptions`,
    SUBSCRIPTION: (id: string) => `${API_BASE}/api/admin/subscriptions/${id}`,
    PLANS: `${API_BASE}/api/admin/plans`,
    CODES: `${API_BASE}/api/admin/codes`,
    CODE: (id: string) => `${API_BASE}/api/admin/codes/${id}`,
    CONTENT: `${API_BASE}/api/admin/content`,
    CONTENT_VISIBILITY: (id: string) => `${API_BASE}/api/admin/content/${id}/visibility`,
    CONFIG: `${API_BASE}/api/admin/config`,
  },
  SOCIAL_ADMIN: {
    METRICS: `${API_BASE}/api/social/admin/metrics`,
    SUGGESTIONS: `${API_BASE}/api/social/suggestions/admin`,
    SUGGESTION: (id: string) => `${API_BASE}/api/social/suggestions/${id}/status`,
    MODERATION_POSTS: `${API_BASE}/api/social/admin/moderation/posts`,
    MODERATION_DELETE_POST: (id: string) => `${API_BASE}/api/social/posts/${id}`,
    RULES: `${API_BASE}/api/social/tokens/rules`,
    RULE: (id: string) => `${API_BASE}/api/social/tokens/rules/${id}`,
    GOALS: `${API_BASE}/api/social/tokens/goals`,
    GOAL: (id: string) => `${API_BASE}/api/social/tokens/goals/${id}`,
    REDEMPTIONS: `${API_BASE}/api/social/admin/redemptions`,
  },
  MYLIST: `${API_BASE}/api/mylist`,
  TOKENS: {
    WALLET: `${API_BASE}/api/tokens/wallet`,
    HISTORY: `${API_BASE}/api/tokens/history`,
    PACKAGES: `${API_BASE}/api/tokens/packages`,
    BUY_SUBSCRIPTION: `${API_BASE}/api/tokens/buy-subscription`,
    REWARD_WATCH: `${API_BASE}/api/tokens/reward/watch`,
    WEEKLY_PACK: `${API_BASE}/api/tokens/weekly-pack`,
    ADMIN_GRANT: `${API_BASE}/api/tokens/admin/grant`,
    ADMIN_DEDUCT: `${API_BASE}/api/tokens/admin/deduct`,
    ADMIN_PACKAGES: `${API_BASE}/api/tokens/admin/packages`,
    ADMIN_PACKAGE: (id: string) => `${API_BASE}/api/tokens/admin/packages/${id}`,
    ADMIN_WEEKLY_PACK: `${API_BASE}/api/tokens/admin/weekly-pack`,
  },

  PROFILES: {
    list: async () => apiFetch(`${API_BASE}/api/profiles`),
    create: async (data: { name: string; avatarUrl?: string; pinCode?: string }) =>
      apiFetch(`${API_BASE}/api/profiles`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: async (id: string, data: Partial<{ name: string; avatarUrl: string; pinCode: string }>) =>
      apiFetch(`${API_BASE}/api/profiles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (id: string) =>
      apiFetch(`${API_BASE}/api/profiles/${id}`, { method: 'DELETE' }),
    switch: async (id: string) => 
      apiFetch(`${API_BASE}/api/profiles/${id}/switch`, { method: 'POST' }),
  },

  ADS: {
    active: async (countryCode?: string) => 
      apiFetch(`${API_BASE}/api/ads/active${countryCode ? `?country=${countryCode}` : ''}`),
    impression: async (data: { campaignId: string; userId?: string; deviceType?: string }) =>
      apiFetch(`${API_BASE}/api/ads/impression`, { method: 'POST', body: JSON.stringify(data) }),
    click: async (data: { campaignId: string; userId?: string }) =>
      apiFetch(`${API_BASE}/api/ads/click`, { method: 'POST', body: JSON.stringify(data) }),
    reward: async (data: { campaignId: string }) =>
      apiFetch(`${API_BASE}/api/ads/reward`, { method: 'POST', body: JSON.stringify(data) }),
    admin: {
      stats: async () => apiFetch(`${API_BASE}/api/ads/admin/stats`),
      create: async (data: any) => apiFetch(`${API_BASE}/api/ads/admin/campaigns`, { method: 'POST', body: JSON.stringify(data) }),
    },
  },

  PUBLIC_API: {
    listKeys: async () => apiFetch(`${API_BASE}/api/public/keys`),
    createKey: async (name: string) => apiFetch(`${API_BASE}/api/public/keys`, { method: 'POST', body: JSON.stringify({ name }) }),
    revokeKey: async (id: string) => apiFetch(`${API_BASE}/api/public/keys/${id}`, { method: 'DELETE' }),
  },

  TENANT: {
    getSettings: async () => apiFetch(`${API_BASE}/api/tenants/mine`),
    updateSettings: async (data: Partial<{ appName: string; primaryColor: string; logoUrl: string; subdomain: string }>) => 
      apiFetch(`${API_BASE}/api/tenants/mine`, { method: 'PUT', body: JSON.stringify(data) }),
    getDashboard: async () => apiFetch(`${API_BASE}/api/tenants/mine/dashboard`),
  },

  RESELLER: {
    getWeeklyPack: async () => apiFetch(`${API_BASE}/api/reseller/pack/weekly`, { method: 'POST' }),
    buyLimits: async (amount: number) => apiFetch(`${API_BASE}/api/reseller/buy-limits`, { method: 'POST', body: JSON.stringify({ amount }) }),
  }
};

// Fetch wrapper with auth
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nexo_access_token') : null;
  const activeProfileId = typeof window !== 'undefined' ? localStorage.getItem('nexo_active_profile_id') : null;
  const domain = typeof window !== 'undefined' ? window.location.hostname : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(activeProfileId ? { 'x-profile-id': activeProfileId } : {}),
    ...(domain ? { 'x-tenant-domain': domain } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const error = new Error(err.error || 'Error en la solicitud') as any;
    error.status = res.status;
    throw error;
  }
  return res.json();
}
