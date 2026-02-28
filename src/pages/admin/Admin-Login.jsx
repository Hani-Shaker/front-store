import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin-Login.css';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // تحديد الـ API URL تلقائياً
  const getApiUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return 'https://back-store-two.vercel.app';
  };

  const API_URL = getApiUrl();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.authenticated) {
        // احفظ في localStorage
        localStorage.setItem('adminToken', 'authenticated');
        onLogin();
        navigate('/admin-dashboard', { replace: true });
      } else {
        setError(data.message || 'كلمة السر خاطئة!');
        setPassword('');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('فشل الاتصال بالسيرفر. تأكد من أن الباك اند يعمل.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <h1>🔐 لوحة التحكم</h1>
        <p>أدخل كلمة السر للمتابعة</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>كلمة السر</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="أدخل كلمة السر"
              autoFocus
              disabled={loading}
              required
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
};

export default AdminLogin;
