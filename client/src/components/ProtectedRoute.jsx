import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to={role === 'owner' ? '/owner/login' : '/login'} state={{ from: loc.pathname }} replace />;
  if (user.role !== role) return <Navigate to={user.role === 'owner' ? '/owner' : '/customer'} replace />;
  return children;
}
