import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="access-denied-container">
        <div className="access-denied">
          <h2>⛔ Accesso Negato</h2>
          <p>Questa pagina è riservata agli amministratori del sistema.</p>
          <p>Se credi di aver bisogno di accesso, contatta l'amministratore.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;