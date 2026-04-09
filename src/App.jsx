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

function RoleSelectionView({ onLogout, onRoleSelect }) {
  return (
    <main className="dashboard-wrapper">
      <div className="bg-glow"></div>
      <nav className="navbar" style={{ justifyContent: 'space-between' }}>
        <img src="/logo.png" alt="Bugsentry Logo" className="logo" />
        <button onClick={onLogout} className="logout-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', fontSize: '13px' }}>
          Sign Out
        </button>
      </nav>

      <div className="dashboard-content">
        <h1 className="dashboard-title">Choose your workspace experience</h1>
        
        <div className="role-cards-container">
          {/* Developer Mode Card */}
          <div className="role-card" onClick={() => onRoleSelect('developer')}>
            <div className="role-icon">
              <FaCode />
            </div>
            <h3>Use as Developer</h3>
            <p>View technical insights, code-level risks, and detailed analysis</p>
          </div>

          {/* CEO Mode Card */}
          <div className="role-card" onClick={() => onRoleSelect('ceo')}>
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

function WorkspaceView({ role, onLogout, onBack }) {
  const isDev = role === 'developer';
  
  return (
    <main className="dashboard-wrapper">
      <div className="bg-glow"></div>
      <nav className="navbar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <img src="/logo.png" alt="Bugsentry Logo" className="logo" />
          <button className="auth-btn" onClick={onBack} style={{ height: '36px', padding: '0 16px', borderRadius: '8px', background: 'transparent' }}>← Switch Role</button>
        </div>
        <button onClick={onLogout} className="logout-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', fontSize: '13px' }}>
          Sign Out
        </button>
      </nav>
      
      <div className="workspace-content animate-zoom-in">
         <div className="workspace-icon" style={{ color: isDev ? '#58A6FF' : '#9b51e0' }}>
           {isDev ? <FaCode size={64} /> : <FaBriefcase size={64} />}
         </div>
         <h1 className="workspace-title">
           {isDev ? 'Developer Environment' : 'CEO Executive Dashboard'}
         </h1>
         <p className="workspace-subtitle">
           {isDev 
             ? 'Connected to live source control. Actively monitoring pipeline health, critical dependencies, and trace logs.' 
             : 'Aggregated organization risk posture, deployment velocity metrics, and compliance analytics.'}
         </p>
         <button className="hologram-btn">
             Initialize Workspace
         </button>
      </div>
    </main>
  );
}


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeRole, setActiveRole] = useState(null);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveRole(null);
  }

  return (
    <>
      {!isLoggedIn ? (
        <LoginView onLogin={() => setIsLoggedIn(true)} />
      ) : !activeRole ? (
        <RoleSelectionView onLogout={handleLogout} onRoleSelect={setActiveRole} />
      ) : (
        <WorkspaceView role={activeRole} onLogout={handleLogout} onBack={() => setActiveRole(null)} />
      )}
    </>
  );
}

export default App;
