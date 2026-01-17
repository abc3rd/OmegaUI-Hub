import React from 'react';

export default function VersionPage() {
  const data = {
    version: '1.0.0',
    buildTime: '2026-01-09T00:00:00Z',
    environment: import.meta.env.MODE || 'production',
    platform: 'Base44',
    domain: 'syncloud-sphere.omegaui.com'
  };

  // If JSON is requested, return JSON
  if (typeof window !== 'undefined' && window.location.search.includes('json')) {
    return (
      <pre style={{ padding: '20px', fontFamily: 'monospace' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #ea00ea 0%, #2699fe 100%)'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: '500px'
      }}>
        <div style={{ 
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #ea00ea 0%, #2699fe 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#ea00ea',
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          Version Info
        </h1>
        <p style={{ 
          color: '#666', 
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          Omega UI Connect Sphere
        </p>
        <div style={{ 
          background: '#f9f9f9', 
          padding: '20px', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#444'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Version:</strong> {data.version}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Build Time:</strong> {data.buildTime}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Environment:</strong> {data.environment}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Platform:</strong> {data.platform}
          </div>
          <div>
            <strong>Domain:</strong> {data.domain}
          </div>
        </div>
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          fontSize: '12px',
          color: '#999'
        }}>
          Contact: syncloud@omegaui.com
        </div>
      </div>
    </div>
  );
}