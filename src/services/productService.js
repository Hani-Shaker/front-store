// src/services/productService.js

// تحديد الـ API URL تلقائياً
const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return 'https://back-store-two.vercel.app';
};

const API_URL = getApiUrl();
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

// ✅ دالة عام للـ fetch مع timeout و retry
const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.status === 404) {
      throw new Error('المورد غير موجود');
    }

    if (response.status === 500) {
      throw new Error('خطأ في السيرفر');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeout);

    if (error.name === 'AbortError') {
      if (retries > 0) {
        console.warn(`⏱️ Timeout - Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw new Error('انتهت مهلة الانتظار - تحقق من الاتصال');
    }

    if (retries > 0) {
      console.warn(`🔄 Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      return fetchWithRetry(url, options, retries - 1);
    }

    throw error;
  }
};

export const productService = {
  // ✅ جلب جميع المنتجات
  getAll: async () => {
    try {
      console.log('📦 Fetching all products...');
      const response = await fetchWithRetry(`${API_URL}/api/products`);
      const data = await response.json();
      console.log('✅ Products loaded:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error fetching products:', error.message);
      throw new Error(`فشل تحميل المنتجات: ${error.message}`);
    }
  },

  // ✅ جلب منتج واحد
  getById: async (id) => {
    if (!id) throw new Error('Product ID is required');

    try {
      console.log(`📦 Fetching product: ${id}`);
      const response = await fetchWithRetry(`${API_URL}/api/products/${id}`);
      const data = await response.json();
      console.log('✅ Product loaded:', data.name);
      return data;
    } catch (error) {
      console.error('❌ Error fetching product:', error.message);
      throw new Error(`فشل تحميل المنتج: ${error.message}`);
    }
  },

  // ✅ إنشاء منتج جديد
  create: async (productData) => {
    // التحقق من البيانات المطلوبة
    if (!productData.name || !productData.price) {
      throw new Error('الاسم والسعر مطلوبان');
    }

    try {
      console.log('➕ Creating product:', productData.name);
      const response = await fetchWithRetry(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await response.json();
      console.log('✅ Product created:', data._id);
      return data;
    } catch (error) {
      console.error('❌ Error creating product:', error.message);
      throw new Error(`فشل إنشاء المنتج: ${error.message}`);
    }
  },

  // ✅ تحديث منتج
  update: async (id, productData) => {
    if (!id) throw new Error('Product ID is required');

    try {
      console.log(`✏️ Updating product: ${id}`);
      const response = await fetchWithRetry(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await response.json();
      console.log('✅ Product updated:', data.name);
      return data;
    } catch (error) {
      console.error('❌ Error updating product:', error.message);
      throw new Error(`فشل تحديث المنتج: ${error.message}`);
    }
  },

  // ✅ حذف منتج
  delete: async (id) => {
    if (!id) throw new Error('Product ID is required');

    try {
      console.log(`🗑️ Deleting product: ${id}`);
      const response = await fetchWithRetry(`${API_URL}/api/products/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      console.log('✅ Product deleted');
      return data;
    } catch (error) {
      console.error('❌ Error deleting product:', error.message);
      throw new Error(`فشل حذف المنتج: ${error.message}`);
    }
  }
};
