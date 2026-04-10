import React, { useEffect, useState } from 'react';
import { FaGithub, FaGitlab, FaGoogle } from 'react-icons/fa';
import { REVIEWS_DATA } from '../data/reviews.jsx';

export default function LoginView({ onLogin }) {
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % REVIEWS_DATA.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const activeReview = REVIEWS_DATA[currentReview];

  return (
    <main className="split-layout">
      <div className="bg-glow"></div>
      <div className="light-spot spot-1"></div>
      <div className="light-spot spot-2"></div>

      <section className="layout-left">
        <nav className="navbar">
          <img src="/logo.png" alt="Bugsentry Logo" className="logo" />
        </nav>

        <div className="auth-container">
          <div className="glass-card">
            <div className="header">
              <h1 className="title">Welcome to Bugsentry</h1>
              <p className="subtitle">AI-powered Software Risk Intelligence</p>
            </div>

            <div className="button-group">
              <button className="auth-btn" onClick={onLogin}>
                <span className="btn-icon"><FaGoogle color="#4285F4" /></span>
                Continue with Google
              </button>
              <button className="auth-btn" onClick={onLogin}>
                <span className="btn-icon"><FaGithub /></span>
                Continue with GitHub
              </button>
              <button className="auth-btn" onClick={onLogin}>
                <span className="btn-icon"><FaGitlab color="#FC6D26" /></span>
                Continue with GitLab
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="layout-right">
        <div className="review-card">
          <div key={activeReview.id} className="review-content-animate">
            <div className="review-header">
              <div className="review-avatar">
                <div className="avatar-shape"></div>
                <div className="avatar-shape-secondary"></div>
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
      </section>
    </main>
  );
}

