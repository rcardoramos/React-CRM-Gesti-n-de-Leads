import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Phone, 
  Megaphone, 
  Scale,
  Settings,
  LogOut,
  Target,
  FileText,
  Building2,
  Ruler,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['admin', 'supervisor_callcenter', 'marketing', 'ejecutivo_prestamos', 'ejecutivo_inversiones', 'legal', 'comercial']
    },
    {
      name: 'Mis Préstamos',
      icon: Target,
      path: '/sales-workspace',
      roles: ['ejecutivo_prestamos']
    },
    {
      name: 'Mis Inversiones',
      icon: TrendingUp,
      path: '/investment-workspace',
      roles: ['ejecutivo_inversiones']
    },
    {
      name: 'Reportes de Tasación',
      icon: FileCheck,
      path: '/appraisal-reports',
      roles: ['ejecutivo_inversiones']
    },
    {
      name: 'Call Center',
      icon: Phone,
      path: '/callcenter',
      roles: ['admin', 'supervisor_callcenter']
    },
    {
      name: 'Marketing',
      icon: Megaphone,
      path: '/marketing',
      roles: ['admin', 'marketing']
    },
    {
      name: 'Legal',
      icon: Scale,
      path: '/legal',
      roles: ['admin', 'legal']
    },
    {
      name: 'Comercial',
      icon: Building2,
      path: '/commercial',
      roles: ['admin', 'comercial']
    },
    {
      name: 'Closer',
      icon: Target,
      path: '/closer',
      roles: ['admin', 'closer']
    },
    {
      name: 'Tasación',
      icon: Ruler,
      path: '/appraisal',
      roles: ['admin', 'gestor_tasacion']
    },
    {
      name: 'Clientes',
      icon: Users,
      path: '/clients',
      roles: ['admin', 'ejecutivo_prestamos', 'supervisor_callcenter']
    },
    {
      name: 'Reportes',
      icon: FileText,
      path: '/reports',
      roles: ['admin', 'supervisor_callcenter', 'marketing']
    },
    {
      name: 'Configuración',
      icon: Settings,
      path: '/settings',
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => hasRole(item.roles));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">🚀</div>
          <h2 className="logo-text">Intercapital</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.avatar || '👤'}</div>
          <div className="user-details">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.department}</div>
          </div>
        </div>
        <button onClick={logout} className="btn-logout" title="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          background: var(--color-bg-secondary);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
        }

        .sidebar-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--color-border);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .logo-icon {
          font-size: 2rem;
          animation: pulse 2s ease-in-out infinite;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .sidebar-nav {
          flex: 1;
          padding: var(--spacing-md);
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: 0.75rem var(--spacing-md);
          margin-bottom: var(--spacing-sm);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
          font-weight: 500;
        }

        .nav-item:hover {
          background: var(--color-bg-elevated);
          color: var(--color-text-primary);
          transform: translateX(4px);
        }

        .nav-item.active {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(56, 189, 248, 0.1));
          color: var(--color-primary-light);
          border-left: 3px solid var(--color-primary);
        }

        .sidebar-footer {
          padding: var(--spacing-md);
          border-top: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-sm);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex: 1;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn-logout {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          padding: 0.5rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-logout:hover {
          background: var(--color-danger);
          border-color: var(--color-danger);
          color: white;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 70px;
          }

          .logo-text,
          .nav-item span,
          .user-details {
            display: none;
          }

          .sidebar-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
