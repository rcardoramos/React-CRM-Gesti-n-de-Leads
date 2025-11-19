import React, { useState } from 'react';
import { Ruler, Search, Phone, Mail, MapPin, DollarSign, FileText, User, Calendar, CheckCircle, Download, Upload, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const AppraisalManagerPanel = () => {
  const { leads, updateLead } = useData();
  const [searchDNI, setSearchDNI] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [appraisalData, setAppraisalData] = useState({
    precioTasacion: '',
    tasacionCochera: '',
    situacion: '',
    area: '',
    uso: '',
    reporteFile: null
  });

  // Filtrar leads donde el closer confirmó pago de tasación
  const leadsWithAppraisalPayment = leads.filter(
    lead => lead.closerInfo?.appraisalPaid === 'si' && lead.closerInfo?.clientAttended === 'si'
  );

  const handleSearch = () => {
    const found = leadsWithAppraisalPayment.find(lead => lead.documentNumber === searchDNI);
    if (found) {
      handleLeadClick(found);
    } else {
      setToastMessage('No se encontró ningún cliente con pago de tasación confirmado para ese DNI');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
    
    // Cargar datos existentes si ya fueron completados
    if (lead.appraisalInfo) {
      setAppraisalData(lead.appraisalInfo);
    } else {
      setAppraisalData({
        precioTasacion: '',
        tasacionCochera: '',
        situacion: '',
        area: '',
        uso: '',
        reporteFile: null
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setToastMessage('Por favor suba solo archivos PDF');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppraisalData({ ...appraisalData, reporteFile: { name: file.name, data: reader.result } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!appraisalData.precioTasacion || !appraisalData.situacion || !appraisalData.area || !appraisalData.uso || !appraisalData.reporteFile) {
      setToastMessage('Por favor complete todos los campos obligatorios, incluyendo el reporte PDF');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setIsSaving(true);
    
    setTimeout(() => {
      const appraisalInfo = {
        ...appraisalData,
        completedAt: new Date().toISOString()
      };

      updateLead(selectedLead.id, { appraisalInfo });
      setSelectedLead({ ...selectedLead, appraisalInfo });
      setIsSaving(false);
      
      // Mostrar toast de éxito
      setToastMessage('Tasación guardada exitosamente');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Cerrar modal automáticamente después de 1 segundo
      setTimeout(() => {
        setShowModal(false);
        // Resetear formulario
        setAppraisalData({
          precioTasacion: '',
          tasacionCochera: '',
          situacion: '',
          area: '',
          uso: '',
          reporteFile: null
        });
      }, 1000);
    }, 300);
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
    total: leadsWithAppraisalPayment.length,
    pending: leadsWithAppraisalPayment.filter(l => !l.appraisalInfo).length,
    completed: leadsWithAppraisalPayment.filter(l => l.appraisalInfo).length
  };

  return (
    <DashboardLayout>
      <div className="appraisal-panel">
        <div className="page-header">
          <div>
            <h1>Gestor de Tasación</h1>
            <p className="text-secondary">Evaluación y tasación de propiedades</p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.2)' }}>
              <Ruler size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Tasaciones Totales</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
              <Calendar size={24} />
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
              <p>Completadas</p>
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
              <Search size={16} />
              Buscar
            </button>
          </div>
        </div>

        {/* Lista de Propiedades para Tasar */}
        <div className="leads-section">
          <h2>Propiedades para Tasación</h2>
          {leadsWithAppraisalPayment.length > 0 ? (
            <div className="leads-grid">
              {leadsWithAppraisalPayment.map(lead => (
                <div 
                  key={lead.id} 
                  className="lead-card"
                  onClick={() => handleLeadClick(lead)}
                >
                  <div className="lead-card-header">
                    <h3>{lead.name}</h3>
                    {lead.appraisalInfo ? (
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
                      <MapPin size={14} />
                      <span>{lead.address || 'Dirección no especificada'}</span>
                    </div>
                    <div className="lead-info-item">
                      <DollarSign size={14} />
                      <span>S/ {lead.loanAmount || '0'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Ruler size={64} className="empty-icon" />
              <h3>No hay propiedades para tasar</h3>
              <p className="text-secondary">
                Las propiedades con pago de tasación confirmado aparecerán aquí
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
                  <h2>Tasación de Propiedad</h2>
                  <p className="text-secondary">{selectedLead.name}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="modal-close">×</button>
              </div>

              <div className="modal-body">
                {/* Información del Cliente (Solo Lectura) */}
                <div className="info-section">
                  <h3>Información del Cliente</h3>
                  <div className="info-grid">
                    <div className="info-field">
                      <label><User size={16} /> Nombre</label>
                      <p>{selectedLead.name}</p>
                    </div>
                    <div className="info-field">
                      <label><Phone size={16} /> Celular</label>
                      <p>{selectedLead.phone}</p>
                    </div>
                    <div className="info-field">
                      <label><Mail size={16} /> Email</label>
                      <p>{selectedLead.email}</p>
                    </div>
                    <div className="info-field">
                      <label><DollarSign size={16} /> Monto Solicitado</label>
                      <p className="amount-highlight">S/ {selectedLead.loanAmount || '0'}</p>
                    </div>
                  </div>
                </div>

                {/* Ubicación de la Propiedad */}
                <div className="info-section">
                  <h3>Ubicación de la Propiedad</h3>
                  <div className="info-grid">
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

                {/* Información del Closer (Solo Lectura) */}
                {selectedLead.closerInfo && (
                  <div className="info-section">
                    <h3>Información del Cierre</h3>
                    <div className="info-grid">
                      <div className="info-field">
                        <label><DollarSign size={16} /> Ingresos del Cliente</label>
                        <p>S/ {selectedLead.closerInfo.clientIncome || '0'}</p>
                      </div>
                      <div className="info-field">
                        <label><FileText size={16} /> Motivo del Préstamo</label>
                        <p>{selectedLead.closerInfo.loanReason || 'No especificado'}</p>
                      </div>
                      <div className="info-field">
                        <label><FileText size={16} /> Modalidad y Plan de Pago</label>
                        <p>{selectedLead.closerInfo.paymentModalityPlan || 'No especificado'}</p>
                      </div>
                      <div className="info-field">
                        <label><DollarSign size={16} /> Acuerdo de Cuota</label>
                        <p>S/ {selectedLead.closerInfo.paymentAgreement || '0'}</p>
                      </div>
                    </div>
                  </div>
                )}

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

                {/* Formulario de Tasación */}
                <div className="info-section appraisal-form-section">
                  <h3>Formulario de Tasación</h3>
                  
                  <div className="appraisal-form">
                    <div className="grid grid-cols-2">
                      <div className="input-group">
                        <label className="input-label">
                          <DollarSign size={16} />
                          Precio Tasación (S/) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={appraisalData.precioTasacion}
                          onChange={(e) => setAppraisalData({ ...appraisalData, precioTasacion: e.target.value })}
                          placeholder="0.00"
                          disabled={selectedLead.appraisalInfo}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">
                          <DollarSign size={16} />
                          Tasación de Cochera (S/)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={appraisalData.tasacionCochera}
                          onChange={(e) => setAppraisalData({ ...appraisalData, tasacionCochera: e.target.value })}
                          placeholder="0.00"
                          disabled={selectedLead.appraisalInfo}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label">
                        <FileText size={16} />
                        Situación *
                      </label>
                      <textarea
                        className="textarea"
                        value={appraisalData.situacion}
                        onChange={(e) => setAppraisalData({ ...appraisalData, situacion: e.target.value })}
                        rows="3"
                        placeholder="Describa la situación de la propiedad..."
                        disabled={selectedLead.appraisalInfo}
                        required
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2">
                      <div className="input-group">
                        <label className="input-label">
                          <Ruler size={16} />
                          Área (m²) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={appraisalData.area}
                          onChange={(e) => setAppraisalData({ ...appraisalData, area: e.target.value })}
                          placeholder="0.00"
                          disabled={selectedLead.appraisalInfo}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">
                          <FileText size={16} />
                          Uso *
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={appraisalData.uso}
                          onChange={(e) => setAppraisalData({ ...appraisalData, uso: e.target.value })}
                          placeholder="Ej: Residencial, Comercial, etc."
                          disabled={selectedLead.appraisalInfo}
                          required
                        />
                      </div>
                    </div>

                    {/* Reporte de Tasación PDF */}
                    <div className="input-group">
                      <label className="input-label">
                        <Upload size={16} />
                        Reporte de Tasación (PDF) *
                      </label>
                      {!selectedLead.appraisalInfo ? (
                        <div className="file-upload-area">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="file-input"
                            id="reporteFile"
                          />
                          <label htmlFor="reporteFile" className="file-upload-label">
                            <Upload size={20} />
                            {appraisalData.reporteFile ? (
                              <span className="file-selected">{appraisalData.reporteFile.name}</span>
                            ) : (
                              <span>Haga clic para subir el reporte PDF</span>
                            )}
                          </label>
                        </div>
                      ) : (
                        <div className="file-display">
                          <FileText size={20} />
                          <span>{selectedLead.appraisalInfo.reporteFile?.name || 'Reporte.pdf'}</span>
                          <button 
                            onClick={() => downloadFile(selectedLead.appraisalInfo.reporteFile, 'Reporte_Tasacion.pdf')}
                            className="btn btn-sm btn-primary"
                          >
                            <Download size={14} /> Descargar
                          </button>
                        </div>
                      )}
                    </div>

                    {selectedLead.appraisalInfo && (
                      <div className="completion-info">
                        <CheckCircle size={18} />
                        <div>
                          <strong>Tasación completada</strong>
                          <p>Fecha: {new Date(selectedLead.appraisalInfo.completedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={isSaving}>
                  Cerrar
                </button>
                {!selectedLead.appraisalInfo && (
                  <button onClick={handleSave} className="btn btn-success" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="spinner"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Guardar Tasación
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="toast-notification">
            <Check size={20} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .appraisal-panel {
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

        .amount-highlight {
          font-size: 1.125rem !important;
          font-weight: 700 !important;
          color: var(--color-success) !important;
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

        .appraisal-form-section {
          background: var(--color-bg-elevated);
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
          border: 2px solid var(--color-primary);
        }

        .appraisal-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .file-upload-area {
          position: relative;
        }

        .file-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .file-upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          padding: var(--spacing-xl);
          background: var(--color-bg-secondary);
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          color: var(--color-text-secondary);
        }

        .file-upload-label:hover {
          border-color: var(--color-primary);
          background: var(--color-bg-elevated);
          color: var(--color-primary);
        }

        .file-selected {
          color: var(--color-success);
          font-weight: 600;
        }

        .file-display {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .file-display span {
          flex: 1;
          color: var(--color-text-primary);
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

        /* Toast Notification */
        .toast-notification {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: var(--color-success);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          z-index: 10000;
          animation: slideInRight 0.3s ease-out;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Spinner */
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default AppraisalManagerPanel;
