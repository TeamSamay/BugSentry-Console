import React, { useState, useEffect } from 'react';
import { FaGithub, FaGitlab, FaGoogle, FaCode, FaBriefcase, FaRegSmile, FaDocker } from 'react-icons/fa';
import { 
  FiMenu, FiSearch, FiBell, FiPlus, FiInbox, 
  FiMessageSquare, FiGitBranch, FiFileText, FiGitCommit, FiFilter, FiMoreHorizontal, FiTerminal,
  FiCpu, FiAlertCircle, FiStar, FiChevronDown, FiBookOpen
} from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

function RiskGraph() {
  const data = [15, 25, 45, 30, 60, 40, 20]; // Expected Mock Weekly risk points
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const width = 600;
  const height = 120;
  
  const dx = width / (data.length - 1);
  const max = 100;
  const dy = height / max;
  
  let pathLine = `M 0 ${height - data[0] * dy}`;
  let pathArea = `M 0 ${height} L 0 ${height - data[0] * dy}`;
  
  data.forEach((val, i) => {
    if(i > 0) {
      pathLine += ` L ${i * dx} ${height - val * dy}`;
      pathArea += ` L ${i * dx} ${height - val * dy}`;
    }
  });
  pathArea += ` L ${width} ${height} Z`;

  return (
    <div className="dev-activity-card" style={{ marginBottom: '24px' }}>
      <div className="dev-feed-header" style={{ marginBottom: '32px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Repository Risk Trend</h3>
        <span style={{ background: 'rgba(210, 153, 34, 0.1)', color: '#d29922', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', border: '1px solid rgba(210, 153, 34, 0.2)' }}>Medium Risk</span>
      </div>
      
      <div style={{ width: '100%', height: 'auto', paddingBottom: '12px' }}>
        <svg viewBox={`0 -10 ${width} ${height + 40}`} style={{ width: '100%', overflow: 'visible' }}>
          <defs>
             <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="#d29922" stopOpacity="0.4" />
               <stop offset="100%" stopColor="#d29922" stopOpacity="0.0" />
             </linearGradient>
          </defs>
          <path d={pathArea} fill="url(#areaGrad)" />
          <path d={pathLine} fill="none" stroke="#d29922" strokeWidth="3" style={{ filter: 'drop-shadow(0 4px 6px rgba(210, 153, 34, 0.3))' }} />
          
          {data.map((val, i) => (
             <g key={i}>
               <circle cx={i * dx} cy={height - val * dy} r="5" fill="#000" stroke="#d29922" strokeWidth="2" />
               <text x={i * dx} y={height - val * dy - 15} fill="#fff" fontSize="12" textAnchor="middle" fontWeight="bold">
                 {val}%
               </text>
               <text x={i * dx} y={height + 25} fill="rgba(255,255,255,0.5)" fontSize="12" textAnchor="middle">
                 {labels[i]}
               </text>
             </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

const riskData = [
  { name: 'Mon', risk: 400, vulnerabilities: 24 },
  { name: 'Tue', risk: 300, vulnerabilities: 13 },
  { name: 'Wed', risk: 550, vulnerabilities: 8 },
  { name: 'Thu', risk: 280, vulnerabilities: 39 },
  { name: 'Fri', risk: 890, vulnerabilities: 48 },
  { name: 'Sat', risk: 490, vulnerabilities: 38 },
  { name: 'Sun', risk: 1490, vulnerabilities: 43 },
];

function RepositoryRiskChart() {
  return (
    <div className="dev-activity-card" style={{ marginBottom: '32px' }}>
      <div className="activity-card-header">
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff' }}>Repository Risk Overview</h3>
      </div>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <AreaChart
            data={riskData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f85149" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#f85149" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="risk" stroke="#f85149" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DeveloperDashboard({ onLogout, onBack }) {
  return (
    <div className="dev-dashboard-layout">
      {/* Background Elements (Consistent Glow) */}
      <div className="bg-glow"></div>
      <div className="light-spot spot-1"></div>
      <div className="light-spot spot-2"></div>

      {/* Top Navbar */}
      <header className="dev-topbar">
        <div className="dev-topbar-left">
          <button className="icon-btn"><FiMenu /></button>
          <img src="/logo.png" alt="Bugsentry Logo" className="dev-logo" />
          <span className="dev-topbar-title">Dashboard</span>
        </div>
        <div className="dev-topbar-center">
          <div className="dev-search-bar">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Type / to search" />
          </div>
        </div>
        <div className="dev-topbar-right">
          <button className="icon-btn" onClick={onBack} title="Switch Role"><FaBriefcase style={{ fontSize: '14px' }} /></button>
          <button className="icon-btn"><FiTerminal /></button>
          <button className="icon-btn"><FiPlus /></button>
          <button className="icon-btn"><FiGitBranch /></button>
          <button className="icon-btn"><FiInbox /></button>
          <div className="dev-user-avatar"></div>
          <button onClick={onLogout} className="logout-btn-small">Sign Out</button>
        </div>
      </header>

      {/* Main Grid content */}
      <div className="dev-main-grid">
        {/* Left Sidebar */}
        <aside className="dev-sidebar-left">
           <div className="dev-dropdown">
             <div className="dev-user-avatar small"></div>
             <span>Samay-Al-Verse</span>
             <span className="dropdown-arrow">▼</span>
           </div>
           
           <div className="dev-section-header">
             <h4>Top repositories</h4>
           </div>
           
           <input type="text" className="dev-input-filter" placeholder="Find a repository..." />
           
           <div className="expanded-sidebar-content">
             <ul className="dev-repo-list expanded">
               <li><span className="status-dot green"></span><span className="repo-name">Samay-Al-Verse/HealthOne</span></li>
               <li><span className="status-dot orange"></span><span className="repo-name">Samay-Al-Verse/DSA</span><span className="error-count orange">1 Error</span></li>
               <li><span className="status-dot red"></span><span className="repo-name">Samay-Al-Verse/Pharmastic-Bot</span><span className="error-count red">3 Errors</span></li>
               <li><span className="status-dot red"></span><span className="repo-name">Samay-Al-Verse/ShivanyaRxAI-...</span><span className="error-count red">1 Error</span></li>
               <li><span className="status-dot orange"></span><span className="repo-name">Samay-Al-Verse/Sanjeevani-WhatsAppChatbot</span><span className="error-count orange">2 Errors</span></li>
               <li><span className="status-dot green"></span><span className="repo-name">Samay-Al-Verse/Shivanya-Care</span></li>
             </ul>

             <hr className="sidebar-divider" />

             <h4 className="sidebar-subhead">Organizations</h4>
             <ul className="sidebar-list">
               <li><FaGithub className="sidebar-icon" /><span>Samay-Al-Verse</span><span className="count">6</span></li>
               <li><FaGithub className="sidebar-icon" /><span>Open-Neuro</span><span className="count">1</span></li>
             </ul>

             <hr className="sidebar-divider" />

             <h4 className="sidebar-subhead">Quick Actions</h4>
             <ul className="sidebar-list">
               <li><FiCpu className="sidebar-icon" /><span>Run AI Scan</span></li>
               <li><FiAlertCircle className="sidebar-icon" /><span>View Issues</span></li>
               <li><FaDocker className="sidebar-icon" /><span>Dockerfile Audit</span></li>
             </ul>
           </div>
        </aside>

        {/* Center Main Feed */}
        <main className="dev-center-feed">
           <h2 className="feed-title">Home</h2>
           
           {/* AI Prompt Box */}
           <div className="dev-ai-box">
             <textarea placeholder="Ask anything or type @ to add context" />
             <div className="ai-box-toolbar">
               <div className="toolbar-left">
                 <button className="btn-outline"><FiMessageSquare /> Ask ▼</button>
                 <button className="btn-outline"><FiFileText /> All repositories ▼</button>
                 <button className="btn-outline icon-only"><FiPlus /></button>
               </div>
               <div className="toolbar-right">
                 <span className="ai-model-selector">Claude Haiku 4.5 ▼</span>
                 <button className="btn-send"><FiMessageSquare /></button> {/* using icon placeholder for send */}
               </div>
             </div>
           </div>
           
           {/* Action Pills */}
           <div className="dev-action-pills">
             <button className="pill-btn"><FiTerminal /> Agent</button>
             <button className="pill-btn"><FiPlus /> Create issue</button>
             <button className="pill-btn"><FiFileText /> Write code ▼</button>
             <button className="pill-btn"><FiGitBranch /> Git ▼</button>
           </div>
           <div className="dev-action-pills center">
             <button className="pill-btn"><FiGitBranch /> Pull requests ▼</button>
           </div>

           {/* Alert */}
           <div className="dev-alert-banner">
             <div className="alert-content">
               <span className="alert-icon"><FaRegSmile /></span>
               <span>You've been added to the <strong>Open-Neuro</strong> organization.</span>
             </div>
             <div className="alert-actions">
               <button className="btn-outline small">View organization</button>
               <button className="btn-close">×</button>
             </div>
           </div>

           {/* Risk Graph Component */}
           <RepositoryRiskChart />

           {/* Overall History Card (GitHub Style) */}
           <div className="gh-history-card">
             <div className="gh-history-header">
               <div className="gh-history-avatar-group">
                 <div className="gh-main-avatar"></div>
                 <div className="gh-mini-icon"><FiBookOpen size={9} color="#c9d1d9" /></div>
               </div>
               <div className="gh-history-meta">
                 <div>
                   <span className="gh-author">Samay-Al-Verse</span> <span className="gh-action-text">created 2 repositories</span>
                 </div>
                 <span className="gh-time">last week</span>
               </div>
               <button className="icon-btn" style={{ marginLeft: 'auto' }}><FiMoreHorizontal /></button>
             </div>

             <div className="gh-inner-cards-wrapper">
               <div className="gh-inner-card">
                 <div className="gh-inner-top">
                   <div className="gh-inner-title">
                     <div className="gh-small-avatar"></div>
                     <strong>Samay-Al-Verse/BugSentry-Backend</strong>
                   </div>
                   <div className="gh-star-group">
                     <button className="gh-btn-star"><FiStar size={14} /> Star</button>
                     <button className="gh-btn-dropdown"><FiChevronDown size={14} /></button>
                   </div>
                 </div>
                 <p className="gh-inner-desc">This is BugSentry AI Backend</p>
               </div>

               <div className="gh-inner-card" style={{ marginBottom: 0 }}>
                 <div className="gh-inner-top">
                   <div className="gh-inner-title">
                     <div className="gh-small-avatar"></div>
                     <strong>Samay-Al-Verse/BugSentry-Console</strong>
                   </div>
                   <div className="gh-star-group">
                     <button className="gh-btn-star"><FiStar size={14} /> Star</button>
                     <button className="gh-btn-dropdown"><FiChevronDown size={14} /></button>
                   </div>
                 </div>
                 <p className="gh-inner-desc">This is BugSentry Health Prediction App</p>
                 <div className="gh-language-tag">
                   <span className="status-dot" style={{ backgroundColor: '#00B4AB' }}></span> Dart
                 </div>
               </div>
             </div>
           </div>

           {/* Feed Header */}
           <div className="dev-feed-header">
             <h3>Feed & Analytics</h3>
             <button className="btn-outline"><FiFilter /> Filter</button>
           </div>

           {/* Statistical Graph */}
           <RiskGraph />

           {/* Activity Cards */}
           <div className="dev-activity-card">
              <div className="activity-card-header">
                <div className="ac-avatar"></div>
                <div className="ac-meta">
                  <span className="ac-repo">Universal-Commerce-Protocol/ucp</span> <span className="ac-action">released</span>
                  <span className="ac-time">yesterday</span>
                </div>
                <button className="icon-btn"><FiMoreHorizontal /></button>
              </div>
              <div className="activity-card-body">
                <h3>Release v2026-04-08</h3>
              </div>
           </div>
        </main>
      </div>
    </div>
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
         <div className="workspace-icon" style={{ color: '#9b51e0' }}>
           <FaBriefcase size={64} />
         </div>
         <h1 className="workspace-title">
           CEO Executive Dashboard
         </h1>
         <p className="workspace-subtitle">
           Aggregated organization risk posture, deployment velocity metrics, and compliance analytics.
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
      ) : activeRole === 'developer' ? (
        <DeveloperDashboard onLogout={handleLogout} onBack={() => setActiveRole(null)} />
      ) : (
        <WorkspaceView role={activeRole} onLogout={handleLogout} onBack={() => setActiveRole(null)} />
      )}
    </>
  );
}

export default App;
