import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin-Login.css';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://back-store-two.vercel.app';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.authenticated) {
        onLogin();
        navigate('/admin-dashboard', { replace: true });
      } else {
        setError(data.message || 'كلمة السر خاطئة!');
        setPassword('');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('فشل التحقق من كلمة السر');
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