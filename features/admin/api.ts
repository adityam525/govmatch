const API_BASE = '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const adminApi = {
  list: <T>(entity: string, params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request<T[]>(`/${entity}${query}`);
  },

  getById: <T>(entity: string, id: string) => request<T>(`/${entity}/${id}`),

  create: <T>(entity: string, data: Partial<T>) =>
    request<T>(`/${entity}`, { method: 'POST', body: JSON.stringify(data) }),

  update: <T>(entity: string, id: string, data: Partial<T>) =>
    request<T>(`/${entity}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  remove: (entity: string, id: string) =>
    request<void>(`/${entity}/${id}`, { method: 'DELETE' }),
};
