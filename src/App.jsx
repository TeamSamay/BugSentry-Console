import React, { useState, useEffect } from 'react';
import { FaGithub, FaGitlab, FaGoogle, FaCode, FaBriefcase } from 'react-icons/fa';
import './index.css';

const REVIEWS_DATA = [
  {
    id: 1,
    name: 'Relevance AI',
    handle: '@RelevanceAI_',
    text: (
      <>
        YouTube tech wizard Al Jason has just dropped a mind-blowing video
        showcasing his latest creation with Relevance, <span className="highlight">@Vapi_AI</span> and <span className="highlight">@GroqInc</span> : a real-time, multi channel AI voice sales agent.
      </>
    ),
    footer: "This isn't your run-of-the-mill chatbot.",
    emoji: "🔮"
  },
  {
    id: 2,
    name: 'Sarah Chen System',
    handle: '@sarahc_dev',
    text: (
      <>
        We integrated BugSentry into our CI/CD pipeline yesterday. It automatically isolated three zero-day dependencies before they ever reached our staging branch.
      </>
    ),
    footer: "Absolutely vital for modern enterprise DevOps.",
    emoji: "🛡️"
  },
  {
    id: 3,
    name: 'Marcus Tech',
    handle: '@marcustechie',
    text: (
      <>
        The speed at which <span className="highlight">@Bugsentry</span> analyzes threat vectors is insane. It's exactly like having a senior security engineer reviewing your PRs live.
      </>
    ),
    footer: "A total game changer for scaling startups.",
    emoji: "⚡"
  }
];

function LoginView({ onLogin }) {
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
      {/* Background Elements (Left Side Glow) */}
      <div className="bg-glow"></div>
      <div className="light-spot spot-1"></div>
      <div className="light-spot spot-2"></div>

      {/* Left Column (Auth) */}
      <section className="layout-left">
        {/* Navbar Region */}
        <nav className="navbar">
          <img src="/logo.png" alt="Bugsentry Logo" className="logo" />
        </nav>

        {/* Main Content */}
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

      {/* Right Column (Review/Marketing) */}
      <section className="layout-right">
        {/* Animated review floating card */}
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

function DashboardView() {
  return (
    <main className="dashboard-wrapper">
      <div className="bg-glow"></div>
      <nav className="navbar">
        <img src="/logo.png" alt="Bugsentry Logo" className="logo" />
      </nav>

      <div className="dashboard-content">
        <h1 className="dashboard-title">Choose your workspace experience</h1>
        
        <div className="role-cards-container">
          {/* Developer Mode Card */}
          <div className="role-card">
            <div className="role-icon">
              <FaCode />
            </div>
            <h3>Use as Developer</h3>
            <p>View technical insights, code-level risks, and detailed analysis</p>
          </div>

          {/* CEO Mode Card */}
          <div className="role-card">
            <div className="role-icon">
              <FaBriefcase />
            </div>
            <h3>Use as CEO</h3>
            <p>View business impact, risk summary, and decision insights</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {!isLoggedIn ? (
        <LoginView onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <DashboardView />
      )}
    </>
  );
}

export default App;
