import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="content-area">
          {children}
        </main>
      </div>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: var(--color-bg-primary);
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          display: flex;
          flex-direction: column;
        }

        .content-area {
          flex: 1;
          padding: var(--spacing-xl);
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 70px;
          }

          .content-area {
            padding: var(--spacing-md);
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
