// طبقة موحّدة للتعامل مع الـ API
const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_URL = (
  import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:5000' : 'https://back-store-two.vercel.app')
).replace(/\/$/, '');

const TOKEN_KEY = 'adminToken';

export const auth = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } },
};

const TIMEOUT = 15000;

/**
 * api('/api/products', { method, body, admin })
 * - admin: true => يبعت Authorization header
 * - بيرجّع JSON، وبيرمي Error برسالة عربية مفهومة
 */
export async function api(path, { method = 'GET', body, admin = false } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (admin) headers.Authorization = `Bearer ${auth.get() || ''}`;

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 401 && admin) {
        auth.clear();
        window.dispatchEvent(new Event('admin-unauthorized'));
      }
      const err = new Error(data?.message || `خطأ ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('انتهت مهلة الانتظار، تحقق من الاتصال');
    if (e instanceof TypeError) throw new Error('تعذر الاتصال بالسيرفر');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
