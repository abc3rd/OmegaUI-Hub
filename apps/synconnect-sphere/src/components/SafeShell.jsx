import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Safe Shell Component
 * Always renders even if child components crash
 * Prevents complete blank screens
 */
export default function SafeShell({ children }) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (event) => {
      console.error('SafeShell caught error:', event.error);
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ 
          maxWidth: '500px',
          padding: '40px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#fef2f2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <AlertTriangle style={{ width: '30px', height: '30px', color: '#dc2626' }} />
          </div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#dc2626',
            marginBottom: '10px'
          }}>
            Application Error
          </h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Something went wrong. Please refresh the page or contact support.
          </p>
          <div style={{
            background: '#f9fafb',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666',
            textAlign: 'left',
            fontFamily: 'monospace',
            marginBottom: '20px',
            maxHeight: '150px',
            overflow: 'auto'
          }}>
            {error?.message || 'Unknown error'}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#ea00ea',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Reload Page
          </button>
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
            Contact: syncloud@omegaui.com
          </div>
        </div>
      </div>
    );
  }

  return children;
}