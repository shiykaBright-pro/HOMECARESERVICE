import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
// No imports needed for callback logic - supabase from client
function AuthCallback() {
  const navigate = useNavigate();
  const { setCurrentUser, users } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth callback error:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      if (session) {
        const supabaseUser = session.user;
      // Check if Google provider (OAuth)
      const isGoogleAuth = supabaseUser.app_metadata?.provider === 'google' || supabaseUser.identities?.some(id => id.provider === 'google');
      
      if (isGoogleAuth) {
        // Google OAuth → treat as patient
        const userData = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'Patient',
          role: 'patient',
          phone: supabaseUser.user_metadata?.phone || '',
        };
        setCurrentUser(userData);
        navigate('/patientsdashboard', { replace: true });
        return;
      }

      // Match local user or create basic from metadata
      const localUser = users.find(u => u.email === supabaseUser.email);
      const userData = localUser || {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
        role: supabaseUser.user_metadata?.role || 'patient',
        phone: supabaseUser.user_metadata?.phone || '',
      };

      setCurrentUser(userData);
      // Redirect to role-based dashboard (new paths)
      let route;
      switch (userData.role) {
        case 'doctor':
          route = '/doctorsdashboard';
          break;
        case 'nurse':
          route = '/nursedashboard';
          break;
        case 'admin':
          route = '/adminsdashboard';
          break;
        default:
          route = '/patientsdashboard';
      }
      navigate(route, { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
      setLoading(false);
    }).catch(err => {
      console.error('Callback fetch error:', err);
      setError('Authentication failed');
      setLoading(false);
    });
  }, [navigate, setCurrentUser, users]);

  if (loading || error) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {loading ? (
          <>
            <h2>Completing login...</h2>
            <p>Redirecting to your dashboard...</p>
          </>
        ) : (
          <>
            <h2 style={{ color: 'red' }}>Login Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/login')} style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Back to Login
            </button>
          </>
        )}
      </div>
    );
  }

  return null; // Should redirect immediately
}


export default AuthCallback;

