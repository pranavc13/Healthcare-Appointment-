import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Wrap a route element with roles={['patient']} (etc.) to restrict it by role.
// Omitting `roles` just requires any authenticated user, matching the old behaviour.
export default function PrivateRoute({ children, roles }) {
  const { currentUser, role } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
