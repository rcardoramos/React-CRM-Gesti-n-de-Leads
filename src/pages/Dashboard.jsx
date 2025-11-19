import React from 'react';
import { TrendingUp, Users, Target, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';

const Dashboard = () => {
  const { getStats, getMyLeads } = useData();
  const { user } = useAuth();
  const stats = getStats();
  const myLeads = getMyLeads();
  const recentLeads = myLeads.slice(0, 5);

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Target,
      color: 'primary',
      trend: '+12%'
    },
    {
      title: 'Nuevos',
      value: stats.newLeads,
      icon: Clock,
      color: 'info',
      trend: '+8%'
    },
    {
      title: 'Ganados',
      value: stats.won,
      icon: CheckCircle,
      color: 'success',
      trend: '+24%'
    },
    {
      title: 'Clientes',
      value: stats.totalClients,
      icon: Users,
      color: 'secondary',
      trend: '+5%'
    }
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      nuevo: 'badge-info',
      contactado: 'badge-warning',
      calificado: 'badge-primary',
      ganado: 'badge-success',
      perdido: 'badge-danger'
    };
    return statusMap[status] || 'badge-info';
  };

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p className="text-secondary">Bienvenido de nuevo, {user?.name}</p>
          </div>
        </div>

        <div className="stats-grid grid grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat-card glass-card">
                <div className="stat-header">
                  <div className={`stat-icon stat-icon-${stat.color}`}>
                    <Icon size={24} />
                  </div>
                  <span className="stat-trend">{stat.trend}</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.title}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="dashboard-content grid grid-cols-2">
          <div className="card">
            <div className="card-header">
              <h3>Leads Recientes</h3>
              <span className="badge badge-primary">{recentLeads.length}</span>
            </div>
            <div className="leads-list">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="lead-item">
                    <div className="lead-info">
                      <div className="lead-name">{lead.name}</div>
                      <div className="lead-meta">
                        {lead.email} • {lead.phone}
                      </div>
                    </div>
                    <span className={`badge ${getStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Target size={48} className="empty-icon" />
                  <p>No hay leads asignados</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Distribución de Leads</h3>
            </div>
            <div className="chart-container">
              <div className="chart-bar">
                <div className="chart-label">Nuevos</div>
                <div className="chart-progress">
                  <div 
                    className="chart-fill chart-fill-info"
                    style={{ width: `${stats.totalLeads > 0 ? (stats.newLeads / stats.totalLeads) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="chart-value">{stats.newLeads}</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">Contactados</div>
                <div className="chart-progress">
                  <div 
                    className="chart-fill chart-fill-warning"
                    style={{ width: `${stats.totalLeads > 0 ? (stats.contacted / stats.totalLeads) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="chart-value">{stats.contacted}</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">Calificados</div>
                <div className="chart-progress">
                  <div 
                    className="chart-fill chart-fill-primary"
                    style={{ width: `${stats.totalLeads > 0 ? (stats.qualified / stats.totalLeads) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="chart-value">{stats.qualified}</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">Ganados</div>
                <div className="chart-progress">
                  <div 
                    className="chart-fill chart-fill-success"
                    style={{ width: `${stats.totalLeads > 0 ? (stats.won / stats.totalLeads) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="chart-value">{stats.won}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-page {
          animation: fadeIn 0.3s ease-out;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
        }

        .page-header h1 {
          margin-bottom: var(--spacing-xs);
        }

        .stats-grid {
          margin-bottom: var(--spacing-xl);
        }

        .stat-card {
          padding: var(--spacing-lg);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon-primary {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(124, 58, 237, 0.1));
          color: var(--color-primary-light);
        }

        .stat-icon-info {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.1));
          color: var(--color-info);
        }

        .stat-icon-success {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
          color: var(--color-success);
        }

        .stat-icon-secondary {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.1));
          color: var(--color-secondary);
        }

        .stat-trend {
          font-size: 0.875rem;
          color: var(--color-success);
          font-weight: 600;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .dashboard-content {
          gap: var(--spacing-lg);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--color-border);
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.125rem;
        }

        .leads-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .lead-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background: var(--color-bg-elevated);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .lead-item:hover {
          background: var(--color-bg-tertiary);
          transform: translateX(4px);
        }

        .lead-info {
          flex: 1;
        }

        .lead-name {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
        }

        .lead-meta {
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-2xl);
          color: var(--color-text-tertiary);
        }

        .empty-icon {
          opacity: 0.3;
          margin-bottom: var(--spacing-md);
        }

        .chart-container {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .chart-bar {
          display: grid;
          grid-template-columns: 100px 1fr 60px;
          align-items: center;
          gap: var(--spacing-md);
        }

        .chart-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .chart-progress {
          height: 8px;
          background: var(--color-bg-elevated);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .chart-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width var(--transition-slow);
        }

        .chart-fill-info {
          background: linear-gradient(90deg, var(--color-info), var(--color-secondary));
        }

        .chart-fill-warning {
          background: linear-gradient(90deg, var(--color-warning), hsl(38, 92%, 60%));
        }

        .chart-fill-primary {
          background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
        }

        .chart-fill-success {
          background: linear-gradient(90deg, var(--color-success), hsl(142, 71%, 55%));
        }

        .chart-value {
          font-weight: 600;
          color: var(--color-text-primary);
          text-align: right;
        }

        @media (max-width: 1024px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Dashboard;
