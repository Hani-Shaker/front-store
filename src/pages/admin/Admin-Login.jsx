// src/pages/Admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin-Login.css';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_PASSWORD = '123456'; // غيّر هذا لـ strong password

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminToken', 'authenticated');
        onLogin();
        navigate('/admin-dashboard');
      } else {
        setError('كلمة السر خاطئة!');
        setPassword('');
      }
      setLoading(false);
    }, 500);
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
      </div>
    </div>
  );
};

export default AdminLogin;
