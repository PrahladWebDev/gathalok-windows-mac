import axios from 'axios';

// Same contract as the RN app's src/api/client.js — server URL settable at
// runtime, persisted on-device — just backed by localStorage instead of
// AsyncStorage (both are simple async-ish key/value stores).
export const DEFAULT_BASE_URL = 'https://api.gathalok.prahladsingh.in';
const STORAGE_KEY = 'gathalok_api_base_url';
const TOKEN_KEY = 'gathalok_token';
const USER_KEY = 'gathalok_user';

let cachedBaseURL = null;

export async function getBaseURL() {
  if (cachedBaseURL) return cachedBaseURL;
  const stored = localStorage.getItem(STORAGE_KEY);
  cachedBaseURL = stored || DEFAULT_BASE_URL;
  return cachedBaseURL;
}

export async function setBaseURL(url) {
  const trimmed = url.trim().replace(/\/+$/, '');
  cachedBaseURL = trimmed;
  localStorage.setItem(STORAGE_KEY, trimmed);
  return trimmed;
}

export async function testConnection(url) {
  const base = (url || (await getBaseURL())).trim().replace(/\/+$/, '');
  const resp = await axios.get(`${base}/api/health`, { timeout: 6000 });
  return resp.data;
}

const api = axios.create({ timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const base = await getBaseURL();
  config.baseURL = `${base}/api`;
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err?.response?.data;
    const message = data?.message || err.message || 'Something went wrong';
    const wrapped = new Error(message);
    wrapped.status = err?.response?.status;
    wrapped.notVerified = !!data?.notVerified;
    wrapped.requiresVerification = !!data?.requiresVerification;
    wrapped.email = data?.email;
    return Promise.reject(wrapped);
  }
);

export default api;
export { TOKEN_KEY, USER_KEY };
