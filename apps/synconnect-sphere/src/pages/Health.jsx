import React from 'react';

export default function HealthPage() {
  const data = {
    status: 'ok',
    time: new Date().toISOString(),
    uptime: Math.floor(performance.now() / 1000),
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
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#ea00ea',
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          System Healthy
        </h1>
        <p style={{ 
          color: '#666', 
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          Omega UI Connect Sphere is running
        </p>
        <div style={{ 
          background: '#f9f9f9', 
          padding: '20px', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#444'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Status:</strong> <span style={{ color: '#22c55e' }}>✓ OK</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Time:</strong> {data.time}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Uptime:</strong> {data.uptime}s
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