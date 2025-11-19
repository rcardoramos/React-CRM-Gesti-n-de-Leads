import React, { useState } from 'react';
import { Building2, Search, CheckCircle, XCircle, Download, User, Phone, Mail, MapPin, CreditCard, DollarSign, Percent, FileText, Image } from 'lucide-react';
import { useData } from '../../context/DataContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const CommercialPanel = () => {
  const { leads, updateLead } = useData();
  const [searchDNI, setSearchDNI] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Filtrar leads aprobados por Legal
  const leadsAprobadosLegal = leads.filter(
    lead => lead.legalStatus === 'approved' && !lead.commercialStatus
  );

  const handleSearch = () => {
    const found = leads.find(lead => lead.documentNumber === searchDNI);
    if (found) {
      setSelectedLead(found);
      setShowModal(true);
      setApprovalComment('');
      setRejectionReason('');
    } else {
      alert('No se encontró ningún cliente con ese DNI');
    }
  };

  const handleApprove = () => {
    if (!approvalComment.trim()) {
      alert('Por favor ingrese un comentario de aprobación');
      return;
    }
    
    updateLead(selectedLead.id, { 
      commercialStatus: 'approved',
      commercialApprovedAt: new Date().toISOString(),
      commercialApprovalComment: approvalComment
    });
    setShowModal(false);
    setSelectedLead(null);
    setApprovalComment('');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Por favor ingrese el motivo del rechazo');
      return;
    }
    
    updateLead(selectedLead.id, { 
      commercialStatus: 'rejected',
      commercialRejectedAt: new Date().toISOString(),
      commercialRejectionReason: rejectionReason
    });
    setShowModal(false);
    setSelectedLead(null);
    setRejectionReason('');
  };

  const downloadFile = (fileData, fileName) => {
    if (fileData && fileData.data) {
      const link = document.createElement('a');
      link.href = fileData.data;
      link.download = fileName || fileData.name;
      link.click();
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: 'badge-success',
      rejected: 'badge-danger',
      pending: 'badge-warning'
    };
    return statusMap[status] || 'badge-info';
  };

  return (
    <DashboardLayout>
      <div className="commercial-panel">
        <div className="page-header">
          <div>
            <h1>Panel Comercial</h1>
            <p className="text-secondary">Aprobación de clientes y revisión de fotografías</p>
          </div>
        </div>

        {/* Búsqueda por DNI */}
        <div className="search-section card">
          <h3>Buscar Cliente por DNI</h3>
          <div className="search-bar">
            <input
              type="text"
              className="input"
              placeholder="Ingrese número de DNI o CE"
              value={searchDNI}
              onChange={(e) => setSearchDNI(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn btn-primary">
              <Search size={20} />
              Buscar
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-row grid grid-cols-4">
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-warning">
              <FileText size={24} />
            </div>
            <div className="stat-value">{leadsAprobadosLegal.length}</div>
            <div className="stat-label">Pendientes Revisión</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-value">
              {leads.filter(l => l.commercialStatus === 'approved').length}
            </div>
            <div className="stat-label">Aprobados</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-danger">
              <XCircle size={24} />
            </div>
            <div className="stat-value">
              {leads.filter(l => l.commercialStatus === 'rejected').length}
            </div>
            <div className="stat-label">Rechazados</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-info">
              <Building2 size={24} />
            </div>
            <div className="stat-value">
              {leads.filter(l => l.legalStatus === 'approved').length}
            </div>
            <div className="stat-label">Aprobados por Legal</div>
          </div>
        </div>

        {/* Lista de Clientes Aprobados por Legal */}
        <div className="card">
          <div className="card-header">
            <h3>Clientes Pendientes de Aprobación Comercial</h3>
            <span className="badge badge-warning">{leadsAprobadosLegal.length}</span>
          </div>
          <div className="leads-list">
            {leadsAprobadosLegal.length > 0 ? (
              leadsAprobadosLegal.map(lead => (
                <div 
                  key={lead.id} 
                  className="lead-row"
                  onClick={() => {
                    setSelectedLead(lead);
                    setShowModal(true);
                    setApprovalComment('');
                    setRejectionReason('');
                  }}
                >
                  <div className="lead-info">
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-meta">
                      <span><CreditCard size={14} /> {lead.documentType}: {lead.documentNumber || 'No especificado'}</span>
                      <span><Phone size={14} /> {lead.phone}</span>
                      <span><DollarSign size={14} /> S/ {lead.loanAmount || '0'}</span>
                    </div>
                  </div>
                  <div className="lead-actions-preview">
                    <span className="badge" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }}>Pre-aprobado por Legal</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Building2 size={64} className="empty-icon" />
                <h3>No hay clientes pendientes</h3>
                <p className="text-secondary">
                  Los clientes aprobados por Legal aparecerán aquí
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Detalle del Cliente */}
        {showModal && selectedLead && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Revisión Comercial</h2>
                  <p className="text-secondary">{selectedLead.name}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="modal-close">×</button>
              </div>

              <div className="modal-body">
                {/* Información Personal */}
                <div className="info-section">
                  <h3>Información del Cliente</h3>
                  <div className="info-grid">
                    <div className="info-field">
                      <label><User size={16} /> Nombre Completo</label>
                      <p>{selectedLead.name}</p>
                    </div>
                    <div className="info-field">
                      <label><Phone size={16} /> Teléfono</label>
                      <p>{selectedLead.phone}</p>
                    </div>
                    <div className="info-field">
                      <label><Mail size={16} /> Email</label>
                      <p>{selectedLead.email}</p>
                    </div>
                    <div className="info-field">
                      <label><MapPin size={16} /> Dirección</label>
                      <p>{selectedLead.address || 'No especificada'}</p>
                    </div>
                    <div className="info-field">
                      <label><MapPin size={16} /> Departamento</label>
                      <p>{selectedLead.departamento || 'No especificado'}</p>
                    </div>
                    <div className="info-field">
                      <label><MapPin size={16} /> Provincia</label>
                      <p>{selectedLead.provincia || 'No especificado'}</p>
                    </div>
                    <div className="info-field">
                      <label><MapPin size={16} /> Distrito</label>
                      <p>{selectedLead.distrito || 'No especificado'}</p>
                    </div>
                    <div className="info-field">
                      <label><CreditCard size={16} /> Documento</label>
                      <p>{selectedLead.documentType || 'DNI'}: {selectedLead.documentNumber || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                {/* Información del Préstamo */}
                <div className="info-section">
                  <h3>Información del Préstamo</h3>
                  <div className="info-grid">
                    <div className="info-field">
                      <label><DollarSign size={16} /> Monto Solicitado</label>
                      <p className="amount-text">
                        {selectedLead.loanAmount ? `S/ ${selectedLead.loanAmount}` : 'No especificado'}
                      </p>
                    </div>
                    <div className="info-field">
                      <label><Percent size={16} /> Tasa de Interés</label>
                      <p>{selectedLead.interestRate ? `${selectedLead.interestRate}%` : 'No especificado'}</p>
                    </div>
                    <div className="info-field full-width">
                      <label><FileText size={16} /> Observaciones</label>
                      <p className="observations-text">
                        {selectedLead.observations || 'Sin observaciones'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fotografías - Destacado */}
                <div className="info-section photos-section">
                  <h3><Image size={20} /> Fotografías de la Propiedad</h3>
                  <div className="photo-card">
                    {selectedLead.photographyFile ? (
                      <>
                        <div className="photo-info">
                          <FileText size={32} />
                          <p>Archivo de fotografías disponible</p>
                          <span className="file-name">{selectedLead.photographyFile.name}</span>
                        </div>
                        <button 
                          onClick={() => downloadFile(selectedLead.photographyFile, 'Fotografias.pdf')}
                          className="btn btn-primary btn-lg"
                        >
                          <Download size={20} />
                          Descargar Fotografías
                        </button>
                      </>
                    ) : (
                      <div className="no-photos">
                        <Image size={48} className="empty-icon" />
                        <p>No se han subido fotografías</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Otros Documentos */}
                <div className="info-section">
                  <h3>Documentos Adicionales</h3>
                  <div className="documents-grid-small">
                    <div className="document-card-small">
                      <FileText size={16} />
                      <span>DNI</span>
                      {selectedLead.dniFile ? (
                        <button 
                          onClick={() => downloadFile(selectedLead.dniFile, 'DNI.pdf')}
                          className="btn btn-secondary btn-sm"
                        >
                          <Download size={14} />
                        </button>
                      ) : (
                        <span className="no-doc-small">No subido</span>
                      )}
                    </div>
                    <div className="document-card-small">
                      <FileText size={16} />
                      <span>PUHR</span>
                      {selectedLead.puhrFile ? (
                        <button 
                          onClick={() => downloadFile(selectedLead.puhrFile, 'PUHR.pdf')}
                          className="btn btn-secondary btn-sm"
                        >
                          <Download size={14} />
                        </button>
                      ) : (
                        <span className="no-doc-small">No subido</span>
                      )}
                    </div>
                    <div className="document-card-small">
                      <FileText size={16} />
                      <span>Copia Literal</span>
                      {selectedLead.copiaLiteralFile ? (
                        <button 
                          onClick={() => downloadFile(selectedLead.copiaLiteralFile, 'Copia_Literal.pdf')}
                          className="btn btn-secondary btn-sm"
                        >
                          <Download size={14} />
                        </button>
                      ) : (
                        <span className="no-doc-small">No subido</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aprobación Legal */}
                <div className="info-section">
                  <h3>Estado Legal</h3>
                  <div className="approval-status">
                    <span className="badge" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }}>PRE-APROBADO POR LEGAL</span>
                    {selectedLead.legalApprovalComment && (
                      <p className="approval-comment">
                        <strong>Comentario:</strong> {selectedLead.legalApprovalComment}
                      </p>
                    )}
                  </div>
                </div>

                {/* Formulario de Aprobación/Rechazo */}
                {!selectedLead.commercialStatus && (
                  <div className="info-section approval-form">
                    <h3>Decisión Comercial</h3>
                    <div className="approval-options">
                      <div className="approval-option">
                        <label className="input-label">
                          <CheckCircle size={16} />
                          Comentario de Aprobación
                        </label>
                        <textarea
                          className="textarea"
                          value={approvalComment}
                          onChange={(e) => setApprovalComment(e.target.value)}
                          placeholder="Ingrese comentarios sobre la aprobación (ej: Propiedad en buen estado, ubicación favorable, etc.)"
                          rows="3"
                        ></textarea>
                      </div>
                      <div className="approval-option">
                        <label className="input-label">
                          <XCircle size={16} />
                          Motivo de Rechazo
                        </label>
                        <textarea
                          className="textarea"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Ingrese el motivo del rechazo (ej: Propiedad en mal estado, ubicación no favorable, etc.)"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {/* Estado Comercial si ya fue procesado */}
                {selectedLead.commercialStatus && (
                  <div className="info-section">
                    <h3>Estado Comercial</h3>
                    <div className="validation-status">
                      <span className={`badge ${getStatusBadge(selectedLead.commercialStatus)}`}>
                        {selectedLead.commercialStatus === 'approved' ? 'APROBADO' : 'RECHAZADO'}
                      </span>
                      {selectedLead.commercialApprovalComment && (
                        <p className="approval-comment">
                          <strong>Comentario:</strong> {selectedLead.commercialApprovalComment}
                        </p>
                      )}
                      {selectedLead.commercialRejectionReason && (
                        <p className="rejection-reason">
                          <strong>Motivo:</strong> {selectedLead.commercialRejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                {!selectedLead.commercialStatus ? (
                  <>
                    <button 
                      onClick={handleReject} 
                      className="btn btn-danger"
                      disabled={!rejectionReason.trim()}
                    >
                      <XCircle size={20} />
                      Rechazar
                    </button>
                    <button 
                      onClick={handleApprove} 
                      className="btn btn-success"
                      disabled={!approvalComment.trim()}
                    >
                      <CheckCircle size={20} />
                      Aprobar
                    </button>
                  </>
                ) : (
                  <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .commercial-panel {
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

        .search-section {
          margin-bottom: var(--spacing-xl);
        }

        .search-section h3 {
          margin: 0 0 var(--spacing-md) 0;
        }

        .search-bar {
          display: flex;
          gap: var(--spacing-md);
        }

        .search-bar .input {
          flex: 1;
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

        .stat-icon-warning {
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(251, 146, 60, 0.1));
          color: var(--color-warning);
        }

        .stat-icon-success {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
          color: var(--color-success);
        }

        .stat-icon-danger {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
          color: var(--color-danger);
        }

        .stat-icon-info {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(56, 189, 248, 0.1));
          color: var(--color-primary);
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

        .leads-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .lead-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .lead-row:hover {
          background: var(--color-bg-tertiary);
          border-color: var(--color-primary);
          transform: translateX(4px);
        }

        .lead-info {
          flex: 1;
        }

        .lead-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .lead-meta {
          display: flex;
          gap: var(--spacing-lg);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          flex-wrap: wrap;
        }

        .lead-meta span {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-2xl);
          color: var(--color-text-tertiary);
        }

        .empty-icon {
          opacity: 0.2;
          margin-bottom: var(--spacing-lg);
        }

        .empty-state h3 {
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-sm);
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
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-xl);
          animation: slideIn 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--spacing-xl);
          border-bottom: 1px solid var(--color-border);
        }

        .modal-header h2 {
          margin: 0 0 var(--spacing-xs) 0;
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
          flex-shrink: 0;
        }

        .modal-close:hover {
          background: var(--color-bg-elevated);
          color: var(--color-text-primary);
        }

        .modal-body {
          padding: var(--spacing-xl);
        }

        .info-section {
          margin-bottom: var(--spacing-xl);
        }

        .info-section:last-child {
          margin-bottom: 0;
        }

        .info-section h3 {
          margin: 0 0 var(--spacing-lg) 0;
          font-size: 1.125rem;
          color: var(--color-primary-light);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-lg);
        }

        .info-field {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .info-field.full-width {
          grid-column: 1 / -1;
        }

        .info-field label {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .info-field p {
          margin: 0;
          color: var(--color-text-primary);
          padding: var(--spacing-sm);
          background: var(--color-bg-elevated);
          border-radius: var(--radius-md);
        }

        .amount-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-success) !important;
        }

        .observations-text {
          white-space: pre-wrap;
          min-height: 60px;
        }

        .photos-section {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(56, 189, 248, 0.05));
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          border: 2px solid var(--color-primary);
        }

        .photo-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-lg);
          padding: var(--spacing-xl);
          background: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
        }

        .photo-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          text-align: center;
        }

        .photo-info p {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .file-name {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .no-photos {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
          color: var(--color-text-tertiary);
        }

        .documents-grid-small {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-md);
        }

        .document-card-small {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
        }

        .no-doc-small {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
        }

        .approval-status,
        .validation-status {
          padding: var(--spacing-lg);
          background: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .approval-comment,
        .rejection-reason {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          text-align: left;
        }

        .approval-form {
          background: var(--color-bg-elevated);
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
        }

        .approval-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-lg);
        }

        .approval-option {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .modal-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: flex-end;
          padding: var(--spacing-xl);
          border-top: 1px solid var(--color-border);
        }

        @media (max-width: 768px) {
          .info-grid,
          .documents-grid-small,
          .approval-options {
            grid-template-columns: 1fr;
          }

          .search-bar {
            flex-direction: column;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default CommercialPanel;
