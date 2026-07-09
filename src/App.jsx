import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAdmin, isLoading } = useAuth();

  // PWA Update Logic
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  // PWA Install Logic
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  if (isLoading) {
    return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={!isAdmin ? <Login /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={isAdmin ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>

      {/* PWA Update Prompt */}
      {needRefresh && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>New version available!</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => updateServiceWorker(true)} style={{ background: '#2E7D32', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Update Now</button>
            <button onClick={() => setNeedRefresh(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Later</button>
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      {deferredPrompt && (
        <div style={{ position: 'fixed', bottom: needRefresh ? 120 : 20, right: 20, background: '#2E7D32', padding: '16px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 9998, display: 'flex', flexDirection: 'column', gap: '12px', color: '#fff' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Install DaimPharmacy App</p>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Get the full desktop experience.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={handleInstallClick} style={{ background: '#fff', color: '#2E7D32', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Install</button>
            <button onClick={() => setDeferredPrompt(null)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Dismiss</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
