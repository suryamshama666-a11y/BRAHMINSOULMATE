import { useEffect, useState } from 'react';
import { testConnection } from '@/integrations/supabase/client';

export const ConnectionTest = () => {
  const [status, setStatus] = useState<'testing' | 'success' | 'failed'>('testing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const result = await testConnection();
        setStatus(result ? 'success' : 'failed');
      } catch (err) {
        setStatus('failed');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    
    verifyConnection();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '10px',
      borderRadius: '5px',
      backgroundColor: status === 'success' ? '#4CAF50' : status === 'failed' ? '#f44336' : '#2196F3',
      color: 'white',
      zIndex: 9999,
    }}>
      {status === 'testing' && 'Testing Supabase Connection...'}
      {status === 'success' && 'Supabase Connection Successful!'}
      {status === 'failed' && `Connection Failed${error ? `: ${error}` : ''}`}
    </div>
  );
}; 