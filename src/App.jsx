import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SalesWorkspace from './pages/Sales/SalesWorkspace';
import InvestmentWorkspace from './pages/Investment/InvestmentWorkspace';
import AppraisalReportsPage from './pages/Investment/AppraisalReportsPage';
import SupervisorPanel from './pages/CallCenter/SupervisorPanel';
import MarketingPanel from './pages/Marketing/MarketingPanel';
import LegalPanel from './pages/Legal/LegalPanel';
import CommercialPanel from './pages/Commercial/CommercialPanel';
import CloserPanel from './pages/Closer/CloserPanel';
import AppraisalManagerPanel from './pages/Appraisal/AppraisalManagerPanel';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales-workspace"
        element={
          <ProtectedRoute roles={['admin', 'ejecutivo_prestamos']}>
            <SalesWorkspace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/investment-workspace"
        element={
          <ProtectedRoute roles={['admin', 'ejecutivo_inversiones']}>
            <InvestmentWorkspace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appraisal-reports"
        element={
          <ProtectedRoute roles={['admin', 'ejecutivo_inversiones']}>
            <AppraisalReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/callcenter"
        element={
          <ProtectedRoute roles={['admin', 'supervisor_callcenter']}>
            <SupervisorPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/marketing"
        element={
          <ProtectedRoute roles={['admin', 'marketing']}>
            <MarketingPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/legal"
        element={
          <ProtectedRoute roles={['admin', 'legal']}>
            <LegalPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/commercial"
        element={
          <ProtectedRoute roles={['admin', 'comercial']}>
            <CommercialPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/closer"
        element={
          <ProtectedRoute roles={['admin', 'closer']}>
            <CloserPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appraisal"
        element={
          <ProtectedRoute roles={['admin', 'gestor_tasacion']}>
            <AppraisalManagerPanel />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
