import React, { useState } from 'react';
import { Scale, FileText, Search, CheckCircle, XCircle, Download, User, Phone, Mail, MapPin, CreditCard, DollarSign, Percent } from 'lucide-react';
import { useData } from '../../context/DataContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const LegalPanel = () => {
  const { leads, updateLead } = useData();
  const [searchDNI, setSearchDNI] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Filtrar leads que están en validación
  const leadsEnValidacion = leads.filter(
    lead => lead.substatus === 'EN VALIDACIÓN'
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
      legalStatus: 'approved',
      legalApprovedAt: new Date().toISOString(),
      legalApprovalComment: approvalComment
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
      legalStatus: 'rejected',
      legalRejectedAt: new Date().toISOString(),
      legalRejectionReason: rejectionReason
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
      <div className="legal-panel">
        <div className="page-header">
          <div>
            <h1>Panel Legal</h1>
            <p className="text-secondary">Validación de documentos y aprobación de clientes</p>
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
            <div className="stat-value">{leadsEnValidacion.length}</div>
            <div className="stat-label">En Validación</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-value">
              {leads.filter(l => l.legalStatus === 'approved').length}
            </div>
            <div className="stat-label">Aprobados</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-danger">
              <XCircle size={24} />
            </div>
            <div className="stat-value">
              {leads.filter(l => l.legalStatus === 'rejected').length}
            </div>
            <div className="stat-label">Rechazados</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon stat-icon-info">
              <Scale size={24} />
            </div>
            <div className="stat-value">{leads.length}</div>
            <div className="stat-label">Total Clientes</div>
          </div>
        </div>

        {/* Lista de Leads en Validación */}
        <div className="card">
          <div className="card-header">
            <h3>Clientes en Validación</h3>
            <span className="badge badge-warning">{leadsEnValidacion.length}</span>
          </div>
          <div className="leads-list">
            {leadsEnValidacion.length > 0 ? (
              leadsEnValidacion.map(lead => (
                <div 
                  key={lead.id} 
                  className="lead-row"
                  onClick={() => {
                    setSelectedLead(lead);
                    setShowModal(true);
                  }}
                >
                  <div className="lead-info">
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-meta">
                      <span><CreditCard size={14} /> {lead.documentType}: {lead.documentNumber || 'No especificado'}</span>
                      <span><Phone size={14} /> {lead.phone}</span>
                    </div>
                  </div>
                  <div className="lead-actions-preview">
                    {lead.legalStatus ? (
                      <span className={`badge ${getStatusBadge(lead.legalStatus)}`}>
                        {lead.legalStatus === 'approved' ? 'Aprobado' : 'Rechazado'}
                      </span>
                    ) : (
                      <span className="badge badge-warning">Pendiente</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Scale size={64} className="empty-icon" />
                <h3>No hay clientes en validación</h3>
                <p className="text-secondary">
                  Los clientes con subestado "EN VALIDACIÓN" aparecerán aquí
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
                  <h2>Validación de Cliente</h2>
                  <p className="text-secondary">{selectedLead.name}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="modal-close">×</button>
              </div>

              <div className="modal-body">
                {/* Información Personal */}
                <div className="info-section">
                  <h3>Información Personal</h3>
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
                      <label><CreditCard size={16} /> Tipo de Documento</label>
                      <p>{selectedLead.documentType || 'DNI'}</p>
                    </div>
                    <div className="info-field">
                      <label><CreditCard size={16} /> Número de Documento</label>
                      <p>{selectedLead.documentNumber || 'No especificado'}</p>
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
                    <div className="info-field">
                      <label><CheckCircle size={16} /> Cumple Requisitos</label>
                      <p>
                        {selectedLead.meetsRequirements === 'si' && <span className="badge badge-success">Sí</span>}
                        {selectedLead.meetsRequirements === 'no' && <span className="badge badge-danger">No</span>}
                        {selectedLead.meetsRequirements === 'pendiente' && <span className="badge badge-warning">Pendiente</span>}
                        {!selectedLead.meetsRequirements && 'No evaluado'}
                      </p>
                    </div>
                    <div className="info-field full-width">
                      <label><FileText size={16} /> Observaciones</label>
                      <p className="observations-text">
                        {selectedLead.observations || 'Sin observaciones'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documentos */}
                <div className="info-section">
                  <h3>Documentos del Cliente</h3>
                  <div className="documents-grid">
                    <div className="document-card">
                      <div className="document-header">
                        <FileText size={20} />
                        <span>DNI</span>
                      </div>
                      {selectedLead.dniFile ? (
                        <button 
                          onClick={() => downloadFile(selectedLead.dniFile, 'DNI.pdf')}
                          className="btn btn-primary btn-sm"
                        >
                          <Download size={16} />
                          Descargar
                        </button>
                      ) : (
                        <span className="no-document">No subido</span>
                      )}
                    </div>

                    <div className="document-card">
                      <div className="document-header">
                        <FileText size={20} />
                        <span>PUHR</span>
                      </div>
                      {selectedLead.puhrFile ? (
                        <button 
                          onClick={() => downloadFile(selectedLead.puhrFile, 'PUHR.pdf')}
                          className="btn btn-primary btn-sm"
                        >
                          <Download size={16} />
                          Descargar
                        </button>
                      ) : (
                        <span className="no-document">No subido</span>
                      )}
                    </div>

                    <div className="document-card">
                      <div className="document-header">
                        <FileText size={20} />
                        <span>Copia Literal</span>
                      </div>
                      {selectedLead.copiaLiteralFile ? (
                        <button 
                          onClick={() => downloadFile(selectedLead.copiaLiteralFile, 'Copia_Literal.pdf')}
                          className="btn btn-primary btn-sm"
                        >
                          <Download size={16} />
                          Descargar
                        </button>
                      ) : (
                        <span className="no-document">No subido</span>
                      )}
                    </div>

                    <div className="document-card">
                      <div className="document-header">
                        <FileText size={20} />
                        <span>Fotografías</span>
                      </div>
                      {selectedLead.photographyFile ? (
                        <button 
                          onClick={() => downloadFile(selectedLead.photographyFile, 'Fotografias.pdf')}
                          className="btn btn-primary btn-sm"
                        >
                          <Download size={16} />
                          Descargar
                        </button>
                      ) : (
                        <span className="no-document">No subido</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estado Legal Actual */}
                {selectedLead.legalStatus && (
                  <div className="info-section">
                    <h3>Estado de Validación</h3>
                    <div className="validation-status">
                      <span 
                        className={`badge ${getStatusBadge(selectedLead.legalStatus)}`}
                        style={selectedLead.legalStatus === 'approved' ? { backgroundColor: '#14b8a6', borderColor: '#14b8a6' } : {}}
                      >
                        {selectedLead.legalStatus === 'approved' ? 'PRE-APROBADO' : 'RECHAZADO'}
                      </span>
                      {selectedLead.legalApprovalComment && (
                        <p className="approval-comment">
                          <strong>Comentario:</strong> {selectedLead.legalApprovalComment}
                        </p>
                      )}
                      {selectedLead.legalRejectionReason && (
                        <p className="rejection-reason">
                          <strong>Motivo:</strong> {selectedLead.legalRejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Formulario de Aprobación/Rechazo */}
                {!selectedLead.legalStatus && (
                  <div className="info-section approval-form">
                    <h3>Decisión Legal</h3>
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
                          placeholder="Ingrese comentarios sobre la aprobación (ej: Documentos en orden, información verificada, etc.)"
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
                          placeholder="Ingrese el motivo del rechazo (ej: Documentos incompletos, información no verificable, etc.)"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                {!selectedLead.legalStatus ? (
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
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .legal-panel {
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

        .documents-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-md);
        }

        .document-card {
          padding: var(--spacing-lg);
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
          text-align: center;
        }

        .document-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--color-primary-light);
        }

        .document-header span {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .no-document {
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
        }

        .validation-status {
          padding: var(--spacing-lg);
          padding: var(--spacing-xl);
          border-top: 1px solid var(--color-border);
        }

        @media (max-width: 768px) {
          .info-grid,
          .documents-grid {
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

export default LegalPanel;
