import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

// Función para distribuir leads de forma equitativa (round-robin)
const distributeLeads = (leads, salesUsers) => {
  if (!salesUsers || salesUsers.length === 0) return leads;
  
  const distributedLeads = leads.map((lead, index) => {
    if (!lead.assignedTo) {
      const assignedUser = salesUsers[index % salesUsers.length];
      return {
        ...lead,
        assignedTo: assignedUser.id,
        assignedToName: assignedUser.name,
        assignedAt: new Date().toISOString()
      };
    }
    return lead;
  });
  
  return distributedLeads;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    // Forzar actualización de usuarios - limpiar datos antiguos
    localStorage.removeItem('crm_users');
    
    // Cargar o crear usuarios de ejemplo
    let savedUsers = JSON.parse(localStorage.getItem('crm_users') || '[]');
    
    if (savedUsers.length === 0) {
      savedUsers = [
        {
          id: '1',
          name: 'Admin Usuario',
          email: 'admin@crm.com',
          password: 'admin123',
          role: 'admin',
          department: 'Administración',
          avatar: '👤'
        },
        {
          id: '2',
          name: 'Carlos Supervisor',
          email: 'supervisor@crm.com',
          password: 'super123',
          role: 'supervisor_callcenter',
          department: 'Call Center',
          avatar: '📞'
        },
        {
          id: '3',
          name: 'María Marketing',
          email: 'marketing@crm.com',
          password: 'marketing123',
          role: 'marketing',
          department: 'Marketing',
          avatar: '📢'
        },
        {
          id: '4',
          name: 'Juan Ejecutivo',
          email: 'ejecutivo@crm.com',
          password: 'ejecutivo123',
          role: 'ejecutivo_prestamos',
          department: 'Préstamos',
          avatar: '💼'
        },
        {
          id: '5',
          name: 'Ana Legal',
          email: 'legal@crm.com',
          password: 'legal123',
          role: 'legal',
          department: 'Legal',
          avatar: '⚖️'
        },
        {
          id: '6',
          name: 'Pedro Comercial',
          email: 'comercial@crm.com',
          password: 'comercial123',
          role: 'comercial',
          department: 'Comercial',
          avatar: '🏢'
        },
        {
          id: '7',
          name: 'Sofia Closer',
          email: 'closer@crm.com',
          password: 'closer123',
          role: 'closer',
          department: 'Closer',
          avatar: '🎯'
        },
        {
          id: '8',
          name: 'Carlos Tasador',
          email: 'tasador@crm.com',
          password: 'tasador123',
          role: 'gestor_tasacion',
          department: 'Tasación',
          avatar: '📏'
        },
        {
          id: '9',
          name: 'Ana Inversiones',
          email: 'inversiones@crm.com',
          password: 'inversiones123',
          role: 'ejecutivo_inversiones',
          department: 'Inversiones',
          avatar: '💰'
        }
      ];
      localStorage.setItem('crm_users', JSON.stringify(savedUsers));
    }
    
    setUsers(savedUsers);
    
    // Cargar asignaciones
    const savedAssignments = JSON.parse(localStorage.getItem('crm_assignments') || '[]');
    setAssignments(savedAssignments);
  };

  // Agregar lead
  const addLead = (leadData) => {
    const executiveRole = leadData.leadType === 'inversión' ? 'ejecutivo_inversiones' : 'ejecutivo_prestamos';
    const salesUsers = users.filter(u => u.role === executiveRole);
    
    const newLead = {
      id: Date.now().toString(),
      ...leadData,
      leadType: leadData.leadType || 'préstamo', // Default a préstamo si no se especifica
      status: 'nuevo',
      createdAt: new Date().toISOString(),
      createdBy: user?.id,
      createdByName: user?.name
    };
    
    const updatedLeads = [...leads, newLead];
    const distributedLeads = distributeLeads(updatedLeads, salesUsers);
    
    setLeads(distributedLeads);
    localStorage.setItem('crm_leads', JSON.stringify(distributedLeads));
    
    return newLead;
  };

  // Agregar múltiples leads (importación)
  const addBulkLeads = (leadsData) => {
    // Agrupar leads por tipo
    const loanLeads = leadsData.filter(l => l.leadType === 'préstamo' || !l.leadType);
    const investmentLeads = leadsData.filter(l => l.leadType === 'inversión');
    
    const loanUsers = users.filter(u => u.role === 'ejecutivo_prestamos');
    const investmentUsers = users.filter(u => u.role === 'ejecutivo_inversiones');
    
    const newLeads = leadsData.map(leadData => ({
      id: Date.now().toString() + Math.random(),
      ...leadData,
      leadType: leadData.leadType || 'préstamo',
      status: 'nuevo',
      createdAt: new Date().toISOString(),
      createdBy: user?.id,
      createdByName: user?.name
    }));
    
    let updatedLeads = [...leads, ...newLeads];
    
    // Distribuir leads de préstamos
    if (loanLeads.length > 0 && loanUsers.length > 0) {
      const loanOnlyLeads = updatedLeads.filter(l => l.leadType === 'préstamo' || !l.leadType);
      const distributedLoans = distributeLeads(loanOnlyLeads, loanUsers);
      updatedLeads = distributedLoans.concat(updatedLeads.filter(l => l.leadType === 'inversión'));
    }
    
    // Distribuir leads de inversiones
    if (investmentLeads.length > 0 && investmentUsers.length > 0) {
      const investmentOnlyLeads = updatedLeads.filter(l => l.leadType === 'inversión');
      const distributedInvestment = distributeLeads(investmentOnlyLeads, investmentUsers);
      updatedLeads = updatedLeads.filter(l => l.leadType !== 'inversión').concat(distributedInvestment);
    }
    
    setLeads(updatedLeads);
    localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
    
    return newLeads;
  };

  // Actualizar lead
  const updateLead = (leadId, updates) => {
    const updatedLeads = leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
        : lead
    );
    
    setLeads(updatedLeads);
    localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
  };

  // Eliminar lead
  const deleteLead = (leadId) => {
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    setLeads(updatedLeads);
    localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
  };

  // Agregar cliente
  const addClient = (clientData) => {
    const newClient = {
      id: Date.now().toString(),
      ...clientData,
      createdAt: new Date().toISOString(),
      createdBy: user?.id
    };
    
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('crm_clients', JSON.stringify(updatedClients));
    
    return newClient;
  };

  // Actualizar cliente
  const updateClient = (clientId, updates) => {
    const updatedClients = clients.map(client =>
      client.id === clientId
        ? { ...client, ...updates, updatedAt: new Date().toISOString() }
        : client
    );
    
    setClients(updatedClients);
    localStorage.setItem('crm_clients', JSON.stringify(updatedClients));
  };

  // Agregar campaña
  const addCampaign = (campaignData) => {
    const newCampaign = {
      id: Date.now().toString(),
      ...campaignData,
      createdAt: new Date().toISOString(),
      createdBy: user?.id,
      createdByName: user?.name
    };
    
    const updatedCampaigns = [...campaigns, newCampaign];
    setCampaigns(updatedCampaigns);
    localStorage.setItem('crm_campaigns', JSON.stringify(updatedCampaigns));
    
    return newCampaign;
  };

  // Obtener leads del usuario actual
  const getMyLeads = () => {
    if (!user) return [];
    
    if (user.role === 'ejecutivo_prestamos') {
      return leads.filter(lead => lead.assignedTo === user.id && (lead.leadType === 'préstamo' || !lead.leadType));
    }
    
    if (user.role === 'ejecutivo_inversiones') {
      return leads.filter(lead => lead.assignedTo === user.id && lead.leadType === 'inversión');
    }
    
    return leads;
  };

  // Obtener estadísticas
  const getStats = () => {
    const myLeads = getMyLeads();
    
    return {
      totalLeads: myLeads.length,
      newLeads: myLeads.filter(l => l.status === 'nuevo').length,
      contacted: myLeads.filter(l => l.status === 'contactado').length,
      qualified: myLeads.filter(l => l.status === 'calificado').length,
      won: myLeads.filter(l => l.status === 'ganado').length,
      lost: myLeads.filter(l => l.status === 'perdido').length,
      totalClients: clients.length,
      totalCampaigns: campaigns.length
    };
  };

  // Crear asignación
  const createAssignment = (assignmentData) => {
    const newAssignment = {
      id: Date.now().toString(),
      ...assignmentData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const updatedAssignments = [...assignments, newAssignment];
    setAssignments(updatedAssignments);
    localStorage.setItem('crm_assignments', JSON.stringify(updatedAssignments));
    
    return newAssignment;
  };

  // Actualizar asignación
  const updateAssignment = (id, updates) => {
    const updatedAssignments = assignments.map(assignment => 
      assignment.id === id 
        ? { ...assignment, ...updates, updatedAt: new Date().toISOString() }
        : assignment
    );
    
    setAssignments(updatedAssignments);
    localStorage.setItem('crm_assignments', JSON.stringify(updatedAssignments));
  };

  // Buscar inversionista por DNI
  const findInvestorByDNI = (dni) => {
    return leads.find(lead => 
      lead.leadType === 'inversión' && 
      lead.documentNumber === dni
    );
  };

  const value = {
    leads,
    clients,
    users,
    campaigns,
    assignments,
    addLead,
    addBulkLeads,
    updateLead,
    deleteLead,
    addClient,
    updateClient,
    addCampaign,
    getMyLeads,
    getStats,
    createAssignment,
    updateAssignment,
    findInvestorByDNI
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
