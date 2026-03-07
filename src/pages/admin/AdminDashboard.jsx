// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import './AdminDashboard.css';
import { LogOut } from 'lucide-react';


// أضف هذه الدوال في AdminDashboard.jsx

// دالة تغيير اللون مع التحقق
const handleColorChange = (index, value) => {
  const newColors = [...formData.colors];
  
  // السماح بـ hex colors فقط
  if (/^#[0-9A-F]{6}$/i.test(value) || value === '') {
    newColors[index] = value.toUpperCase();
    setFormData(prev => ({
      ...prev,
      colors: newColors
    }));
  }
};

// دالة إضافة لون جديد
const addColor = () => {
  if (formData.colors.length < 10) {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, '#000000']
    }));
  } else {
    setError('لا يمكن إضافة أكثر من 10 ألوان');
  }
};

// دالة حذف لون
const removeColor = (index) => {
  if (formData.colors.length > 1) {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  } else {
    setError('يجب أن يكون هناك لون واحد على الأقل');
  }
};

// دالة تحديث formData عند البداية
const resetForm = () => {
  setFormData({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'إلكترونيات',
    stock: '',
    colors: ['#000000', '#FFFFFF'] // لونين افتراضيين
  });
  setEditingId(null);
  setShowForm(false);
};

// عند البدء بـ edit
const handleStartEdit = (product) => {
  setFormData({
    name: product.name,
    description: product.description || '',
    price: product.price,
    image: product.image || '',
    category: product.category || 'إلكترونيات',
    stock: product.stock || '',
    colors: product.colors && product.colors.length > 0 
      ? product.colors 
      : ['#000000', '#FFFFFF']
  });
  setEditingId(product._id);
  setShowForm(true);
  window.scrollTo(0, 0);
};


const CATEGORIES = ['إلكترونيات', 'ملابس', 'إكسسوارات', 'أثاث', 'أخرى'];
// const DEFAULT_COLORS = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'إلكترونيات',
    stock: '',
    colors: ['#000000']
  });

  useEffect(() => {
    loadProducts();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorChange = (index, value) => {
    const newColors = [...formData.colors];
    newColors[index] = value;
    setFormData(prev => ({
      ...prev,
      colors: newColors
    }));
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, '#000000']
    }));
  };

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price) {
      setError('الاسم والسعر مطلوبان');
      return;
    }

    try {
      const newProduct = await productService.create(formData);
      setProducts([...products, newProduct]);
      resetForm();
      setSuccess('تم إضافة المنتج بنجاح ✅');
    } catch (err) {
      setError('خطأ في إضافة المنتج');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    
    if (!editingId) return;

    try {
      const updated = await productService.update(editingId, formData);
      setProducts(products.map(p => p._id === editingId ? updated : p));
      resetForm();
      setSuccess('تم تحديث المنتج بنجاح ✅');
    } catch (err) {
      setError('خطأ في تحديث المنتج');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      await productService.delete(id);
      setProducts(products.filter(p => p._id !== id));
      setSuccess('تم حذف المنتج بنجاح ✅');
    } catch (err) {
      setError('خطأ في حذف المنتج');
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };
    async function uploadImage(file, setFormData, formData, setSuccess, setError) {
      if (!file) return;

      const dataForm = new FormData();
      dataForm.append("file", file);
      dataForm.append("upload_preset", "lolo-store");

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/doh4cvygr/image/upload`,
          {
            method: "POST",
            body: dataForm
          }
        );

        const data = await res.json();

        setFormData({
          ...formData,
          image: data.secure_url
        });

        setSuccess("تم رفع الصورة ✅");
      } catch (error) {
        console.error(error);
        setError("فشل رفع الصورة");
      }
    }
  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>🛠️ لوحة تحكم المتجر</h1>
          <p>إدارة المنتجات والمخزون</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <LogOut className="w-4 h-4" />
          تسجيل خروج
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

      {showForm && (
        <div className="form-container">
          <h2>{editingId ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</h2>
          <form onSubmit={editingId ? handleEditProduct : handleAddProduct}>
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
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

<div className="form-group">
  <label>الصورة</label>
  
  <div style={{ display: 'flex', gap: '10px' }}>
    <input 
      type="file" 
      id="imageUpload"
      accept="image/*"
    />
    
    <button
      type="button"
      onClick={() => {
        const file = document.getElementById("imageUpload").files[0];
        uploadImage(file, setFormData, formData, setSuccess, setError);
      }}
      className="btn-secondary"
    >
      📤 رفع الصورة
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

<div className="colors-section">
  <label>ألوان المنتج المتاحة</label>
  <div className="colors-list">
    {formData.colors && formData.colors.length > 0 ? (
      formData.colors.map((color, index) => (
        <div key={index} className="color-input-group">
          <div className="color-picker-wrapper">
            <input
              type="color"
              value={color && color.length > 0 ? color : '#000000'}
              onChange={(e) => handleColorChange(index, e.target.value)}
              className="color-picker"
              title="اختر لون"
            />
            <span 
              className="color-preview" 
              style={{ backgroundColor: color || '#000000' }}
              title={color}
            />
          </div>

          <div className="color-input-wrapper">
            <input
              type="text"
              value={color || '#000000'}
              onChange={(e) => {
                const val = e.target.value;
                // التحقق من صيغة Hex
                if (/^#[0-9A-F]{6}$/i.test(val) || val === '') {
                  handleColorChange(index, val);
                }
              }}
              placeholder="#000000"
              className="color-text"
              maxLength="7"
              title="أدخل Hex color (مثال: #FF5733)"
            />
          </div>

          {formData.colors.length > 1 && (
            <button
              type="button"
              onClick={() => removeColor(index)}
              className="btn-remove-color"
              title="حذف هذا اللون"
            >
              ✕
            </button>
          )}
        </div>
      ))
    ) : (
      <div className="no-colors">
        <p>لم تضف ألواناً بعد. اضغط "إضافة لون" لإضافة لون.</p>
      </div>
    )}
  </div>

  <button
    type="button"
    onClick={addColor}
    className="btn-add-color"
    disabled={formData.colors && formData.colors.length >= 10}
  >
    + إضافة لون (الحد الأقصى 10)
  </button>

  {/* عرض الألوان المختارة */}
  {formData.colors && formData.colors.length > 0 && (
    <div className="selected-colors-preview">
      <p>الألوان المختارة:</p>
      <div className="colors-grid">
        {formData.colors.map((color, index) => (
          <div key={index} className="color-chip">
            <span 
              className="color-swatch" 
              style={{ backgroundColor: color || '#000000' }}
            />
            <span className="color-code">{color}</span>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

            <button type="submit" className="btn-success">
              {editingId ? '💾 حفظ' : '➕ إضافة'}
            </button>
          </form>
        </div>
      )}

      <div className="products-container">
        <h2>📦 المنتجات ({products.length})</h2>

        {loading ? (
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
};

export default AdminDashboard;
