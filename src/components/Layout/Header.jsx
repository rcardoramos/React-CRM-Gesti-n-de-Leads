import React, { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const Header = () => {
  const { user } = useAuth();
  const { getStats } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const stats = getStats();

  const notifications = [
    { id: 1, count: stats.newLeads, label: 'Nuevos leads', color: 'info' }
  ];

  const totalNotifications = notifications.reduce((sum, n) => sum + n.count, 0);

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn">
          <Menu size={24} />
        </button>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar clientes, leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <div className="notification-btn">
          <Bell size={20} />
          {totalNotifications > 0 && (
            <span className="notification-badge">{totalNotifications}</span>
          )}
        </div>
        
        <div className="header-user">
          <span className="greeting">Hola, {user?.name?.split(' ')[0]}</span>
        </div>
      </div>

      <style jsx>{`
        .header {
          height: 70px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--spacing-xl);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          flex: 1;
        }

        .menu-btn {
          display: none;
          background: transparent;
          border: none;
          color: var(--color-text-primary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
        }

        .menu-btn:hover {
          background: var(--color-bg-elevated);
        }

        .search-box {
          position: relative;
          max-width: 400px;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-tertiary);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.625rem 1rem 0.625rem 2.75rem;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          color: var(--color-text-primary);
          font-size: 0.9375rem;
          transition: all var(--transition-fast);
          outline: none;
        }

        .search-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
        }

        .notification-btn {
          position: relative;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          padding: 0.625rem;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-btn:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: linear-gradient(135deg, var(--color-danger), hsl(0, 84%, 50%));
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-full);
          min-width: 18px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .greeting {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        @media (max-width: 768px) {
          .header {
            padding: 0 var(--spacing-md);
          }

          .menu-btn {
            display: block;
          }

          .search-box {
            display: none;
          }

          .greeting {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
