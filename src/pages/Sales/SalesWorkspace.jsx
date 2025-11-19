import React, { useState } from 'react';
import { Target, Phone, Mail, Calendar, CheckCircle, XCircle, Clock, MapPin, CreditCard, DollarSign, Percent, FileText, X, Edit2, Upload, File, Download } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const SalesWorkspace = () => {
  const { getMyLeads, updateLead } = useData();
  const { user } = useAuth();
  const myLeads = getMyLeads();
  const [filter, setFilter] = useState('todos');
  const [selectedLead, setSelectedLead] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    meetingType: 'presencial',
    appraisalCost: ''
  });

  const filteredLeads = filter === 'todos' 
    ? myLeads 
    : myLeads.filter(lead => lead.status === filter);

  const statusOptions = [
    { value: 'nuevo', label: 'Nuevo', icon: Clock, color: 'info' },
    { value: 'contactado', label: 'Contactado', icon: Phone, color: 'warning' },
    { value: 'contacto_no_efectivo', label: 'Contacto No Efectivo', icon: XCircle, color: 'danger' },
    { value: 'no_contactado', label: 'No Contactado', icon: Phone, color: 'danger' },
    { value: 'calificado', label: 'Calificado', icon: Target, color: 'primary' },
    { value: 'ganado', label: 'Ganado', icon: CheckCircle, color: 'success' },
    { value: 'perdido', label: 'Perdido', icon: XCircle, color: 'danger' }
  ];

  const substatusOptions = {
    contactado: [
      'INTERESADO',
      'GESTION WHATSAPP',
      'INVERSIONISTA',
      'AGENDADO POTENCIAL',
      'CITA',
      'SEGUIMIENTO',
      'EN VALIDACIÓN'
    ],
    contacto_no_efectivo: [
      'NO CALIFICA (0)',
      'PRÉSTAMOS MENOS DE 15 MIL',
      'CONSIGUIÓ PRÉSTAMO',
      'NO INTERESADO',
      'LLAMADA MUDA',
      'GESTIONADO POR OTRO AGENTE',
      'CONTACTO CON TERCEROS',
      'FALLECIÓ',
      'NÚMERO EQUIVOCADO',
      'NIEGA HABER DEJADO DATOS',
      'ABANDONA LLAMADA',
      'CORTA LA LLAMADA',
      'VOLVER A LLAMAR'
    ],
    no_contactado: [
      'TELÉFONO NO EXISTE',
      'NÚMERO SUSPENDIDO / FUERA DE SERVICIO',
      'NO CONTESTA',
      'APAGADO'
    ]
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      nuevo: 'badge-info',
      contactado: 'badge-warning',
      contacto_no_efectivo: 'badge-danger',
      no_contactado: 'badge-danger',
      calificado: 'badge-primary',
      ganado: 'badge-success',
      perdido: 'badge-danger'
    };
    return statusMap[status] || 'badge-info';
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name || '',
      address: lead.address || '',
      documentNumber: lead.documentNumber || '',
      documentType: lead.documentType || 'DNI',
      departamento: lead.departamento || '',
      provincia: lead.provincia || '',
      distrito: lead.distrito || '',
      loanAmount: lead.loanAmount || '',
      interestRate: lead.interestRate || '',
      meetsRequirements: lead.meetsRequirements || '',
      observations: lead.observations || '',
      dniFile: lead.dniFile || null,
      puhrFile: lead.puhrFile || null,
      copiaLiteralFile: lead.copiaLiteralFile || null,
      photographyFile: lead.photographyFile || null,
      status: lead.status,
      substatus: lead.substatus || ''
    });
    setShowModal(true);
    setEditMode(false);
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [fieldName]: { name: file.name, data: reader.result } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateLead(selectedLead.id, formData);
    setSelectedLead({ ...selectedLead, ...formData });
    setEditMode(false);
  };

  const handleClose = () => {
    setSelectedLead(null);
    setEditMode(false);
  };

  const downloadFile = (fileData, fileName) => {
    if (fileData && fileData.data) {
      const link = document.createElement('a');
      link.href = fileData.data;
      link.download = fileName || fileData.name;
      link.click();
    }
  };

  const isFullyApproved = (lead) => {
    return lead.legalStatus === 'approved' && lead.commercialStatus === 'approved';
  };

  const handleOpenAppointmentModal = () => {
    if (selectedLead.appointment) {
      setAppointmentData({
        date: selectedLead.appointment.date || '',
        time: selectedLead.appointment.time || '',
        meetingType: selectedLead.appointment.meetingType || 'presencial',
        appraisalCost: selectedLead.appointment.appraisalCost || ''
      });
    } else {
      setAppointmentData({
        date: '',
        time: '',
        meetingType: 'presencial',
        appraisalCost: ''
      });
    }
    setShowAppointmentModal(true);
  };

  const handleSaveAppointment = () => {
    if (!appointmentData.date || !appointmentData.time || !appointmentData.appraisalCost) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const appointmentInfo = {
      ...appointmentData,
      createdAt: new Date().toISOString()
    };

    updateLead(selectedLead.id, { appointment: appointmentInfo });
    setSelectedLead({ ...selectedLead, appointment: appointmentInfo });
    setShowAppointmentModal(false);
    setAppointmentData({
      date: '',
      time: '',
      meetingType: 'presencial',
      appraisalCost: ''
    });
  };

  return (
    <DashboardLayout>
      <div className="sales-workspace">
        <div className="page-header">
          <div>
            <h1>Mi Espacio de Trabajo</h1>
            <p className="text-secondary">Gestiona tus leads asignados</p>
          </div>
          <div className="header-stats">
            <div className="stat-pill">
              <Target size={18} />
              <span>{myLeads.length} Leads</span>
            </div>
          </div>
        </div>

        <div className="filter-bar">
          <button 
            className={`filter-btn ${filter === 'todos' ? 'active' : ''}`}
            onClick={() => setFilter('todos')}
          >
            Todos ({myLeads.length})
          </button>
          {statusOptions.map(status => {
            const count = myLeads.filter(l => l.status === status.value).length;
            return (
              <button
                key={status.value}
                className={`filter-btn ${filter === status.value ? 'active' : ''}`}
                onClick={() => setFilter(status.value)}
              >
                {status.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="leads-list">
          {filteredLeads.length > 0 ? (
            filteredLeads.map(lead => (
              <div 
                key={lead.id} 
                className="lead-row"
                onClick={() => handleLeadClick(lead)}
              >
                <div className="lead-main-info">
                  <div className="lead-name-section">
                    <h3>{lead.name}</h3>
                    <div className="badges-group">
                      <span className={`badge ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                      {/* Badge Legal */}
                      {lead.legalStatus === 'approved' && (
                        <span className="badge approval-badge" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }}>
                          PRE-APROBADO - Legal
                        </span>
                      )}
                      {lead.legalStatus === 'rejected' && (
                        <span className="badge badge-danger approval-badge">
                          RECHAZADO - Legal
                        </span>
                      )}
                      {/* Badge Comercial */}
                      {lead.commercialStatus === 'approved' && (
                        <span className="badge badge-success approval-badge">
                          APROBADO - Comercial
                        </span>
                      )}
                      {lead.commercialStatus === 'rejected' && (
                        <span className="badge badge-danger approval-badge">
                          RECHAZADO - Comercial
                        </span>
                      )}
                      {/* Badge Tasación */}
                      {lead.closerInfo?.appraisalPaid === 'si' && !lead.appraisalInfo && (
                        <span className="badge badge-warning approval-badge">
                          TASACIÓN PENDIENTE
                        </span>
                      )}
                      {lead.appraisalInfo && (
                        <span className="badge badge-success approval-badge">
                          TASACIÓN COMPLETA
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="lead-contact-info">
                    <div className="info-item">
                      <Phone size={14} />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="info-item">
                      <Mail size={14} />
                      <span>{lead.email}</span>
                    </div>
                  </div>
                </div>
                <div className="lead-meta">
                  {lead.assignedAt && (
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{new Date(lead.assignedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Target size={64} className="empty-icon" />
              <h3>No hay leads {filter !== 'todos' ? `con estado "${filter}"` : 'asignados'}</h3>
              <p className="text-secondary">
                Los leads que te asignen aparecerán aquí
              </p>
            </div>
          )}
        </div>

        {selectedLead && (
          <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{selectedLead.name}</h2>
                  <span className={`badge ${getStatusBadge(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                </div>
                <button onClick={handleClose} className="modal-close">×</button>
              </div>

              <div className="modal-body">
                <div className="info-section">
                  <h3>Información de Contacto</h3>
                  <div className="info-grid">
                    <div className="info-field">
                      <label><Phone size={16} /> Teléfono</label>
                      <p>{selectedLead.phone}</p>
                    </div>
                    <div className="info-field">
                      <label><Mail size={16} /> Email</label>
                      <p>{selectedLead.email}</p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="section-header">
                    <h3>Información del Cliente</h3>
                    {!editMode && (
                      <button onClick={() => setEditMode(true)} className="btn btn-secondary btn-sm">
                        <Edit2 size={16} />
                        Editar
                      </button>
                    )}
                  </div>

                  {editMode ? (
                    <div className="edit-form">
                      <div className="input-group">
                        <label className="input-label">
                          <Edit2 size={16} />
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ingrese nombre completo"
                        />
                      </div>

                      <div className="grid grid-cols-2">
                        <div className="input-group">
                          <label className="input-label">
                            <MapPin size={16} />
                            Dirección
                          </label>
                          <input
                            type="text"
                            className="input"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Ingrese dirección"
                          />
                        </div>
                        <div className="input-group">
                          <label className="input-label">
                            <CreditCard size={16} />
                            Tipo de Documento
                          </label>
                          <select
                            className="select"
                            value={formData.documentType}
                            onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                          >
                            <option value="DNI">DNI</option>
                            <option value="CE">CE (Carnet de Extranjería)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3">
                        <div className="input-group">
                          <label className="input-label">
                            <MapPin size={16} />
                            Departamento
                          </label>
                          <input
                            type="text"
                            className="input"
                            value={formData.departamento}
                            onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                            placeholder="Ej: Lima"
                          />
                        </div>
                        <div className="input-group">
                          <label className="input-label">
                            <MapPin size={16} />
                            Provincia
                          </label>
                          <input
                            type="text"
                            className="input"
                            value={formData.provincia}
                            onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                            placeholder="Ej: Lima"
                          />
                        </div>
                        <div className="input-group">
                          <label className="input-label">
                            <MapPin size={16} />
                            Distrito
                          </label>
                          <input
                            type="text"
                            className="input"
                            value={formData.distrito}
                            onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                            placeholder="Ej: Miraflores"
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label className="input-label">
                          <CreditCard size={16} />
                          Número de Documento
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={formData.documentNumber}
                          onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                          placeholder="Ingrese número de documento"
                        />
                      </div>

                      <div className="grid grid-cols-2">
                        <div className="input-group">
                          <label className="input-label">
                            <DollarSign size={16} />
                            Monto del Préstamo
                          </label>
                          <input
                            type="number"
                            className="input"
                            value={formData.loanAmount}
                            onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="input-group">
                          <label className="input-label">
                            <Percent size={16} />
                            Tasa de Interés (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="input"
                            value={formData.interestRate}
                            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label className="input-label">
                          <CheckCircle size={16} />
                          ¿Cumple Requisitos?
                        </label>
                        <select
                          className="select"
                          value={formData.meetsRequirements}
                          onChange={(e) => setFormData({ ...formData, meetsRequirements: e.target.value })}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="si">Sí</option>
                          <option value="no">No</option>
                          <option value="pendiente">Pendiente de Evaluación</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label className="input-label">
                          <FileText size={16} />
                          Observaciones
                        </label>
                        <textarea
                          className="textarea"
                          value={formData.observations}
                          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                          rows="4"
                          placeholder="Detalles adicionales, comentarios, etc."
                        ></textarea>
                      </div>

                      <div className="documents-section">
                        <h4>Documentos del Cliente</h4>
                        <div className="grid grid-cols-4">
                          <div className="input-group">
                            <label className="input-label">
                              <Upload size={16} />
                              DNI
                            </label>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange(e, 'dniFile')}
                              className="file-input"
                            />
                            {formData.dniFile && (
                              <div className="file-preview">
                                <File size={14} />
                                <span>{formData.dniFile.name}</span>
                              </div>
                            )}
                          </div>

                          <div className="input-group">
                            <label className="input-label">
                              <Upload size={16} />
                              PUHR
                            </label>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange(e, 'puhrFile')}
                              className="file-input"
                            />
                            {formData.puhrFile && (
                              <div className="file-preview">
                                <File size={14} />
                                <span>{formData.puhrFile.name}</span>
                              </div>
                            )}
                          </div>

                          <div className="input-group">
                            <label className="input-label">
                              <Upload size={16} />
                              Copia Literal
                            </label>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange(e, 'copiaLiteralFile')}
                              className="file-input"
                            />
                            {formData.copiaLiteralFile && (
                              <div className="file-preview">
                                <File size={14} />
                                <span>{formData.copiaLiteralFile.name}</span>
                              </div>
                            )}
                          </div>

                          <div className="input-group">
                            <label className="input-label">
                              <Upload size={16} />
                              Fotografías
                            </label>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileChange(e, 'photographyFile')}
                              className="file-input"
                            />
                            {formData.photographyFile && (
                              <div className="file-preview">
                                <File size={14} />
                                <span>{formData.photographyFile.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2">
                        <div className="input-group">
                          <label className="input-label">Estado del Lead</label>
                          <select
                            className="select"
                            value={formData.status}
                            onChange={(e) => {
                              setFormData({ ...formData, status: e.target.value, substatus: '' });
                            }}
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {substatusOptions[formData.status] && (
                          <div className="input-group">
                            <label className="input-label">Subestado del Lead</label>
                            <select
                              className="select"
                              value={formData.substatus}
                              onChange={(e) => setFormData({ ...formData, substatus: e.target.value })}
                            >
                              <option value="">Seleccionar...</option>
                              {substatusOptions[formData.status].map((substatus, index) => (
                                <option key={index} value={substatus}>
                                  {substatus}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="info-grid">
                      <div className="info-field full-width">
                        <label><Edit2 size={16} /> Nombre Completo</label>
                        <p>{formData.name || selectedLead.name}</p>
                      </div>
                      <div className="info-field">
                        <label><MapPin size={16} /> Dirección</label>
                        <p>{formData.address || 'No especificada'}</p>
                      </div>
                      <div className="info-field">
                        <label><MapPin size={16} /> Departamento</label>
                        <p>{formData.departamento || 'No especificado'}</p>
                      </div>
                      <div className="info-field">
                        <label><MapPin size={16} /> Provincia</label>
                        <p>{formData.provincia || 'No especificado'}</p>
                      </div>
                      <div className="info-field">
                        <label><MapPin size={16} /> Distrito</label>
                        <p>{formData.distrito || 'No especificado'}</p>
                      </div>
                      <div className="info-field">
                        <label><CreditCard size={16} /> Documento</label>
                        <p>{formData.documentType}: {formData.documentNumber || 'No especificado'}</p>
                      </div>
                      <div className="info-field">
                        <label><DollarSign size={16} /> Monto Préstamo</label>
                        <p>{formData.loanAmount ? `S/ ${formData.loanAmount}` : 'No especificado'}</p>
                      </div>
                      <div className="info-field">
                        <label><Percent size={16} /> Tasa de Interés</label>
                        <p>{formData.interestRate ? `${formData.interestRate}%` : 'No especificado'}</p>
                      </div>
                      <div className="info-field full-width">
                        <label><CheckCircle size={16} /> Cumple Requisitos</label>
                        <p>
                          {formData.meetsRequirements === 'si' && <span className="badge badge-success">Sí</span>}
                          {formData.meetsRequirements === 'no' && <span className="badge badge-danger">No</span>}
                          {formData.meetsRequirements === 'pendiente' && <span className="badge badge-warning">Pendiente</span>}
                          {!formData.meetsRequirements && 'No evaluado'}
                        </p>
                      </div>
                      <div className="info-field">
                        <label><Target size={16} /> Estado</label>
                        <p>
                          <span className={`badge ${getStatusBadge(formData.status)}`}>
                            {statusOptions.find(s => s.value === formData.status)?.label || formData.status}
                          </span>
                        </p>
                      </div>
                      {formData.substatus && (
                        <div className="info-field">
                          <label><Target size={16} /> Subestado</label>
                          <p className="substatus-badge">{formData.substatus}</p>
                        </div>
                      )}
                      <div className="info-field full-width">
                        <label><FileText size={16} /> Observaciones</label>
                        <p className="observations-text">{formData.observations || 'Sin observaciones'}</p>
                      </div>

                      <div className="info-field full-width">
                        <label><File size={16} /> Documentos</label>
                        <div className="documents-list">
                          {formData.dniFile ? (
                            <button 
                              onClick={() => downloadFile(formData.dniFile, 'DNI.pdf')} 
                              className="doc-download-btn"
                            >
                              <Download size={14} />
                              DNI
                            </button>
                          ) : (
                            <span className="no-doc">DNI: No subido</span>
                          )}
                          {formData.puhrFile ? (
                            <button 
                              onClick={() => downloadFile(formData.puhrFile, 'PUHR.pdf')} 
                              className="doc-download-btn"
                            >
                              <Download size={14} />
                              PUHR
                            </button>
                          ) : (
                            <span className="no-doc">PUHR: No subido</span>
                          )}
                          {formData.copiaLiteralFile ? (
                            <button 
                              onClick={() => downloadFile(formData.copiaLiteralFile, 'Copia_Literal.pdf')} 
                              className="doc-download-btn"
                            >
                              <Download size={14} />
                              Copia Literal
                            </button>
                          ) : (
                            <span className="no-doc">Copia Literal: No subida</span>
                          )}
                          {formData.photographyFile ? (
                            <button 
                              onClick={() => downloadFile(formData.photographyFile, 'Fotografias.pdf')} 
                              className="doc-download-btn"
                            >
                              <Download size={14} />
                              Fotografías
                            </button>
                          ) : (
                            <span className="no-doc">Fotografías: No subidas</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sección de Estados de Aprobación */}
                {(selectedLead.legalStatus || selectedLead.commercialStatus) && (
                  <div className="info-section">
                    <h3>Estados de Aprobación</h3>
                    
                    {/* Estado Legal */}
                    {selectedLead.legalStatus && (
                      <div className="approval-status-card">
                        <div className="approval-header">
                          <span className="department-label">Legal</span>
                          <span 
                            className={`badge ${selectedLead.legalStatus === 'approved' ? '' : 'badge-danger'}`}
                            style={selectedLead.legalStatus === 'approved' ? { backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' } : {}}
                          >
                            {selectedLead.legalStatus === 'approved' ? 'PRE-APROBADO' : 'RECHAZADO'}
                          </span>
                        </div>
                        {selectedLead.legalApprovalComment && (
                          <div className="approval-detail">
                            <strong>Comentario:</strong>
                            <p>{selectedLead.legalApprovalComment}</p>
                          </div>
                        )}
                        {selectedLead.legalRejectionReason && (
                          <div className="approval-detail rejection">
                            <strong>Motivo del Rechazo:</strong>
                            <p>{selectedLead.legalRejectionReason}</p>
                          </div>
                        )}
                        {selectedLead.legalApprovedAt && (
                          <div className="approval-date">
                            Fecha: {new Date(selectedLead.legalApprovedAt).toLocaleString()}
                          </div>
                        )}
                        {selectedLead.legalRejectedAt && (
                          <div className="approval-date">
                            Fecha: {new Date(selectedLead.legalRejectedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Estado Comercial */}
                    {selectedLead.commercialStatus && (
                      <div className="approval-status-card">
                        <div className="approval-header">
                          <span className="department-label">Comercial</span>
                          <span className={`badge ${selectedLead.commercialStatus === 'approved' ? 'badge-success' : 'badge-danger'}`}>
                            {selectedLead.commercialStatus === 'approved' ? 'APROBADO' : 'RECHAZADO'}
                          </span>
                        </div>
                        {selectedLead.commercialApprovalComment && (
                          <div className="approval-detail">
                            <strong>Comentario:</strong>
                            <p>{selectedLead.commercialApprovalComment}</p>
                          </div>
                        )}
                        {selectedLead.commercialRejectionReason && (
                          <div className="approval-detail rejection">
                            <strong>Motivo del Rechazo:</strong>
                            <p>{selectedLead.commercialRejectionReason}</p>
                          </div>
                        )}
                        {selectedLead.commercialApprovedAt && (
                          <div className="approval-date">
                            Fecha: {new Date(selectedLead.commercialApprovedAt).toLocaleString()}
                          </div>
                        )}
                        {selectedLead.commercialRejectedAt && (
                          <div className="approval-date">
                            Fecha: {new Date(selectedLead.commercialRejectedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Estado de Tasación */}
                    {(selectedLead.closerInfo?.appraisalPaid === 'si' || selectedLead.appraisalInfo) && (
                      <div className="approval-status-card">
                        <div className="approval-header">
                          <span className="department-label">Tasación</span>
                          <span className={`badge ${selectedLead.appraisalInfo ? 'badge-success' : 'badge-warning'}`}>
                            {selectedLead.appraisalInfo ? 'TASACIÓN COMPLETA' : 'TASACIÓN PENDIENTE'}
                          </span>
                        </div>
                        {selectedLead.appraisalInfo && (
                          <>
                            <div className="approval-detail">
                              <strong>Precio Tasación:</strong>
                              <p>S/ {selectedLead.appraisalInfo.precioTasacion}</p>
                            </div>
                            {selectedLead.appraisalInfo.tasacionCochera && (
                              <div className="approval-detail">
                                <strong>Tasación Cochera:</strong>
                                <p>S/ {selectedLead.appraisalInfo.tasacionCochera}</p>
                              </div>
                            )}
                            <div className="approval-detail">
                              <strong>Área:</strong>
                              <p>{selectedLead.appraisalInfo.area} m²</p>
                            </div>
                            <div className="approval-detail">
                              <strong>Uso:</strong>
                              <p>{selectedLead.appraisalInfo.uso}</p>
                            </div>
                            {selectedLead.appraisalInfo.completedAt && (
                              <div className="approval-date">
                                Fecha: {new Date(selectedLead.appraisalInfo.completedAt).toLocaleString()}
                              </div>
                            )}
                          </>
                        )}
                        {!selectedLead.appraisalInfo && selectedLead.closerInfo?.appraisalPaid === 'si' && (
                          <div className="approval-detail">
                            <p>El cliente ha confirmado el pago de tasación. Esperando evaluación del tasador.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Sección de Cita */}
                {isFullyApproved(selectedLead) && (
                  <div className="info-section">
                    <div className="section-header">
                      <h3>Información de Cita</h3>
                      <button 
                        onClick={handleOpenAppointmentModal} 
                        className="btn btn-primary btn-sm"
                      >
                        <Calendar size={16} />
                        {selectedLead.appointment ? 'Editar Cita' : 'Registrar Cita'}
                      </button>
                    </div>
                    
                    {selectedLead.appointment && (
                      <div className="appointment-card">
                        <div className="appointment-info-grid">
                          <div className="appointment-field">
                            <strong>Fecha:</strong>
                            <span>{new Date(selectedLead.appointment.date).toLocaleDateString()}</span>
                          </div>
                          <div className="appointment-field">
                            <strong>Hora:</strong>
                            <span>{selectedLead.appointment.time}</span>
                          </div>
                          <div className="appointment-field">
                            <strong>Tipo:</strong>
                            <span className={`badge ${selectedLead.appointment.meetingType === 'virtual' ? 'badge-info' : 'badge-primary'}`}>
                              {selectedLead.appointment.meetingType === 'virtual' ? 'Virtual' : 'Presencial'}
                            </span>
                          </div>
                          <div className="appointment-field">
                            <strong>Costo de Tasación:</strong>
                            <span className="cost-highlight">S/ {parseFloat(selectedLead.appointment.appraisalCost).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                {editMode ? (
                  <>
                    <button onClick={() => setEditMode(false)} className="btn btn-secondary">
                      Cancelar
                    </button>
                    <button onClick={handleSave} className="btn btn-primary">
                      Guardar Cambios
                    </button>
                  </>
                ) : (
                  <button onClick={handleClose} className="btn btn-secondary">
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Registro de Cita */}
        {showAppointmentModal && (
          <div className="modal-overlay" onClick={() => setShowAppointmentModal(false)}>
            <div className="modal-content appointment-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <Calendar size={24} />
                  {selectedLead?.appointment ? 'Editar Cita' : 'Registrar Cita'}
                </h2>
                <button onClick={() => setShowAppointmentModal(false)} className="modal-close">×</button>
              </div>

              <div className="modal-body">
                <div className="appointment-form">
                  <div className="grid grid-cols-2">
                    <div className="input-group">
                      <label className="input-label">
                        <Calendar size={16} />
                        Fecha *
                      </label>
                      <input
                        type="date"
                        className="input"
                        value={appointmentData.date}
                        onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">
                        <Clock size={16} />
                        Hora *
                      </label>
                      <input
                        type="time"
                        className="input"
                        value={appointmentData.time}
                        onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">
                      <MapPin size={16} />
                      Tipo de Cita *
                    </label>
                    <select
                      className="select"
                      value={appointmentData.meetingType}
                      onChange={(e) => setAppointmentData({ ...appointmentData, meetingType: e.target.value })}
                    >
                      <option value="presencial">Presencial</option>
                      <option value="virtual">Virtual</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">
                      <DollarSign size={16} />
                      Costo de Tasación (S/) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={appointmentData.appraisalCost}
                      onChange={(e) => setAppointmentData({ ...appointmentData, appraisalCost: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={() => setShowAppointmentModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button onClick={handleSaveAppointment} className="btn btn-primary">
                  <CheckCircle size={16} />
                  Guardar Cita
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .sales-workspace {
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

        .header-stats {
          display: flex;
          gap: var(--spacing-md);
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: 0.625rem 1.25rem;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-full);
          font-weight: 600;
          color: var(--color-primary-light);
        }

        .filter-bar {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xl);
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.625rem 1.25rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-btn:hover {
          background: var(--color-bg-elevated);
          color: var(--color-text-primary);
        }

        .filter-btn.active {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          border-color: var(--color-primary);
          color: white;
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
          background: var(--color-bg-secondary);
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

        .lead-main-info {
          flex: 1;
        }

        .lead-name-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
        }

        .lead-name-section h3 {
          margin: 0;
          font-size: 1.125rem;
          color: var(--color-text-primary);
        }

        .lead-contact-info {
          display: flex;
          gap: var(--spacing-lg);
          flex-wrap: wrap;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .lead-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
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
          gap: var(--spacing-md);
        }

        .modal-header h2 {
          margin: 0 0 var(--spacing-sm) 0;
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

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
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

        .observations-text {
          white-space: pre-wrap;
          min-height: 60px;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .documents-section {
          margin-top: var(--spacing-lg);
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--color-border);
        }

        .documents-section h4 {
          margin: 0 0 var(--spacing-md) 0;
          font-size: 1rem;
          color: var(--color-primary-light);
        }

        .file-input {
          width: 100%;
          padding: 0.625rem;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .file-input::-webkit-file-upload-button {
          background: var(--color-primary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          margin-right: var(--spacing-sm);
        }

        .file-preview {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          margin-top: var(--spacing-xs);
          padding: var(--spacing-sm);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }

        .documents-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--color-bg-elevated);
          border-radius: var(--radius-md);
        }

        .doc-download-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.875rem;
          transition: all var(--transition-fast);
        }

        .doc-download-btn:hover {
          background: var(--color-primary-light);
        }

        .no-doc {
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
          padding: var(--spacing-sm);
        }

        .substatus-badge {
          display: inline-block;
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-primary);
          border-radius: var(--radius-md);
          color: var(--color-primary-light);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .badges-group {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }

        .approval-badge {
          font-size: 0.75rem;
          font-weight: 700;
          animation: fadeIn 0.3s ease-out;
        }

        .approval-status-card {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
        }

        .approval-status-card:last-child {
          margin-bottom: 0;
        }

        .approval-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--color-border);
        }

        .department-label {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-primary-light);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .approval-detail {
          background: var(--color-bg-tertiary);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-sm);
        }

        .approval-detail strong {
          display: block;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          margin-bottom: var(--spacing-xs);
        }

        .approval-detail p {
          margin: 0;
          color: var(--color-text-primary);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .approval-detail.rejection {
          background: rgba(239, 68, 68, 0.1);
          border-left: 3px solid var(--color-danger);
        }

        .approval-date {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
          margin-top: var(--spacing-sm);
          font-style: italic;
        }

        .appointment-modal {
          max-width: 600px;
        }

        .appointment-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .appointment-card {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          margin-top: var(--spacing-md);
        }

        .appointment-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }

        .appointment-field {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .appointment-field strong {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .appointment-field span {
          font-size: 0.875rem;
          color: var(--color-text-primary);
        }

        .cost-highlight {
          font-size: 1.125rem !important;
          font-weight: 700 !important;
          color: var(--color-success) !important;
        }

        .modal-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: flex-end;
          padding: var(--spacing-xl);
          border-top: 1px solid var(--color-border);
        }

        @media (max-width: 768px) {
          .lead-row {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-md);
          }

          .lead-contact-info {
            flex-direction: column;
            gap: var(--spacing-sm);
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .filter-bar {
            overflow-x: auto;
            flex-wrap: nowrap;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default SalesWorkspace;
