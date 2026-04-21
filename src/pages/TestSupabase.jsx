import { useState } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';

function TestSupabase() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    try {
      const { success, error, data } = await supabase.testDatabaseConnection();
      setResult({ success, error: error?.message, data });
    } catch (err) {
      setResult({ success: false, error: err.message });
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <div style={{padding: '20px'}}>
        <h1>🧪 Test Supabase Connection</h1>
        <button onClick={testConnection} disabled={loading}>
          {loading ? 'Testing...' : 'Test Database Connection & Insert'}
        </button>
        {result && (
          <pre style={{background: '#f5f5f5', padding: '20px', marginTop: '20px', whiteSpace: 'pre-wrap'}}>
{JSON.stringify(result, null, 2)}
          </pre>
        )}
        <p>Add /test-supabase to URL to access. Check console for logs.</p>
      </div>
    </div>
  );
}

export default TestSupabase;

