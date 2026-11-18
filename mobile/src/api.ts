import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from './config';

const KEY = 'govmatch-token';
const web = Platform.OS === 'web';
export const getToken = async () => (web ? localStorage.getItem(KEY) : SecureStore.getItemAsync(KEY));
export const setToken = async (t: string) => { if (web) localStorage.setItem(KEY, t); else await SecureStore.setItemAsync(KEY, t); };
export const clearToken = async () => { if (web) localStorage.removeItem(KEY); else await SecureStore.deleteItemAsync(KEY); };

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: T }> {
  const token = await getToken();
  const res = await fetch(API_URL + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(init.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: data as T };
}

export async function login(email: string, password: string) {
  const r = await api<{ token?: string; user?: { id: string; name: string | null; email: string }; message?: string }>('/api/mobile/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (r.ok && r.data.token) await setToken(r.data.token);
  return r;
}
