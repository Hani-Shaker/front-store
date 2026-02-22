// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import './AdminDashboard.css';
import { LogOut } from 'lucide-react';

const CATEGORIES = ['إلكترونيات', 'ملابس', 'إكسسوارات', 'أثاث', 'أخرى'];
const DEFAULT_COLORS = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

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
  <input
    type="file"
    accept="image/*"
    onChange={async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/upload-drive`,
          {
            method: 'POST',
            body: formData
          }
        );
        const data = await response.json();
        
        if (data.url) {
          setFormData(prev => ({ ...prev, image: data.url }));
          setSuccess('تم رفع الصورة على Google Drive ✅');
        } else {
          setError('خطأ في رفع الصورة');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setError('فشل رفع الصورة');
      }
    }}
  />
</div>

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
              >
                + إضافة لون
              </button>
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
