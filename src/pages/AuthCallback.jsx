
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabaseClient';

function AuthCallback() {
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data.session && !error) {
        // Create patient user for Google OAuth
        const googleUser = {
          id: Date.now(),
          name: data.session.user.user_metadata?.full_name || data.session.user.email || 'Google User',
          email: data.session.user.email,
          role: 'patient',
          status: 'active',
          joinDate: new Date().toISOString().split('T')[0]
        };
        
        setCurrentUser(googleUser);
        navigate('/dashboard/patient');
      } else {
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, setCurrentUser]);

  return <div>Loading...</div>;
}

export default AuthCallback;

