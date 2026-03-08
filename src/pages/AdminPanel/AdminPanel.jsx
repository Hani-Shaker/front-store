import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService.js';
import './AdminPanel.css';

function AdminPanel() {
  const navigate = useNavigate();
  
  // ✅ Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // ✅ Admin Panel State
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // ✅ Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'إلكترونيات',
    stock: '',
    colors: ['#000000']
  });

  // ✅ عند تحميل الصفحة - تحقق من التوثيق
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token === 'authenticated') {
      setIsAdminLoggedIn(true);
    }
    setPageLoading(false);
  }, []);

  // ✅ جلب المنتجات عند تسجيل الدخول
  useEffect(() => {
    if (isAdminLoggedIn) {
      loadProducts();
    }
  }, [isAdminLoggedIn]);

  // ✅ رسائل النجاح والخطأ
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ✅ API URL
  const getApiUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return 'https://back-store-two.vercel.app';
  };

  // ✅ جلب المنتجات
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('فشل تحميل المنتجات');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ تسجيل الدخول
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const API_URL = getApiUrl();
      const password = e.target.password?.value || '';

      const response = await fetch(`${API_URL}/api/admin/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const data = await response.json();

      if (data.authenticated) {
        localStorage.setItem('adminToken', 'authenticated');
        setIsAdminLoggedIn(true);
        setSuccess('تم تسجيل الدخول بنجاح ✅');
      } else {
        setError(data.message || 'كلمة السر خاطئة!');
        e.target.password.value = '';
      }
    } catch (err) {
      clearTimeout(timeout);
      
      if (err.name === 'AbortError') {
        setError('انتهت مهلة الانتظار - تأكد من الاتصال');
      } else {
        console.error('Login error:', err);
        setError('فشل الاتصال بالسيرفر');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminLoggedIn(false);
    setProducts([]);
    setSuccess('تم تسجيل الخروج');
    navigate('/admin');
  };

  // ✅ معالج الأخطاء
  const showError = (message) => {
    setError(message);
  };

  const showSuccess = (message) => {
    setSuccess(message);
  };

  // ✅ حقل الإدخال
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ إدارة الألوان
  const handleColorChange = (index, value) => {
    const newColors = [...formData.colors];
    newColors[index] = value;
    setFormData(prev => ({
      ...prev,
      colors: newColors
    }));
  };

  const addColor = () => {
    if (formData.colors.length < 10) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, '#000000']
      }));
    }
  };

  const removeColor = (index) => {
    if (formData.colors.length > 1) {
      setFormData(prev => ({
        ...prev,
        colors: prev.colors.filter((_, i) => i !== index)
      }));
    }
  };

  // ✅ رفع الصورة إلى Cloudinary
  async function uploadImage() {
    const file = document.getElementById("imageUpload")?.files[0];
    if (!file) {
      setError('اختر صورة أولاً');
      return;
    }

    setUploading(true);
    
    try {
      const dataForm = new FormData();
      dataForm.append("file", file);
      dataForm.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "lolo-store");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: dataForm
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        setFormData({
          ...formData,
          image: data.secure_url
        });
        showSuccess("تم رفع الصورة ✅");
      } else {
        showError("خطأ في رفع الصورة");
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  // ✅ إضافة/تحديث منتج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price) {
      showError('الاسم والسعر مطلوبان');
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        const updated = await productService.update(editingId, formData);
        setProducts(products.map(p => p._id === editingId ? updated : p));
        showSuccess('تم تحديث المنتج بنجاح ✅');
      } else {
        const newProduct = await productService.create(formData);
        setProducts([...products, newProduct]);
        showSuccess('تم إضافة المنتج بنجاح ✅');
      }
      resetForm();
    } catch (err) {
      showError('خطأ في معالجة الطلب');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ تعديل منتج
  const handleStartEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: product.image || '',
      category: product.category || 'إلكترونيات',
      stock: product.stock || '',
      colors: product.colors || ['#000000']
    });
    setEditingId(product._id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  // ✅ حذف منتج
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    setLoading(true);
    try {
      await productService.delete(id);
      setProducts(products.filter(p => p._id !== id));
      showSuccess('تم حذف المنتج بنجاح ✅');
    } catch (err) {
      showError('خطأ في حذف المنتج');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ إعادة تعيين الفورم
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'إلكترونيات',
      stock: '',
      colors: ['#000000']
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ✅ صفحة التحميل
  if (pageLoading) {
    return (
      <div className="admin-loading">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  // ✅ صفحة تسجيل الدخول
  if (!isAdminLoggedIn) {
    return (
      <div className="admin-login-container">
        <div className="login-card">
          <h1>🔐 لوحة التحكم</h1>
          <p>أدخل كلمة السر للمتابعة</p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>كلمة السر</label>
              <input
                type="password"
                name="password"
                placeholder="أدخل كلمة السر"
                autoFocus
                disabled={loading}
                required
                className="login-input"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn-login"
            >
              {loading ? '⏳ جاري...' : '🔓 دخول'}
            </button>
          </form>

          <p className="hint">🔒 كلمة السر محفوظة في الباك اند</p>
        </div>
      </div>
    );
  }

  // ✅ لوحة التحكم
  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>🛠️ لوحة تحكم المتجر</h1>
          <p>إدارة المنتجات والمخزون</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          🚪 تسجيل خروج
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <button 
        className="btn-primary"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? '❌ إلغاء' : '➕ إضافة منتج جديد'}
      </button>

      {/* ✅ فورم الإضافة والتعديل */}
      {showForm && (
        <div className="form-container">
          <h2>{editingId ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>اسم المنتج *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="اسم المنتج"
                required
              />
            </div>

            <div className="form-group">
              <label>الوصف</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="وصف المنتج..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>السعر *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>الكمية</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>الفئة</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="إلكترونيات">إلكترونيات</option>
                  <option value="ملابس">ملابس</option>
                  <option value="إكسسوارات">إكسسوارات</option>
                  <option value="أثاث">أثاث</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            </div>

            {/* ✅ حقل رفع الصور */}
            <div className="form-group">
              <label>الصورة</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="file" 
                  id="imageUpload"
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={uploadImage}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  {uploading ? '⏳ جاري الرفع...' : '📤 رفع'}
                </button>
              </div>

              {formData.image && (
                <div style={{ marginTop: '15px' }}>
                  <img 
                    src={formData.image} 
                    alt="preview" 
                    style={{ maxWidth: '200px', borderRadius: '8px' }}
                  />
                </div>
              )}
            </div>

            {/* ✅ الألوان */}
            <div className="colors-section">
              <label>ألوان المنتج</label>
              <div className="colors-list">
                {formData.colors.map((color, index) => (
                  <div key={index} className="color-input-group">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      placeholder="#000000"
                      className="color-text"
                      maxLength="7"
                    />
                    {formData.colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="btn-remove-color"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addColor}
                className="btn-add-color"
                disabled={formData.colors.length >= 10}
              >
                + إضافة لون
              </button>
            </div>

            <button type="submit" className="btn-success" disabled={loading}>
              {loading ? '⏳ جاري...' : (editingId ? '💾 حفظ' : '➕ إضافة')}
            </button>
          </form>
        </div>
      )}

      {/* ✅ جدول المنتجات */}
      <div className="products-container">
        <h2>📦 المنتجات ({products.length})</h2>

        {loading && !showForm ? (
          <p className="loading">جاري التحميل...</p>
        ) : products.length === 0 ? (
          <p className="no-products">لا توجد منتجات</p>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الفئة</th>
                  <th>السعر</th>
                  <th>الكمية</th>
                  <th>الألوان</th>
                  <th>الصورة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category || '-'}</td>
                    <td>{product.price}</td>
                    <td>{product.stock || 0}</td>
                    <td>
                      <div className="colors-preview">
                        {(product.colors || []).map((color, idx) => (
                          <span
                            key={idx}
                            className="color-dot"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="thumb" />
                      ) : (
                        'بدون صورة'
                      )}
                    </td>
                    <td>
                      <button className="btn-edit" onClick={() => handleStartEdit(product)}>✏️</button>
                      <button className="btn-delete" onClick={() => handleDeleteProduct(product._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
