import React, { useState } from 'react';
import { FileCheck, Phone, Mail, MapPin, Download, UserPlus, Search, X, Save, User, CheckCircle, DollarSign, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const AppraisalReportsPage = () => {
  const { leads, createAssignment, findInvestorByDNI, assignments } = useData();
  const { user } = useAuth();

  // Estados para el modal de asignación
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchDNI, setSearchDNI] = useState('');
  const [foundInvestor, setFoundInvestor] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mortgageData, setMortgageData] = useState({
    mortgageAmount: '',
    amountToBorrower: '',
    amountToDominick: '',
    interestRate: '',
    termMonths: '',
    modality: 'Mensual'
  });
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Obtener todos los leads de préstamo con tasación completada
  const appraisalReports = leads.filter(lead => 
    (lead.leadType === 'préstamo' || !lead.leadType) && 
    lead.appraisalInfo && 
    lead.appraisalInfo.completedAt
  );

  // Verificar si un reporte ya está asignado
  const isAssigned = (leadId) => {
    return assignments?.some(a => a.loanLeadId === leadId);
  };

  const getAssignmentInfo = (leadId) => {
    return assignments?.find(a => a.loanLeadId === leadId);
  };

  const handleOpenAssignment = (report) => {
    setSelectedReport(report);
    setSearchDNI('');
    setFoundInvestor(null);
    setSearchError('');
    setFormErrors({});
    setShowSuccess(false);
    setMortgageData({
      mortgageAmount: '',
      amountToBorrower: '',
      amountToDominick: '',
      interestRate: '',
      termMonths: '',
      modality: 'Mensual'
    });
    setShowAssignmentModal(true);
  };

  const handleSearchInvestor = () => {
    if (!searchDNI.trim()) {
      setSearchError('Ingrese un DNI para buscar');
      return;
    }

    setIsSearching(true);
    setSearchError('');

    // Simular búsqueda con delay
    setTimeout(() => {
      const investor = findInvestorByDNI(searchDNI);
      
      if (investor) {
        // Verificar si el inversionista ya está asignado
        const alreadyAssigned = assignments?.some(a => a.investorLeadId === investor.id);
        if (alreadyAssigned) {
          setSearchError('Este inversionista ya está asignado a otro préstamo');
          setFoundInvestor(null);
        } else {
          setFoundInvestor(investor);
          setSearchError('');
        }
      } else {
        setFoundInvestor(null);
        setSearchError('No se encontró ningún inversionista con este DNI');
      }
      setIsSearching(false);
    }, 500);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!mortgageData.mortgageAmount || parseFloat(mortgageData.mortgageAmount) <= 0) {
      errors.mortgageAmount = 'Requerido';
    }
    if (!mortgageData.amountToBorrower || parseFloat(mortgageData.amountToBorrower) <= 0) {
      errors.amountToBorrower = 'Requerido';
    }
    if (!mortgageData.amountToDominick || parseFloat(mortgageData.amountToDominick) <= 0) {
      errors.amountToDominick = 'Requerido';
    }
    if (!mortgageData.interestRate || parseFloat(mortgageData.interestRate) <= 0) {
      errors.interestRate = 'Requerido';
    }
    if (!mortgageData.termMonths || parseInt(mortgageData.termMonths) <= 0) {
      errors.termMonths = 'Requerido';
    }

    // Validar que la suma de montos no exceda el monto de hipoteca
    const total = parseFloat(mortgageData.amountToBorrower || 0) + parseFloat(mortgageData.amountToDominick || 0);
    const mortgage = parseFloat(mortgageData.mortgageAmount || 0);
    
    if (total > mortgage) {
      errors.amountToBorrower = 'La suma excede el monto de hipoteca';
      errors.amountToDominick = 'La suma excede el monto de hipoteca';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAssignment = (e) => {
    e.preventDefault();
    
    if (!selectedReport || !foundInvestor) return;
    
    if (!validateForm()) return;

    setIsSaving(true);
    
    // Delay para mostrar loading
    setTimeout(() => {
      const assignmentData = {
        loanLeadId: selectedReport.id,
        investorLeadId: foundInvestor.id,
        assignedBy: user.id,
        assignedByName: user.name,
        
        // Datos del préstamo original
        loanAmount: selectedReport.loanAmount || 0,
        appraisalAmount: selectedReport.appraisalInfo.precioTasacion,
        
        // Datos del formulario
        mortgageAmount: parseFloat(mortgageData.mortgageAmount),
        amountToBorrower: parseFloat(mortgageData.amountToBorrower),
        amountToDominick: parseFloat(mortgageData.amountToDominick),
        interestRate: parseFloat(mortgageData.interestRate),
        termMonths: parseInt(mortgageData.termMonths),
        modality: mortgageData.modality,
        
        // Datos de los clientes para referencia rápida
        borrowerName: selectedReport.name,
        borrowerDNI: selectedReport.documentNumber,
        investorName: foundInvestor.name,
        investorDNI: foundInvestor.documentNumber
      };

      createAssignment(assignmentData);
      setIsSaving(false);
      setShowSuccess(true);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowAssignmentModal(false);
        setShowSuccess(false);
        // Resetear formulario
        setSearchDNI('');
        setFoundInvestor(null);
        setMortgageData({
          mortgageAmount: '',
          amountToBorrower: '',
          amountToDominick: '',
          interestRate: '',
          termMonths: '',
          modality: 'Mensual'
        });
      }, 2000);
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

  return (
    <DashboardLayout>
      <div className="appraisal-reports-page">
        <div className="page-header">
          <div>
            <h1>Reportes de Tasación</h1>
            <p className="text-secondary">
              {appraisalReports.length} {appraisalReports.length === 1 ? 'reporte disponible' : 'reportes disponibles'}
            </p>
          </div>
        </div>

        {appraisalReports.length > 0 ? (
          <div className="reports-grid">
            {appraisalReports.map(lead => {
              const assigned = isAssigned(lead.id);
              const assignment = getAssignmentInfo(lead.id);

              return (
                <div key={lead.id} className={`report-card ${assigned ? 'assigned' : ''}`}>
                  <div className="report-header">
                    <div className="report-title">
                      <FileCheck size={24} className="report-icon" />
                      <div>
                        <h3>{lead.name}</h3>
                        <p className="report-date">
                          Completado: {new Date(lead.appraisalInfo.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {assigned ? (
                      <>
                        <span className="badge badge-info">Asignado</span>
                        <span className="badge badge-warning">Oportunidad Tomada</span>
                      </>
                    ) : lead.hasInvestorAssigned ? (
                      <span className="badge badge-warning">Oportunidad Tomada</span>
                    ) : (
                      <span className="badge badge-success">Completo</span>
                    )}
                  </div>

                  <div className="report-body">
                    {assigned && (
                      <div className="assigned-banner">
                        <User size={16} />
                        <span>Inversionista: <strong>{assignment.investorName}</strong></span>
                      </div>
                    )}

                    <div className="report-section">
                      <h4>Información del Cliente</h4>
                      <div className="report-info-grid">
                        <div className="report-info-item">
                          <Phone size={14} />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="report-info-item">
                          <Mail size={14} />
                          <span>{lead.email}</span>
                        </div>
                        <div className="report-info-item">
                          <MapPin size={14} />
                          <span>{lead.address || 'No especificado'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="report-section">
                      <h4>Ubicación de la Propiedad</h4>
                      <div className="report-info-grid">
                        <div className="report-info-item">
                          <MapPin size={14} />
                          <span>{lead.departamento || 'N/A'}</span>
                        </div>
                        <div className="report-info-item">
                          <MapPin size={14} />
                          <span>{lead.provincia || 'N/A'}</span>
                        </div>
                        <div className="report-info-item">
                          <MapPin size={14} />
                          <span>{lead.distrito || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="report-section">
                      <h4>Detalles de Tasación</h4>
                      <div className="report-details">
                        <div className="detail-row">
                          <span className="detail-label">Precio Tasación:</span>
                          <span className="detail-value">S/ {lead.appraisalInfo.precioTasacion}</span>
                        </div>
                        {lead.appraisalInfo.tasacionCochera && (
                          <div className="detail-row">
                            <span className="detail-label">Tasación Cochera:</span>
                            <span className="detail-value">S/ {lead.appraisalInfo.tasacionCochera}</span>
                          </div>
                        )}
                        <div className="detail-row">
                          <span className="detail-label">Área:</span>
                          <span className="detail-value">{lead.appraisalInfo.area} m²</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Uso:</span>
                          <span className="detail-value">{lead.appraisalInfo.uso}</span>
                        </div>
                        {lead.commercialInterestRate && (
                          <div className="detail-row highlight">
                            <span className="detail-label">Tasa de Interés (Comercial):</span>
                            <span className="detail-value">{lead.commercialInterestRate}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="report-footer">
                    <div className="footer-actions">
                      {lead.appraisalInfo.reporteFile && (
                        <button
                          onClick={() => downloadFile(lead.appraisalInfo.reporteFile, `Reporte_Tasacion_${lead.name}.pdf`)}
                          className="btn btn-secondary btn-block"
                        >
                          <Download size={18} />
                          Descargar PDF
                        </button>
                      )}
                      
                      {!assigned && (
                        <button
                          onClick={() => handleOpenAssignment(lead)}
                          className="btn btn-primary btn-block"
                        >
                          <UserPlus size={18} />
                          Asignar Inversionista
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <FileCheck size={64} className="empty-icon" />
            <h3>No hay reportes de tasación disponibles</h3>
            <p className="text-secondary">
              Los reportes completados por el gestor de tasación aparecerán aquí
            </p>
          </div>
        )}

        {/* Modal de Asignación */}
        {showAssignmentModal && selectedReport && (
          <div className="modal-overlay" onClick={() => setShowAssignmentModal(false)}>
            <div className="modal-content assignment-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Asignar Inversionista</h2>
                <button className="close-btn" onClick={() => setShowAssignmentModal(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <div className="modal-body">
                {showSuccess ? (
                  <div className="success-message">
                    <CheckCircle size={48} />
                    <h3>¡Asignación Exitosa!</h3>
                    <p>El inversionista ha sido vinculado correctamente</p>
                  </div>
                ) : (
                  <>
                    {/* Paso 1: Buscar Inversionista */}
                    <div className="assignment-step">
                      <h3>1. Buscar Inversionista</h3>
                      <div className="search-box">
                        <input
                          type="text"
                          placeholder="Ingrese DNI del inversionista"
                          value={searchDNI}
                          onChange={(e) => setSearchDNI(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchInvestor()}
                          className="form-input"
                        />
                        <button 
                          onClick={handleSearchInvestor} 
                          className="btn btn-primary"
                          disabled={isSearching}
                        >
                          <Search size={18} />
                          {isSearching ? 'Buscando...' : 'Buscar'}
                        </button>
                      </div>
                      {searchError && (
                        <div className="error-message">
                          <AlertCircle size={16} />
                          {searchError}
                        </div>
                      )}
                      
                      {foundInvestor && (
                        <div className="investor-card-preview">
                          <div className="preview-icon">
                            <User size={24} />
                          </div>
                          <div className="preview-info">
                            <h4>{foundInvestor.name}</h4>
                            <p>{foundInvestor.email}</p>
                            <p className="text-sm text-secondary">DNI: {foundInvestor.documentNumber}</p>
                          </div>
                          <div className="preview-check">
                            <CheckCircle size={24} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Paso 2: Detalles de Hipoteca */}
                    {foundInvestor && (
                      <form onSubmit={handleSaveAssignment} className="assignment-step">
                        <h3>2. Detalles de la Hipoteca</h3>
                        
                        <div className="summary-grid">
                          <div className="summary-item">
                            <span className="label">Solicitante:</span>
                            <span className="value">{selectedReport.name}</span>
                          </div>
                          <div className="summary-item">
                            <span className="label">Monto de Tasación:</span>
                            <span className="value">S/ {selectedReport.appraisalInfo.precioTasacion}</span>
                          </div>
                        </div>

                        <div className="form-grid">
                          <div className="form-group">
                            <label>Monto de Hipoteca *</label>
                            <div className="input-wrapper">
                              <DollarSign size={16} className="input-icon" />
                              <input
                                type="number"
                                step="0.01"
                                value={mortgageData.mortgageAmount}
                                onChange={(e) => setMortgageData({...mortgageData, mortgageAmount: e.target.value})}
                                className={`form-input with-icon ${formErrors.mortgageAmount ? 'error' : ''}`}
                                placeholder="0.00"
                              />
                            </div>
                            {formErrors.mortgageAmount && <span className="field-error">{formErrors.mortgageAmount}</span>}
                          </div>

                          <div className="form-group">
                            <label>Monto al Mutuario *</label>
                            <div className="input-wrapper">
                              <DollarSign size={16} className="input-icon" />
                              <input
                                type="number"
                                step="0.01"
                                value={mortgageData.amountToBorrower}
                                onChange={(e) => setMortgageData({...mortgageData, amountToBorrower: e.target.value})}
                                className={`form-input with-icon ${formErrors.amountToBorrower ? 'error' : ''}`}
                                placeholder="0.00"
                              />
                            </div>
                            {formErrors.amountToBorrower && <span className="field-error">{formErrors.amountToBorrower}</span>}
                          </div>

                          <div className="form-group">
                            <label>Monto a Dominick Pro *</label>
                            <div className="input-wrapper">
                              <DollarSign size={16} className="input-icon" />
                              <input
                                type="number"
                                step="0.01"
                                value={mortgageData.amountToDominick}
                                onChange={(e) => setMortgageData({...mortgageData, amountToDominick: e.target.value})}
                                className={`form-input with-icon ${formErrors.amountToDominick ? 'error' : ''}`}
                                placeholder="0.00"
                              />
                            </div>
                            {formErrors.amountToDominick && <span className="field-error">{formErrors.amountToDominick}</span>}
                          </div>

                          <div className="form-group">
                            <label>Tasa de Interés (%) *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={mortgageData.interestRate}
                              onChange={(e) => setMortgageData({...mortgageData, interestRate: e.target.value})}
                              className={`form-input ${formErrors.interestRate ? 'error' : ''}`}
                              placeholder="Ej: 1.5"
                            />
                            {formErrors.interestRate && <span className="field-error">{formErrors.interestRate}</span>}
                          </div>

                          <div className="form-group">
                            <label>Plazo (Meses) *</label>
                            <input
                              type="number"
                              value={mortgageData.termMonths}
                              onChange={(e) => setMortgageData({...mortgageData, termMonths: e.target.value})}
                              className={`form-input ${formErrors.termMonths ? 'error' : ''}`}
                              placeholder="Ej: 12"
                            />
                            {formErrors.termMonths && <span className="field-error">{formErrors.termMonths}</span>}
                          </div>

                          <div className="form-group">
                            <label>Modalidad *</label>
                            <select
                              value={mortgageData.modality}
                              onChange={(e) => setMortgageData({...mortgageData, modality: e.target.value})}
                              className="form-input"
                            >
                              <option value="Mensual">Mensual</option>
                              <option value="Trimestral">Trimestral</option>
                              <option value="Semestral">Semestral</option>
                              <option value="Anual">Anual</option>
                              <option value="Al Vencimiento">Al Vencimiento</option>
                            </select>
                          </div>
                        </div>

                        <div className="modal-actions">
                          <button type="button" onClick={() => setShowAssignmentModal(false)} className="btn btn-secondary" disabled={isSaving}>
                            Cancelar
                          </button>
                          <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <div className="spinner"></div>
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Save size={18} />
                                Guardar Asignación
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .appraisal-reports-page {
          animation: fadeIn 0.3s ease-out;
        }

        .page-header {
          margin-bottom: var(--spacing-xl);
        }

        .page-header h1 {
          margin-bottom: var(--spacing-xs);
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
          gap: var(--spacing-xl);
        }

        .report-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--transition-normal);
          display: flex;
          flex-direction: column;
        }

        .report-card.assigned {
          border-color: var(--color-info);
        }

        .report-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--color-border);
          background: var(--color-bg-elevated);
        }

        .report-title {
          display: flex;
          gap: var(--spacing-md);
          align-items: flex-start;
        }

        .report-icon {
          color: var(--color-success);
        }

        .report-title h3 {
          margin: 0;
          font-size: 1.125rem;
        }

        .report-date {
          margin: var(--spacing-xs) 0 0 0;
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
        }

        .assigned-banner {
          background: var(--color-bg-info-subtle);
          color: var(--color-info);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 0.875rem;
          margin-bottom: var(--spacing-md);
        }

        .report-body {
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
          flex: 1;
        }

        .report-section h4 {
          margin: 0 0 var(--spacing-md) 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .report-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-sm);
        }

        .report-info-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.875rem;
          color: var(--color-text-primary);
        }

        .report-details {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm);
          background: var(--color-bg-elevated);
          border-radius: var(--radius-sm);
        }

        .detail-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.875rem;
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .report-footer {
          padding: var(--spacing-lg);
          border-top: 1px solid var(--color-border);
          background: var(--color-bg-elevated);
        }

        .footer-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .btn-block {
          width: 100%;
          justify-content: center;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-4xl);
          text-align: center;
        }

        .empty-icon {
          color: var(--color-text-tertiary);
          margin-bottom: var(--spacing-lg);
        }

        .empty-state h3 {
          margin-bottom: var(--spacing-sm);
          color: var(--color-text-primary);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease-out;
          padding: var(--spacing-lg);
        }

        .assignment-modal {
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border-radius: var(--radius-xl);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-body {
          padding: var(--spacing-2xl);
          background: var(--color-bg-elevated);
        }

        .assignment-step {
          background: var(--color-bg-secondary);
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-xl);
          border: 1px solid var(--color-border);
          transition: all var(--transition-normal);
        }

        .assignment-step:hover {
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .assignment-step:last-child {
          margin-bottom: 0;
        }

        .assignment-step h3 {
          margin: 0 0 var(--spacing-lg) 0;
          color: var(--color-primary);
          font-size: 1.25rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .assignment-step h3::before {
          content: '';
          width: 4px;
          height: 24px;
          background: var(--color-primary);
          border-radius: var(--radius-sm);
        }

        /* Enhanced Search Box */
        .search-box {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          position: relative;
        }

        .search-box input {
          flex: 1;
          padding: 1rem 1rem 1rem 3rem;
          font-size: 1rem;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-bg-elevated);
          transition: all var(--transition-normal);
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: white;
        }

        .search-box input::placeholder {
          color: var(--color-text-tertiary);
        }

        .search-box::before {
          content: '';
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2'/%3E%3C/svg%3E") no-repeat center;
          background-size: contain;
          pointer-events: none;
          z-index: 1;
        }

        .search-box .btn {
          padding: 1rem 2rem;
          font-weight: 600;
          min-width: 140px;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .search-box .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .error-message {
          color: var(--color-error);
          background: var(--color-bg-error-subtle);
          padding: var(--spacing-md) var(--spacing-lg);
          border-radius: var(--radius-md);
          font-size: 0.9375rem;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-sm);
          border-left: 4px solid var(--color-error);
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Investor Card Preview */
        .investor-card-preview {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 2px solid var(--color-success);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-top: var(--spacing-lg);
          animation: slideUp 0.3s ease-out;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .preview-icon {
          background: var(--color-success);
          color: white;
          padding: var(--spacing-lg);
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .preview-info {
          flex: 1;
        }

        .preview-info h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1.25rem;
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .preview-info p {
          margin: var(--spacing-xs) 0 0 0;
          color: var(--color-text-secondary);
          font-size: 0.9375rem;
        }

        .preview-check {
          color: var(--color-success);
          animation: scaleIn 0.3s ease-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        /* Summary Grid */
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-lg);
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-xl);
          border: 1px solid #bfdbfe;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .summary-item .label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-item .value {
          font-weight: 700;
          font-size: 1.375rem;
          color: var(--color-primary);
        }

        /* Form Grid */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--spacing-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .form-group label {
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 0.9375rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-tertiary);
          pointer-events: none;
        }

        .form-input.with-icon {
          padding-left: 42px;
        }

        .form-input {
          padding: 0.875rem 1rem;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
          transition: all var(--transition-normal);
          background: var(--color-bg-elevated);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: white;
        }

        .form-input.error {
          border-color: var(--color-error);
          background: var(--color-bg-error-subtle);
        }

        .field-error {
          color: var(--color-error);
          font-size: 0.8125rem;
          margin-top: var(--spacing-xs);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        /* Modal Actions */
        .modal-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: flex-end;
          padding: var(--spacing-xl) var(--spacing-2xl);
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border);
          border-radius: 0 0 var(--radius-xl) var(--radius-xl);
        }

        .modal-actions .btn {
          min-width: 140px;
          padding: 0.875rem 1.5rem;
          font-weight: 600;
        }

        /* Success Message */
        .success-message {
          text-align: center;
          padding: var(--spacing-4xl) var(--spacing-2xl);
          animation: slideUp 0.3s ease-out;
        }

        .success-message svg {
          color: var(--color-success);
          margin-bottom: var(--spacing-xl);
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .success-message h3 {
          margin-bottom: var(--spacing-md);
          color: var(--color-success);
          font-size: 1.75rem;
          font-weight: 700;
        }

        .success-message p {
          color: var(--color-text-secondary);
          font-size: 1.125rem;
        }

        @media (max-width: 768px) {
          .reports-grid {
            grid-template-columns: 1fr;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Highlight for important info */
        .detail-row.highlight {
          background: var(--color-bg-primary-subtle);
          border-left: 3px solid var(--color-primary);
          font-weight: 600;
        }

        .detail-row.highlight .detail-value {
          color: var(--color-primary);
          font-size: 1rem;
        }

        /* Improved Modal Styling */
        .modal-content {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
        }

        .modal-header {
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          color: white;
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }

        .modal-header h2 {
          color: white;
          margin: 0;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background var(--transition-normal);
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Spinner for loading states */
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
      `}</style>
    </DashboardLayout>
  );
};

export default AppraisalReportsPage;
