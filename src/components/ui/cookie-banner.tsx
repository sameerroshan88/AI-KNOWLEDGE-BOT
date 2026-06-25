"use client";

import { useEffect, useState } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const key = 'aikb_cookies_accepted';

  useEffect(() => {
    try {
      const val = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      if (val) {
        // if already accepted, set global flag and don't show
        if (val === '1') {
          (window as any).__aikbCookiesAccepted = true;
        }
        return;
      }

      // Wait until preloader signals completion before showing the banner
      if (typeof window !== 'undefined' && (window as any).__aikbPreloaderDone) {
        setVisible(true);
        return;
      }

      const onPreloaderDone = () => setVisible(true);
      window.addEventListener('aikb:preloader:done', onPreloaderDone);
      return () => window.removeEventListener('aikb:preloader:done', onPreloaderDone);
    } catch (err) {
      // ignore
    }
  }, []);

  const dispatchAcceptance = (accepted: boolean) => {
    try {
      localStorage.setItem(key, accepted ? '1' : '0');
    } catch (err) {}
    (window as any).__aikbCookiesAccepted = accepted;
    window.dispatchEvent(new CustomEvent('aikb:cookies', { detail: { accepted } }));
  };

  const acceptAll = () => {
    dispatchAcceptance(true);
    setVisible(false);
  };

  const rejectAll = () => {
    dispatchAcceptance(false);
    setVisible(false);
  };

  const openSettings = () => {
    alert('Cookie settings are not configurable yet. You can accept or reject all cookies.');
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
        }}
        onClick={() => setVisible(false)}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: '90%',
          maxWidth: 500,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: 32,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Header */}
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              margin: '0 0 16px 0',
              color: '#1a1a1a',
            }}
          >
            Cookie settings
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: '#4a4a4a',
              margin: '0 0 24px 0',
            }}
          >
            We use cookies to deliver and improve our services, analyze site usage, and if you agree, to customize your experience and market our services to you. You can read our{' '}
            <a
              href="#"
              style={{
                color: '#0066cc',
                textDecoration: 'none',
                fontWeight: 500,
              }}
              onClick={(e) => {
                e.preventDefault();
                // Link to cookie policy
              }}
            >
              Cookie Policy
            </a>
            {' '}here.
          </p>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexDirection: 'column',
            }}
          >
            <button
              onClick={openSettings}
              style={{
                background: '#1a1a1a',
                color: '#ffffff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#333333')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#1a1a1a')}
            >
              Customize Cookie Settings
            </button>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={rejectAll}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: '#1a1a1a',
                  border: '1px solid #e0e0e0',
                  padding: '10px 16px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#cccccc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                Reject All Cookies
              </button>

              <button
                onClick={acceptAll}
                style={{
                  flex: 1,
                  background: '#0066cc',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#0052a3')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0066cc')}
              >
                Accept All Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
