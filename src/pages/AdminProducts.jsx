import React, { useState, useEffect } from 'react';
// import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      setFormData({ name: '', description: '', price: '', image: '', category: '', stock: '' });
      setShowForm(false);
      alert('✅ تم إضافة المنتج');
    } catch (error) {
      alert('❌ خطأ في الإضافة');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const updated = await response.json();
      setProducts(products.map(p => p._id === editingId ? updated : p));
      setFormData({ name: '', description: '', price: '', image: '', category: '', stock: '' });
      setEditingId(null);
      setShowForm(false);
      alert('✅ تم التعديل');
    } catch (error) {
      alert('❌ خطأ في التعديل');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p._id !== id));
      alert('✅ تم الحذف');
    } catch (error) {
      alert('❌ خطأ في الحذف');
    }
  };

  const handleStartEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: product.image || '',
      category: product.category || '',
      stock: product.stock || ''
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>🛠️ لوحة تحكم المنتجات</h1>

      <button onClick={() => setShowForm(!showForm)} style={{
        background: '#28a745', color: 'white', padding: '10px 20px',
        border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px'
      }}>
        {showForm ? '❌ إلغاء' : '➕ إضافة منتج'}
      </button>

      {showForm && (
        <form onSubmit={editingId ? handleEditProduct : handleAddProduct} style={{
          background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px'
        }}>
          <input type="text" name="name" placeholder="الاسم *" value={formData.name} 
            onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <textarea name="description" placeholder="الوصف" value={formData.description} 
            onChange={handleInputChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="number" name="price" placeholder="السعر *" value={formData.price} 
            onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="number" name="stock" placeholder="الكمية" value={formData.stock} 
            onChange={handleInputChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="text" name="category" placeholder="الفئة" value={formData.category} 
            onChange={handleInputChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="url" name="image" placeholder="رابط الصورة" value={formData.image} 
            onChange={handleInputChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <button type="submit" style={{ background: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>
            {editingId ? '💾 حفظ' : '➕ إضافة'}
          </button>
        </form>
      )}

      <h2>📦 المنتجات ({products.length})</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
        <thead style={{ background: '#007bff', color: 'white' }}>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>الاسم</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>السعر</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>الكمية</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{p.name}</td>
              <td style={{ padding: '10px' }}>{p.price}</td>
              <td style={{ padding: '10px' }}>{p.stock}</td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => handleStartEdit(p)} style={{ marginRight: '10px', background: '#ffc107', padding: '5px 10px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>✏️</button>
                <button onClick={() => handleDeleteProduct(p._id)} style={{ background: '#dc3545', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;