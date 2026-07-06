function isNativeApp() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}

function defaultApiUrl() {
  // Servidor customizado salvo pelo usuário (usado no APK)
  const saved = localStorage.getItem("apiUrl");
  if (saved) return saved.replace(/\/+$/, "");
  // Em desenvolvimento (vite dev server), backend local
  if (import.meta.env.DEV) return "http://localhost:4000";
  // APK (Capacitor): usa a URL embutida no build ou pede configuração
  if (isNativeApp()) return import.meta.env.VITE_API_URL || "";
  // Web em produção (servido pelo próprio backend): mesma origem
  return window.location.origin;
}

export const API_URL = defaultApiUrl();

export function setApiUrl(url) {
  if (url) localStorage.setItem("apiUrl", url.trim().replace(/\/+$/, ""));
  else localStorage.removeItem("apiUrl");
  window.location.reload();
}

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  if (!API_URL) {
    throw new Error("Servidor não configurado. Toque em 'Configurar servidor' na tela de login.");
  }
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const err = new Error((data && data.error) || `Erro na requisição (${res.status})`);
    if (data) Object.assign(err, data);
    throw err;
  }
  return data;
}

export const api = {
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  verify: (email, code) => request("/api/auth/verify", { method: "POST", body: { email, code } }),
  resendCode: (email) => request("/api/auth/resend", { method: "POST", body: { email } }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  me: () => request("/api/auth/me"),
  updateProfile: (formData) =>
    request("/api/auth/me", { method: "PUT", body: formData, isFormData: true }),

  getFeed: (scope = "all") => request(`/api/posts?scope=${scope}`),
  getPost: (id) => request(`/api/posts/${id}`),
  createPost: (formData) =>
    request("/api/posts", { method: "POST", body: formData, isFormData: true }),
  deletePost: (id) => request(`/api/posts/${id}`, { method: "DELETE" }),
  likePost: (id) => request(`/api/posts/${id}/like`, { method: "POST" }),
  unlikePost: (id) => request(`/api/posts/${id}/like`, { method: "DELETE" }),
  addComment: (id, text) =>
    request(`/api/posts/${id}/comments`, { method: "POST", body: { text } }),

  getProfile: (username) => request(`/api/users/${username}`),
  follow: (id) => request(`/api/users/${id}/follow`, { method: "POST" }),
  unfollow: (id) => request(`/api/users/${id}/follow`, { method: "DELETE" }),
  getFollowers: (id) => request(`/api/users/${id}/followers`),
  getFollowing: (id) => request(`/api/users/${id}/following`),
};

export function fileUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${API_URL}${pathOrUrl}`;
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}
