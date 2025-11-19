import React, { useState } from 'react';
import { Upload, Plus, Users, TrendingUp, Phone } from 'lucide-react';
import { useData } from '../../context/DataContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const SupervisorPanel = () => {
  const { addLead, addBulkLeads, leads, users } = useData();
  const [activeTab, setActiveTab] = useState('préstamo'); // 'préstamo' | 'inversión'
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    source: 'call_center'
  });

  // Filtrar usuarios por tipo
  const loanExecutives = users.filter(u => u.role === 'ejecutivo_prestamos');
  const investmentExecutives = users.filter(u => u.role === 'ejecutivo_inversiones');
  
  // Filtrar leads por tipo
  const loanLeads = leads.filter(l => l.source === 'call_center' && (l.leadType === 'préstamo' || !l.leadType));
  const investmentLeads = leads.filter(l => l.source === 'call_center' && l.leadType === 'inversión');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Agregar leadType según la pestaña activa
    addLead({
      ...formData,
      leadType: activeTab
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
      source: 'call_center'
    });
    setShowModal(false);
  };

  const handleBulkUpload = () => {
    // Simulación de carga masiva con leadType
    const bulkLeads = [
      {
        name: `Cliente Demo ${activeTab} 1`,
        email: 'cliente1@example.com',
        phone: '+1234567890',
        company: 'Empresa A',
        source: 'call_center',
        leadType: activeTab,
        notes: `Lead de ${activeTab} generado desde call center`
      },
      {
        name: `Cliente Demo ${activeTab} 2`,
        email: 'cliente2@example.com',
        phone: '+1234567891',
        company: 'Empresa B',
        source: 'call_center',
        leadType: activeTab,
        notes: `Interesado en ${activeTab}`
      },
      {
        name: `Cliente Demo ${activeTab} 3`,
        email: 'cliente3@example.com',
        phone: '+1234567892',
        company: 'Empresa C',
        source: 'call_center',
        leadType: activeTab,
        notes: 'Seguimiento en 48 horas'
      }
    ];
    
    addBulkLeads(bulkLeads);
    alert(`3 leads de ${activeTab} cargados y distribuidos exitosamente`);
  };

  const getLeadDistribution = () => {
    const executives = activeTab === 'préstamo' ? loanExecutives : investmentExecutives;
    const filteredLeads = activeTab === 'préstamo' ? loanLeads : investmentLeads;
    
    const distribution = {};
    executives.forEach(user => {
      distribution[user.id] = {
        name: user.name,
        count: filteredLeads.filter(l => l.assignedTo === user.id).length
      };
    });
    return distribution;
  };

  const distribution = getLeadDistribution();
  const currentExecutives = activeTab === 'préstamo' ? loanExecutives : investmentExecutives;
  const currentLeads = activeTab === 'préstamo' ? loanLeads : investmentLeads;

  return (
    <DashboardLayout>
      <div className="supervisor-panel">
        <div className="page-header">
          <div>
            <h1>Panel de Supervisor</h1>
            <p className="text-secondary">Gestión de Call Center y distribución de leads</p>
          </div>
          <div className="header-actions">
            <button onClick={handleBulkUpload} className="btn btn-secondary">
              <Upload size={20} />
              Carga Masiva (Demo)
            </button>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus size={20} />
              Nuevo Lead
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'préstamo' ? 'active' : ''}`}
            onClick={() => setActiveTab('préstamo')}
          >
            <TrendingUp size={18} />
            Préstamos
            <span className="tab-badge">{loanLeads.length}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'inversión' ? 'active' : ''}`}
            onClick={() => setActiveTab('inversión')}
          >
            <TrendingUp size={18} />
            Inversiones
            <span className="tab-badge">{investmentLeads.length}</span>
          </button>
        </div>

        <div className="stats-row grid grid-cols-3">
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-primary">
              <Phone size={24} />
            </div>
            <div className="stat-value">{currentLeads.length}</div>
            <div className="stat-label">Leads {activeTab === 'préstamo' ? 'Préstamos' : 'Inversiones'}</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-success">
              <Users size={24} />
            </div>
            <div className="stat-value">{currentExecutives.length}</div>
            <div className="stat-label">Ejecutivos Activos</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-info">
              <TrendingUp size={24} />
            </div>
            <div className="stat-value">
              {currentExecutives.length > 0 ? Math.round(currentLeads.length / currentExecutives.length) : 0}
            </div>
            <div className="stat-label">Promedio por Ejecutivo</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Distribución de Leads - {activeTab === 'préstamo' ? 'Préstamos' : 'Inversiones'}</h3>
          </div>
          <div className="distribution-list">
            {currentExecutives.map(user => (
              <div key={user.id} className="distribution-item">
                <div className="advisor-info">
                  <div className="advisor-avatar">{user.avatar}</div>
                  <div>
                    <div className="advisor-name">{user.name}</div>
                    <div className="advisor-email">{user.email}</div>
                  </div>
                </div>
                <div className="distribution-bar">
                  <div className="bar-container">
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: `${currentLeads.length > 0 ? (distribution[user.id].count / currentLeads.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="bar-count">{distribution[user.id].count} leads</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nuevo Lead - {activeTab === 'préstamo' ? 'Préstamo' : 'Inversión'}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">Nombre Completo *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2">
                  <div className="input-group">
                    <label className="input-label">Email *</label>
                    <input
                      type="email"
                      className="input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Teléfono *</label>
                    <input
                      type="tel"
                      className="input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Empresa</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Notas</label>
                  <textarea
                    className="textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                  ></textarea>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Crear Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .supervisor-panel {
          animation: fadeIn 0.3s ease-out;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .page-header h1 {
          margin-bottom: var(--spacing-xs);
        }

        .header-actions {
          display: flex;
          gap: var(--spacing-md);
        }

        .tabs-container {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xl);
          border-bottom: 2px solid var(--color-border);
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-lg);
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: var(--color-text-secondary);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-bottom: -2px;
        }

        .tab-button:hover {
          color: var(--color-text-primary);
          background: var(--color-bg-elevated);
        }

        .tab-button.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
          background: var(--color-bg-elevated);
        }

        .tab-badge {
          background: var(--color-primary);
          color: white;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          min-width: 24px;
          text-align: center;
        }

        .tab-button.active .tab-badge {
          background: var(--color-primary-light);
        }

        .stats-row {
          margin-bottom: var(--spacing-xl);
        }

        .stat-card {
          padding: var(--spacing-lg);
          text-align: center;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-md);
        }

        .stat-icon-primary {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(124, 58, 237, 0.1));
          color: var(--color-primary-light);
        }

        .stat-icon-success {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
          color: var(--color-success);
        }

        .stat-icon-info {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.1));
          color: var(--color-info);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
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
        }

        .distribution-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .distribution-item {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: var(--spacing-lg);
          align-items: center;
          padding: var(--spacing-md);
          background: var(--color-bg-elevated);
          border-radius: var(--radius-md);
        }

        .advisor-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .advisor-avatar {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .advisor-name {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .advisor-email {
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
        }

        .distribution-bar {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .bar-container {
          flex: 1;
          height: 12px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
          border-radius: var(--radius-full);
          transition: width var(--transition-slow);
        }

        .bar-count {
          font-weight: 600;
          color: var(--color-text-primary);
          min-width: 80px;
          text-align: right;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-lg);
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-xl);
          animation: slideIn 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-xl);
          border-bottom: 1px solid var(--color-border);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .modal-close {
          background: transparent;
          border: none;
          font-size: 2rem;
          color: var(--color-text-secondary);
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .modal-close:hover {
          background: var(--color-bg-elevated);
          color: var(--color-text-primary);
        }

        .modal-content form {
          padding: var(--spacing-xl);
        }

        .modal-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: flex-end;
          margin-top: var(--spacing-lg);
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--color-border);
        }

        @media (max-width: 768px) {
          .distribution-item {
            grid-template-columns: 1fr;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default SupervisorPanel;
