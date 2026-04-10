import React, { useState, useEffect } from 'react';
import { FaGithub, FaGitlab, FaGoogle } from 'react-icons/fa';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { AUTH_URL, REVIEWS_DATA } from '../utils/constants';

export function LoginView() {
  const [currentReview, setCurrentReview] = useState(0);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview(prev => (prev + 1) % REVIEWS_DATA.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activeReview = REVIEWS_DATA[currentReview];

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

        <div className="auth-container">
          <div className="auth-card-wrapper">
            <div className="glass-card">
              <div className="header">
                <h1 className="title">{authMode === 'login' ? 'Welcome back' : 'Join BugSentry'}</h1>
                <p className="subtitle">
                  {authMode === 'login' 
                    ? 'Log in to your account to continue analysis' 
                    : 'Start your 14-day free trial today'}
                </p>
              </div>

              <div className="auth-tabs">
                <button 
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  Log In
                </button>
                <button 
                  className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                  onClick={() => setAuthMode('signup')}
                >
                  Sign Up
                </button>
              </div>

              <div className="button-group">
                <a href={`${AUTH_URL}/auth/google/login`} className="auth-btn">
                  <span className="btn-icon"><FaGoogle color="#4285F4" /></span>
                  Continue with Google
                </a>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <a href={`${AUTH_URL}/auth/github/login`} className="auth-btn">
                    <span className="btn-icon"><FaGithub /></span>
                    GitHub
                  </a>
                  <a href={`${AUTH_URL}/auth/gitlab/login`} className="auth-btn">
                    <span className="btn-icon"><FaGitlab color="#FC6D26" /></span>
                    GitLab
                  </a>
                </div>
              </div>

              <div className="divider-container">
                <div className="divider-line" />
                <span className="divider-text">or email</span>
                <div className="divider-line" />
              </div>

              <div className="input-group">
                <label className="input-label">Work Email</label>
                <div style={{ position: 'relative' }}>
                  <FiMail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                  <input type="email" className="premium-input" placeholder="name@company.com" style={{ paddingLeft: '44px' }} />
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input type="text" className="premium-input" placeholder="John Doe" />
                </div>
              )}

              <button className="submit-btn" onClick={() => {}}>
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
                <FiArrowRight style={{ marginLeft: '8px' }} />
              </button>

              <p className="auth-footnote">
                By continuing, you agree to BugSentry's <span style={{ color: '#7b42ff', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: '#7b42ff', cursor: 'pointer' }}>Privacy Policy</span>.
              </p>
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
