import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const demoUsers = [
    { email: 'admin@crm.com', password: 'admin123', role: 'Admin' },
    { email: 'supervisor@crm.com', password: 'super123', role: 'Supervisor' },
    { email: 'marketing@crm.com', password: 'marketing123', role: 'Marketing' },
    { email: 'ejecutivo@crm.com', password: 'ejecutivo123', role: 'Ejecutivo Préstamos' },
    { email: 'inversiones@crm.com', password: 'inversiones123', role: 'Ejecutivo Inversiones' },
    { email: 'legal@crm.com', password: 'legal123', role: 'Legal' },
    { email: 'comercial@crm.com', password: 'comercial123', role: 'Comercial' },
    { email: 'closer@crm.com', password: 'closer123', role: 'Closer' },
    { email: 'tasador@crm.com', password: 'tasador123', role: 'Gestor Tasación' }
  ];

  const quickLogin = (email, password) => {
    setFormData({ email, password });
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        navigate('/dashboard');
      }
    }, 100);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card glass-card">
          <div className="login-header">
            <img src="/logo-intercapital.jpg" alt="Intercapital Perú" className="logo-image" />
            <h1>Intercapital Perú</h1>
            <p className="text-secondary">Sistema de Gestión de Clientes</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">
                <Mail size={16} />
                Correo Electrónico
              </label>
              <input
                type="email"
                className="input"
                placeholder="usuario@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <Lock size={16} />
                Contraseña
              </label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
              ) : (
                <>
                  <LogIn size={20} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="demo-section">
            <div className="divider">
              <span>Usuarios de Demostración</span>
            </div>
            <div className="demo-users">
              {demoUsers.map((user, index) => (
                <button
                  key={index}
                  onClick={() => quickLogin(user.email, user.password)}
                  className="demo-user-btn"
                >
                  <span className="demo-role">{user.role}</span>
                  <span className="demo-email">{user.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, 
            #0f2744 0%, 
            #183662 50%,
            #1e4575 100%
          );
          padding: var(--spacing-lg);
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
          animation: pulse 8s ease-in-out infinite;
        }

        .login-container {
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 1;
        }

        .login-card {
          padding: var(--spacing-2xl);
          animation: fadeIn 0.5s ease-out;
        }

        .logo-image {
          max-width: 280px;
          width: 100%;
          height: auto;
          margin-bottom: var(--spacing-lg);
          border-radius: var(--radius-md);
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .logo-large {
          font-size: 4rem;
          margin-bottom: var(--spacing-md);
          animation: pulse 2s ease-in-out infinite;
        }

        .login-header h1 {
          font-size: 2rem;
          margin-bottom: var(--spacing-sm);
          background: linear-gradient(135deg, var(--color-primary-light), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--color-danger);
          border-radius: var(--radius-md);
          color: var(--color-danger);
          margin-bottom: var(--spacing-lg);
          font-size: 0.875rem;
        }

        .login-form {
          margin-bottom: var(--spacing-xl);
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .demo-section {
          margin-top: var(--spacing-xl);
        }

        .divider {
          text-align: center;
          margin: var(--spacing-xl) 0 var(--spacing-lg);
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--color-border);
        }

        .divider span {
          background: var(--color-bg-secondary);
          padding: 0 var(--spacing-md);
          position: relative;
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
          font-weight: 500;
        }

        .demo-users {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .demo-user-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: var(--spacing-md);
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .demo-user-btn:hover {
          background: var(--color-bg-elevated);
          border-color: var(--color-border);
        }

        .demo-role {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-primary-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .demo-email {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin-top: 0.25rem;
        }

        @media (max-width: 640px) {
          .login-card {
            padding: var(--spacing-xl);
          }

          .logo-large {
            font-size: 3rem;
          }

          .login-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
