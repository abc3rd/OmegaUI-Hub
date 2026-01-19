"use client";
import React, { useState } from 'react';

export default function QREngine() {
  const [slug, setSlug] = useState('');
  const [target, setTarget] = useState('');
  const [qrFile, setQrFile] = useState(null);

  const handlePush = async () => {
    try {
      const response = await fetch('http://localhost:5001/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, target }),
      });
      const data = await response.json();
      if (data.status === 'success') setQrFile(data.file);
    } catch (e) {
      alert("IoT Engine Offline. Ensure QR-engine.py is running on port 5001.");
    }
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', padding: '50px', color: 'white', fontFamily: 'system-ui' }}>
      <header style={{ borderLeft: '4px solid #ea00ea', paddingLeft: '20px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '24px', letterSpacing: '1px' }}>OMEGA UI: IOT COMMAND HUB</h1>
        <p style={{ color: '#2699fe', fontSize: '12px' }}>CONNECTED TO: SYNCLOUDCONNECT.COM</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px' }}>
        <div style={{ backgroundColor: '#2a2a2a', padding: '25px', borderRadius: '8px' }}>
          <input 
            placeholder="LINK SLUG" 
            onChange={(e) => setSlug(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '15px', backgroundColor: '#1a1a1a', border: '1px solid #3c3c3c', color: 'white' }} 
          />
          <input 
            placeholder="TARGET URL" 
            onChange={(e) => setTarget(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '25px', backgroundColor: '#1a1a1a', border: '1px solid #3c3c3c', color: 'white' }} 
          />
          <button 
            onClick={handlePush}
            style={{ width: '100%', padding: '15px', backgroundColor: '#ea00ea', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            PUSH TO IOT ENGINE
          </button>
        </div>

        <div style={{ backgroundColor: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '2px dashed #3c3c3c' }}>
          {qrFile ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
                <img src={`http://localhost:5001/${qrFile}`} style={{ width: '250px' }} />
              </div>
              <p style={{ marginTop: '15px', color: '#ea00ea' }}>STATUS: SYSTEM NOMINAL</p>
            </div>
          ) : (
            <p style={{ color: '#666' }}>AWAITING DATA PUSH...</p>
          )}
        </div>
      </div>
    </div>
  );
}