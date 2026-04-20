import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }
    
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      // Redirect to appropriate dashboard based on role
      const roleDashboards = {
        patient: '/patientsdashboard',
        doctor: '/doctorsdashboard', 
        nurse: '/nursedashboard',
        admin: '/adminsdashboard'
      };
      navigate(roleDashboards[currentUser.role] || '/patientsdashboard', { replace: true });
    }
  }, [currentUser, allowedRoles, navigate, location]);

  if (!currentUser || (allowedRoles && !allowedRoles.includes(currentUser.role))) {
    return <div className="loading">Loading...</div>;
  }

  return children;
};

export default ProtectedRoute;

