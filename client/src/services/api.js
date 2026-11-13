const BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => {
  try { return JSON.parse(localStorage.getItem('nr_auth'))?.token || null; } catch { return null; }
};

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  } catch {
    throw new Error('Unable to connect to server.');
  }
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }

  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event('auth-expired'));
    throw new Error(data?.message || 'Something went wrong.');
  }
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' }),
  postForm: (p, form) => request(p, { method: 'POST', form }),
  putForm: (p, form) => request(p, { method: 'PUT', form }),
};
