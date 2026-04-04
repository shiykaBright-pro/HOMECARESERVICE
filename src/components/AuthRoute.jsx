import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const AuthRoute = ({ children }) => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) {
      // Redirect to appropriate dashboard
      const roleDashboards = {
        patient: '/dashboard/patient',
        doctor: '/dashboard/doctor',
        nurse: '/dashboard/nurse',
        admin: '/dashboard/admin'
      };
      navigate(roleDashboards[currentUser.role] || '/dashboard/patient', { replace: true });
    }
  }, [currentUser, navigate]);

  if (currentUser) {
    return <div className="loading">Redirecting...</div>;
  }

  return children;
};

export default AuthRoute;

