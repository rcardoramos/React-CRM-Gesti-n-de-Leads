import React, { useState } from 'react';
import { Megaphone, Plus, TrendingUp, Users, Target } from 'lucide-react';
import { useData } from '../../context/DataContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const MarketingPanel = () => {
  const { addLead, addCampaign, campaigns, leads } = useData();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    source: 'marketing',
    campaign: ''
  });
  const [campaignFormData, setCampaignFormData] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'active'
  });

  const marketingLeads = leads.filter(l => l.source === 'marketing');

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    addLead(leadFormData);
    setLeadFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
      source: 'marketing',
      campaign: ''
    });
    setShowLeadModal(false);
  };

  const handleCampaignSubmit = (e) => {
    e.preventDefault();
    addCampaign(campaignFormData);
    setCampaignFormData({
      name: '',
      description: '',
      budget: '',
      startDate: '',
      endDate: '',
      status: 'active'
    });
    setShowCampaignModal(false);
  };

  return (
    <DashboardLayout>
      <div className="marketing-panel">
        <div className="page-header">
          <div>
            <h1>Panel de Marketing</h1>
            <p className="text-secondary">Gestión de campañas y generación de leads</p>
          </div>
          <div className="header-actions">
            <button onClick={() => setShowCampaignModal(true)} className="btn btn-secondary">
              <Plus size={20} />
              Nueva Campaña
            </button>
            <button onClick={() => setShowLeadModal(true)} className="btn btn-primary">
              <Plus size={20} />
              Nuevo Lead
            </button>
          </div>
        </div>

        <div className="stats-row grid grid-cols-3">
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-primary">
              <Megaphone size={24} />
            </div>
            <div className="stat-value">{campaigns.length}</div>
            <div className="stat-label">Campañas Activas</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-success">
              <Target size={24} />
            </div>
            <div className="stat-value">{marketingLeads.length}</div>
            <div className="stat-label">Leads Generados</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-info">
              <TrendingUp size={24} />
            </div>
            <div className="stat-value">
              {campaigns.length > 0 ? Math.round(marketingLeads.length / campaigns.length) : 0}
            </div>
            <div className="stat-label">Leads por Campaña</div>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="card">
            <div className="card-header">
              <h3>Campañas</h3>
              <span className="badge badge-primary">{campaigns.length}</span>
            </div>
            <div className="campaigns-list">
              {campaigns.length > 0 ? (
                campaigns.map(campaign => (
                  <div key={campaign.id} className="campaign-item">
                    <div className="campaign-info">
                      <h4>{campaign.name}</h4>
                      <p className="text-secondary text-sm">{campaign.description}</p>
                      {campaign.budget && (
                        <p className="campaign-budget">Presupuesto: ${campaign.budget}</p>
                      )}
                    </div>
                    <span className="badge badge-success">{campaign.status}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state-small">
                  <Megaphone size={32} className="empty-icon" />
                  <p>No hay campañas creadas</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Leads Recientes</h3>
              <span className="badge badge-success">{marketingLeads.length}</span>
            </div>
            <div className="leads-list">
              {marketingLeads.slice(0, 5).map(lead => (
                <div key={lead.id} className="lead-item">
                  <div className="lead-info">
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-meta">{lead.email}</div>
                    {lead.campaign && (
                      <div className="lead-campaign">📢 {lead.campaign}</div>
                    )}
                  </div>
                  <span className="badge badge-info">{lead.status}</span>
                </div>
              ))}
              {marketingLeads.length === 0 && (
                <div className="empty-state-small">
                  <Target size={32} className="empty-icon" />
                  <p>No hay leads generados</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Nuevo Lead */}
        {showLeadModal && (
          <div className="modal-overlay" onClick={() => setShowLeadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nuevo Lead - Marketing</h2>
                <button onClick={() => setShowLeadModal(false)} className="modal-close">×</button>
              </div>
              <form onSubmit={handleLeadSubmit}>
                <div className="input-group">
                  <label className="input-label">Nombre Completo *</label>
                  <input
                    type="text"
                    className="input"
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2">
                  <div className="input-group">
                    <label className="input-label">Email *</label>
                    <input
                      type="email"
                      className="input"
                      value={leadFormData.email}
                      onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Teléfono *</label>
                    <input
                      type="tel"
                      className="input"
                      value={leadFormData.phone}
                      onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Empresa</label>
                  <input
                    type="text"
                    className="input"
                    value={leadFormData.company}
                    onChange={(e) => setLeadFormData({ ...leadFormData, company: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Campaña</label>
                  <select
                    className="select"
                    value={leadFormData.campaign}
                    onChange={(e) => setLeadFormData({ ...leadFormData, campaign: e.target.value })}
                  >
                    <option value="">Seleccionar campaña</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Notas</label>
                  <textarea
                    className="textarea"
                    value={leadFormData.notes}
                    onChange={(e) => setLeadFormData({ ...leadFormData, notes: e.target.value })}
                    rows="3"
                  ></textarea>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowLeadModal(false)} className="btn btn-secondary">
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

        {/* Modal Nueva Campaña */}
        {showCampaignModal && (
          <div className="modal-overlay" onClick={() => setShowCampaignModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nueva Campaña</h2>
                <button onClick={() => setShowCampaignModal(false)} className="modal-close">×</button>
              </div>
              <form onSubmit={handleCampaignSubmit}>
                <div className="input-group">
                  <label className="input-label">Nombre de la Campaña *</label>
                  <input
                    type="text"
                    className="input"
                    value={campaignFormData.name}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Descripción</label>
                  <textarea
                    className="textarea"
                    value={campaignFormData.description}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, description: e.target.value })}
                    rows="3"
                  ></textarea>
                </div>
                <div className="input-group">
                  <label className="input-label">Presupuesto</label>
                  <input
                    type="number"
                    className="input"
                    value={campaignFormData.budget}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, budget: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2">
                  <div className="input-group">
                    <label className="input-label">Fecha Inicio</label>
                    <input
                      type="date"
                      className="input"
                      value={campaignFormData.startDate}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Fecha Fin</label>
                    <input
                      type="date"
                      className="input"
                      value={campaignFormData.endDate}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowCampaignModal(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Crear Campaña
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .marketing-panel {
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

        .campaigns-list,
        .leads-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .campaign-item,
        .lead-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--spacing-md);
          background: var(--color-bg-elevated);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .campaign-item:hover,
        .lead-item:hover {
          background: var(--color-bg-tertiary);
          transform: translateX(4px);
        }

        .campaign-info,
        .lead-info {
          flex: 1;
        }

        .campaign-info h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1rem;
          color: var(--color-text-primary);
        }

        .campaign-budget {
          margin-top: var(--spacing-xs);
          font-size: 0.875rem;
          color: var(--color-success);
          font-weight: 600;
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

        .lead-campaign {
          font-size: 0.75rem;
          color: var(--color-primary-light);
          margin-top: 0.25rem;
        }

        .empty-state-small {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--color-text-tertiary);
        }

        .empty-icon {
          opacity: 0.2;
          margin-bottom: var(--spacing-sm);
        }

        /* Modal styles (reused from supervisor panel) */
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
      `}</style>
    </DashboardLayout>
  );
};

export default MarketingPanel;
