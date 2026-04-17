import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const AuthRoute = ({ children }) => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) {
      const roleDashboards = {
        patient: '/patient-dashboard',
        doctor: '/doctor-dashboard',
        nurse: '/nurse-dashboard',
        admin: '/admin-dashboard'
      };
      navigate(roleDashboards[currentUser.role] || '/patient-dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  if (currentUser) {
    return <div className="loading">Redirecting...</div>;
  }

  return children;
};

export default AuthRoute;


