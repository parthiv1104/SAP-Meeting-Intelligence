const getDynamicApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  return `http://${host}:8000/api`;
};

export const API_BASE_URL = getDynamicApiBaseUrl();


export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = localStorage.getItem('auth_token');
  const msAccessToken = sessionStorage.getItem('ms_access_token');
  const authHeaders = {
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
    ...(msAccessToken ? { 'X-MS-Access-Token': msAccessToken } : {}),
  };

  // Don't set Content-Type header if body is FormData (browser will set multipart boundary automatically)
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...authHeaders,
    ...options.headers,
  };


  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.error || errorJson.message || JSON.stringify(errorJson);
    } catch {
      const errorText = await response.text();
      if (errorText) errorMsg = errorText;
    }
    throw new Error(errorMsg || `API Error ${response.status}`);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  if (!text || !text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
