import React, { useEffect, useState } from 'react';
import { FaGithub, FaGitlab, FaGoogle } from 'react-icons/fa';
import { AUTH_URL, REVIEWS_DATA } from '../utils/constants';

export function LoginView() {
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview(prev => (prev + 1) % REVIEWS_DATA.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activeReview = REVIEWS_DATA[currentReview] || {};

  return (
    <main className="split-layout">
      <div className="bg-glow" />
      <div className="light-spot spot-1" />
      <div className="light-spot spot-2" />

      {/* Left — Auth */}
      <section className="layout-left">
        <nav className="navbar">
          <img src="/logo.png" alt="Bugsentry Logo" className="logo" />
        </nav>

        <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="auth-card-wrapper" style={{ width: '100%', maxWidth: '400px' }}>
            
            {/* Made the card transparent with a sleek glassmorphism effect */}
            <div 
              className="glass-card" 
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                padding: '2.5rem 2rem',
                borderRadius: '16px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div className="header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 className="title" style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.75rem' }}>Welcome Back</h1>
                <p className="subtitle" style={{ margin: 0, color: 'rgba(255, 255, 255, 0.6)' }}>Continue with your provider</p>
              </div>

              {/* Removed oauth-row and set layout to flex column for 3 stacked rows */}
              <div 
                className="button-group" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem', 
                  width: '100%' 
                }}
              >
                <a 
                  href={`${AUTH_URL}/auth/google/login`} 
                  className="auth-btn"
                  style={buttonStyle}
                >
                  <span className="btn-icon" style={{ display: 'flex', alignItems: 'center' }}><FaGoogle color="#4285F4" size={18} /></span>
                  Continue with Google
                </a>
                
                <a 
                  href={`${AUTH_URL}/auth/github/login`} 
                  className="auth-btn"
                  style={buttonStyle}
                >
                  <span className="btn-icon" style={{ display: 'flex', alignItems: 'center' }}><FaGithub color="#ffffff" size={18} /></span>
                  Continue with GitHub
                </a>
                
                <a 
                  href={`${AUTH_URL}/auth/gitlab/login`} 
                  className="auth-btn"
                  style={buttonStyle}
                >
                  <span className="btn-icon" style={{ display: 'flex', alignItems: 'center' }}><FaGitlab color="#FC6D26" size={18} /></span>
                  Continue with GitLab
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right — Marketing */}
      <section className="layout-right">
        <div className="review-card">
          <div key={activeReview.id} className="review-content-animate">
            <div className="review-header">
              <div className="review-avatar">
                {activeReview.image ? (
                  <img src={activeReview.image} alt={activeReview.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <div className="avatar-shape" />
                    <div className="avatar-shape-secondary" />
                  </>
                )}
              </div>
              <div className="review-meta">
                <h4>{activeReview.name}</h4>
                <span>{activeReview.handle}</span>
              </div>
            </div>
            <div className="review-body">
              <p>{activeReview.text}</p>
            </div>
            <div className="review-footer">
              <span className="emoji">{activeReview.emoji}</span>
              <p>{activeReview.footer}</p>
            </div>
          </div>
        </div>

        {/* Feature badges */}
        <div style={{ position: 'absolute', bottom: '40px', left: '40px', display: 'flex', gap: '20px' }}>
          {['SOC2 Type II', 'HIPAA Compliant', 'GDPR Ready'].map(text => (
            <div key={text} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: '600', letterSpacing: '0.05em' }}>
              {text}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

// Reusable inline style for the buttons to ensure they look good and don't overlap
const buttonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '0.85rem 1rem',
  borderRadius: '8px',
  textDecoration: 'none',
  color: '#fff',
  fontWeight: '500',
  fontSize: '0.95rem',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.2s ease',
  width: '100%',
  boxSizing: 'border-box',
  cursor: 'pointer'
};