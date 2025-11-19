import React, { useState } from 'react';
import { Target, Phone, Mail, Calendar, Clock, MapPin, DollarSign, CheckCircle, XCircle, FileText, User, TrendingUp, Download } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const CloserPanel = () => {
  const { leads, updateLead } = useData();
  const { user } = useAuth();
  const [searchDNI, setSearchDNI] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [closerData, setCloserData] = useState({
    clientAttended: '', // 'si' o 'no'
    acceptsTerms: '', // 'si' o 'no'
    clientIncome: '',
    loanReason: '',
    paymentAgreement: '',
    paymentModalityPlan: '',
    appraisalPaid: ''
  });

  // Filtrar leads que tienen cita agendada (aprobados por Legal y Comercial con appointment)
  const leadsWithAppointments = leads.filter(
    lead => lead.legalStatus === 'approved' && 
            lead.commercialStatus === 'approved' && 
            lead.appointment
  );

  const handleSearch = () => {
    const found = leadsWithAppointments.find(lead => lead.documentNumber === searchDNI);
    if (found) {
      handleLeadClick(found);
    } else {
      alert('No se encontró ningún cliente con cita agendada para ese DNI');
    }
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
    
    // Cargar datos existentes si ya fueron completados
    if (lead.closerInfo) {
      setCloserData(lead.closerInfo);
    } else {
      setCloserData({
        clientAttended: '',
        acceptsTerms: '',
        clientIncome: '',
        loanReason: '',
        paymentAgreement: '',
        paymentModalityPlan: '',
        appraisalPaid: ''
      });
    }
  };

  const handleSave = () => {
    if (!closerData.clientAttended) {
      alert('Por favor indique si el cliente se presentó a la cita');
      return;
    }

    // Si el cliente se presentó, validar campos obligatorios
    if (closerData.clientAttended === 'si') {
      if (!closerData.acceptsTerms || !closerData.clientIncome || !closerData.loanReason || !closerData.paymentAgreement || !closerData.appraisalPaid) {
        alert('Por favor complete todos los campos obligatorios');
        return;
      }
    }

    const closerInfo = {
      ...closerData,
      completedAt: new Date().toISOString(),
      completedBy: user.name
    };

    updateLead(selectedLead.id, { closerInfo });
    setSelectedLead({ ...selectedLead, closerInfo });
    alert('Información guardada exitosamente');
  };

  const downloadFile = (fileData, fileName) => {
    if (fileData && fileData.data) {
      const link = document.createElement('a');
      link.href = fileData.data;
      link.download = fileName || fileData.name;
      link.click();
    }
  };

  // Estadísticas
  const stats = {
    total: leadsWithAppointments.length,
    pending: leadsWithAppointments.filter(l => !l.closerInfo).length,
    completed: leadsWithAppointments.filter(l => l.closerInfo).length,
    appraisalPaid: leadsWithAppointments.filter(l => l.closerInfo?.appraisalPaid === 'si').length
  };

  return (
    <DashboardLayout>
      <div className="closer-panel">
        <div className="page-header">
          <div>
            <h1>Panel Closer</h1>
            <p className="text-secondary">Gestión de Citas y Cierre de Clientes</p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.2)' }}>
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Citas Totales</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pendientes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.completed}</h3>
              <p>Completados</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.appraisalPaid}</h3>
              <p>Tasación Pagada</p>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              className="input"
              placeholder="Buscar por DNI..."
              value={searchDNI}
              onChange={(e) => setSearchDNI(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn btn-primary">
              Buscar
            </button>
          </div>
        </div>

        {/* Lista de Leads con Citas */}
        <div className="leads-section">
          <h2>Clientes con Citas Agendadas</h2>
          {leadsWithAppointments.length > 0 ? (
            <div className="leads-grid">
              {leadsWithAppointments.map(lead => (
                <div 
                  key={lead.id} 
                  className="lead-card"
                  onClick={() => handleLeadClick(lead)}
                >
                  <div className="lead-card-header">
                    <h3>{lead.name}</h3>
                    {lead.closerInfo ? (
                      <span className="badge badge-success">Completado</span>
                    ) : (
                      <span className="badge badge-warning">Pendiente</span>
                    )}
                  </div>
                  <div className="lead-card-body">
                    <div className="lead-info-item">
                      <Phone size={14} />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="lead-info-item">
                      <Mail size={14} />
                      <span>{lead.email}</span>
                    </div>
                    <div className="lead-info-item">
                      <Calendar size={14} />
                      <span>Cita: {new Date(lead.appointment.date).toLocaleDateString()} - {lead.appointment.time}</span>
                    </div>
                    <div className="lead-info-item">
                      <MapPin size={14} />
                      <span className={`badge ${lead.appointment.meetingType === 'virtual' ? 'badge-info' : 'badge-primary'}`}>
                        {lead.appointment.meetingType === 'virtual' ? 'Virtual' : 'Presencial'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Calendar size={64} className="empty-icon" />
              <h3>No hay citas agendadas</h3>
              <p className="text-secondary">
                Las citas agendadas por los ejecutivos aparecerán aquí
              </p>
            </div>
          )}
        </div>

        {/* Modal de Detalle y Formulario */}
        {showModal && selectedLead && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{selectedLead.name}</h2>
                  <span className="badge badge-success">Cita Agendada</span>
                </div>
                <button onClick={() => setShowModal(false)} className="modal-close">×</button>
              </div>

              <div className="modal-body">
                {/* Información del Cliente */}
                <div className="info-section">
                  <h3>Información del Cliente</h3>
                  <div className="info-grid">
                    <div className="info-field">
                      <label><User size={16} /> Nombre</label>
                      <p>{selectedLead.name}</p>
                    </div>
                    <div className="info-field">
                      <label><User size={16} /> DNI</label>
                      <p>{selectedLead.documentNumber}</p>
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
                  </div>
                </div>

                {/* Información de la Cita */}
                <div className="info-section">
                  <h3>Información de la Cita</h3>
                  <div className="appointment-info-card">
                    <div className="appointment-detail">
                      <Calendar size={18} />
                      <div>
                        <strong>Fecha y Hora</strong>
                        <p>{new Date(selectedLead.appointment.date).toLocaleDateString()} - {selectedLead.appointment.time}</p>
                      </div>
                    </div>
                    <div className="appointment-detail">
                      <MapPin size={18} />
                      <div>
                        <strong>Tipo de Cita</strong>
                        <p className={`badge ${selectedLead.appointment.meetingType === 'virtual' ? 'badge-info' : 'badge-primary'}`}>
                          {selectedLead.appointment.meetingType === 'virtual' ? 'Virtual' : 'Presencial'}
                        </p>
                      </div>
                    </div>
                    <div className="appointment-detail">
                      <DollarSign size={18} />
                      <div>
                        <strong>Costo de Tasación</strong>
                        <p className="cost-highlight">S/ {parseFloat(selectedLead.appointment.appraisalCost).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documentos */}
                <div className="info-section">
                  <h3>Documentos del Cliente</h3>
                  <div className="documents-grid">
                    <div className="document-item">
                      {selectedLead.dniFile ? (
                        <button onClick={() => downloadFile(selectedLead.dniFile, 'DNI.pdf')} className="btn btn-sm btn-primary">
                          <Download size={14} /> DNI
                        </button>
                      ) : (
                        <span className="no-doc">DNI: No subido</span>
                      )}
                    </div>
                    <div className="document-item">
                      {selectedLead.puhrFile ? (
                        <button onClick={() => downloadFile(selectedLead.puhrFile, 'PUHR.pdf')} className="btn btn-sm btn-primary">
                          <Download size={14} /> PUHR
                        </button>
                      ) : (
                        <span className="no-doc">PUHR: No subido</span>
                      )}
                    </div>
                    <div className="document-item">
                      {selectedLead.copiaLiteralFile ? (
                        <button onClick={() => downloadFile(selectedLead.copiaLiteralFile, 'CopiaLiteral.pdf')} className="btn btn-sm btn-primary">
                          <Download size={14} /> Copia Literal
                        </button>
                      ) : (
                        <span className="no-doc">Copia Literal: No subida</span>
                      )}
                    </div>
                    <div className="document-item">
                      {selectedLead.photographyFile ? (
                        <button onClick={() => downloadFile(selectedLead.photographyFile, 'Fotografias.pdf')} className="btn btn-sm btn-primary">
                          <Download size={14} /> Fotografías
                        </button>
                      ) : (
                        <span className="no-doc">Fotografías: No subidas</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Formulario Closer */}
                <div className="info-section closer-form-section">
                  <h3>Información de Cierre</h3>
                  
                  <div className="closer-form">
                    {/* Asistencia a la Cita */}
                    <div className="input-group attendance-group">
                      <label className="input-label">
                        <CheckCircle size={16} />
                        ¿El cliente se presentó a la cita? *
                      </label>
                      <div className="radio-group">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="clientAttended"
                            value="si"
                            checked={closerData.clientAttended === 'si'}
                            onChange={(e) => setCloserData({ ...closerData, clientAttended: e.target.value })}
                            disabled={selectedLead.closerInfo}
                          />
                          <span>Sí</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="clientAttended"
                            value="no"
                            checked={closerData.clientAttended === 'no'}
                            onChange={(e) => setCloserData({ ...closerData, clientAttended: e.target.value })}
                            disabled={selectedLead.closerInfo}
                          />
                          <span>No</span>
                        </label>
                      </div>
                      {closerData.clientAttended === 'no' && !selectedLead.closerInfo && (
                        <div className="no-attendance-options">
                          <p className="warning-text">El cliente no asistió a la cita. Puede:</p>
                          <div className="action-buttons">
                            <button className="btn btn-warning btn-sm" onClick={() => alert('Función de reagendar en desarrollo')}>
                              <Calendar size={14} /> Reagendar Cita
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => alert('Función de marcar como perdido en desarrollo')}>
                              <XCircle size={14} /> Marcar como Perdido
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Solo mostrar el resto del formulario si el cliente asistió */}
                    {closerData.clientAttended === 'si' && (
                      <>
                        {/* Acepta Términos */}
                        <div className="input-group">
                          <label className="input-label">
                            <CheckCircle size={16} />
                            ¿Cliente acepta 10% + gastos nominales y registrales? *
                          </label>
                          <div className="radio-group">
                            <label className="radio-label">
                              <input
                                type="radio"
                                name="acceptsTerms"
                                value="si"
                                checked={closerData.acceptsTerms === 'si'}
                                onChange={(e) => setCloserData({ ...closerData, acceptsTerms: e.target.value })}
                                disabled={selectedLead.closerInfo}
                              />
                              <span>Sí</span>
                            </label>
                            <label className="radio-label">
                              <input
                                type="radio"
                                name="acceptsTerms"
                                value="no"
                                checked={closerData.acceptsTerms === 'no'}
                                onChange={(e) => setCloserData({ ...closerData, acceptsTerms: e.target.value })}
                                disabled={selectedLead.closerInfo}
                              />
                              <span>No</span>
                            </label>
                          </div>
                        </div>

                    {/* Ingresos del Cliente */}
                    <div className="input-group">
                      <label className="input-label">
                        <DollarSign size={16} />
                        Ingresos del Cliente (S/) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        value={closerData.clientIncome}
                        onChange={(e) => setCloserData({ ...closerData, clientIncome: e.target.value })}
                        placeholder="0.00"
                        disabled={selectedLead.closerInfo}
                        required
                      />
                    </div>

                    {/* Motivo de Préstamo */}
                    <div className="input-group">
                      <label className="input-label">
                        <FileText size={16} />
                        Motivo de Préstamo *
                      </label>
                      <textarea
                        className="textarea"
                        value={closerData.loanReason}
                        onChange={(e) => setCloserData({ ...closerData, loanReason: e.target.value })}
                        rows="3"
                        placeholder="Describa el motivo del préstamo..."
                        disabled={selectedLead.closerInfo}
                        required
                      ></textarea>
                    </div>

                    {/* Acuerdo de Cuota */}
                    <div className="input-group">
                      <label className="input-label">
                        <TrendingUp size={16} />
                        Acuerdo de Cuota (S/) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        value={closerData.paymentAgreement}
                        onChange={(e) => setCloserData({ ...closerData, paymentAgreement: e.target.value })}
                        placeholder="0.00"
                        disabled={selectedLead.closerInfo}
                        required
                      />
                    </div>

                    {/* Modalidad y Plan de Pago */}
                    <div className="input-group">
                      <label className="input-label">
                        <Calendar size={16} />
                        Modalidad y Plan de Pago
                      </label>
                      <textarea
                        className="textarea"
                        value={closerData.paymentModalityPlan}
                        onChange={(e) => setCloserData({ ...closerData, paymentModalityPlan: e.target.value })}
                        rows="3"
                        placeholder="Describa la modalidad y plan de pago acordado..."
                        disabled={selectedLead.closerInfo}
                      ></textarea>
                    </div>

                    {/* Pago de Tasación */}
                    <div className="input-group">
                      <label className="input-label">
                        <CheckCircle size={16} />
                        ¿Realizó pago de tasación? *
                      </label>
                      <div className="radio-group">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="appraisalPaid"
                            value="si"
                            checked={closerData.appraisalPaid === 'si'}
                            onChange={(e) => setCloserData({ ...closerData, appraisalPaid: e.target.value })}
                            disabled={selectedLead.closerInfo}
                          />
                          <span>Sí</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="appraisalPaid"
                            value="no"
                            checked={closerData.appraisalPaid === 'no'}
                            onChange={(e) => setCloserData({ ...closerData, appraisalPaid: e.target.value })}
                            disabled={selectedLead.closerInfo}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>

                    {selectedLead.closerInfo && (
                      <div className="completion-info">
                        <CheckCircle size={18} />
                        <div>
                          <strong>Información completada</strong>
                          <p>Por {selectedLead.closerInfo.completedBy} el {new Date(selectedLead.closerInfo.completedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cerrar
                </button>
                {!selectedLead.closerInfo && (
                  <button onClick={handleSave} className="btn btn-success">
                    <CheckCircle size={16} />
                    Guardar Información
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .closer-panel {
          animation: fadeIn 0.3s ease-out;
        }

        .page-header {
          margin-bottom: var(--spacing-xl);
        }

        .page-header h1 {
          margin-bottom: var(--spacing-xs);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .stat-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          transition: all var(--transition-fast);
        }

        .stat-card:hover {
          border-color: var(--color-border-light);
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary-light);
        }

        .stat-content h3 {
          font-size: 2rem;
          margin: 0;
          color: var(--color-text-primary);
        }

        .stat-content p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .search-section {
          margin-bottom: var(--spacing-xl);
        }

        .search-bar {
          display: flex;
          gap: var(--spacing-md);
          max-width: 600px;
        }

        .search-bar .input {
          flex: 1;
        }

        .leads-section h2 {
          margin-bottom: var(--spacing-lg);
        }

        .leads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--spacing-lg);
        }

        .lead-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .lead-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .lead-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--color-border);
        }

        .lead-card-header h3 {
          margin: 0;
          font-size: 1.125rem;
        }

        .lead-card-body {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .lead-info-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
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

        .appointment-info-card {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .appointment-detail {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
        }

        .appointment-detail strong {
          display: block;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .appointment-detail p {
          margin: 0;
          color: var(--color-text-primary);
        }

        .documents-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-md);
        }

        .document-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .no-doc {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
          text-align: center;
        }

        .closer-form-section {
          background: var(--color-bg-elevated);
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
        }

        .closer-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .checkbox-group {
          background: var(--color-bg-tertiary);
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .radio-group {
          display: flex;
          gap: var(--spacing-xl);
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
          font-size: 0.875rem;
        }

        .radio-label input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .completion-info {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          background: rgba(16, 185, 129, 0.1);
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--color-success);
        }

        .completion-info strong {
          display: block;
          color: var(--color-success);
          margin-bottom: var(--spacing-xs);
        }

        .completion-info p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .cost-highlight {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-success);
        }

        .attendance-group {
          background: var(--color-bg-tertiary);
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
          border: 2px solid var(--color-primary);
        }

        .no-attendance-options {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(245, 158, 11, 0.1);
          border-left: 3px solid var(--color-warning);
          border-radius: var(--radius-md);
        }

        .warning-text {
          margin: 0 0 var(--spacing-md) 0;
          font-size: 0.875rem;
          color: var(--color-warning);
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }

        .modal-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: flex-end;
          padding: var(--spacing-xl);
          border-top: 1px solid var(--color-border);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .info-grid,
          .documents-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .leads-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default CloserPanel;
