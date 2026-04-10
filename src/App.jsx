import React, { useMemo, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { FaGithub, FaGitlab, FaGoogle, FaCode, FaBriefcase, FaRegSmile, FaDocker } from 'react-icons/fa';
import { 
  FiMenu, FiSearch, FiBell, FiPlus, FiInbox, 
  FiMessageSquare, FiGitBranch, FiFileText, FiGitCommit, FiFilter, FiMoreHorizontal, FiTerminal,
  FiCpu, FiAlertCircle, FiStar, FiChevronDown, FiBookOpen, FiPlay,
  FiUpload, FiUsers, FiCode, FiUser, FiSettings, FiLogOut
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

const DEV_REPOS = [
  { id: 'healthone', name: 'Samay-Al-Verse/HealthOne', status: 'green', errorCount: 0, desc: 'HealthOne application backend routing' },
  { id: 'dsa', name: 'Samay-Al-Verse/DSA', status: 'orange', errorCount: 1, desc: 'Data Structures analysis and tests' },
  { id: 'pharmastic-bot', name: 'Samay-Al-Verse/Pharmastic-Bot', status: 'red', errorCount: 3, desc: 'Pharmastic Bot automation scripts' },
  { id: 'shivanya-rxai-system', name: 'Samay-Al-Verse/ShivanyaRxAI-System', status: 'red', errorCount: 1, desc: 'AI Diagnosis backend endpoints' },
  { id: 'sanjeevani-whatsapp-chatbot', name: 'Samay-Al-Verse/Sanjeevani-WhatsAppChatbot', status: 'orange', errorCount: 2, desc: 'WhatsApp web chatbot interface' },
  { id: 'shivanya-care', name: 'Samay-Al-Verse/Shivanya-Care', status: 'green', errorCount: 0, desc: 'Shivanya Care frontend UI' },
];

function DevSidebarLeft({ repos, activeRepoId, scannedRepos, setScannedRepos, onOpenRepoDetails }) {
  const handlePlayClick = (repoName, e) => {
    e.stopPropagation();
    setScannedRepos(prev => ({ ...prev, [repoName]: true }));
  };

  return (
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
          {repos.map((repo, i) => (
            <li
              key={i}
              onClick={() => onOpenRepoDetails(repo.id)}
              className={repo.id === activeRepoId ? 'active' : undefined}
              style={{ cursor: 'pointer' }}
            >
              <span className={`status-dot ${repo.status}`}></span>
              <span className="repo-name">{repo.name}</span>
              {!scannedRepos[repo.name] ? (
                <button
                  onClick={(e) => handlePlayClick(repo.name, e)}
                  className="btn-play-scan"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px'
                  }}
                  title="Scan Repository"
                >
                  <FiPlay size={10} />
                </button>
              ) : repo.errorCount > 0 ? (
                <span className={`error-count ${repo.status}`} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                  {repo.errorCount} Error{repo.errorCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="error-count green">Clean</span>
              )}
            </li>
          ))}
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
  );
}

function RepoDetailsPage({ repos, repoFindings, scannedRepos, setScannedRepos, onOpenRepoDetails, onBackToDashboard }) {
  const { repoId } = useParams();
  const repo = useMemo(() => repos.find(r => r.id === repoId), [repos, repoId]);
  const findings = repoId ? repoFindings[repoId] : null;
  const isScanned = repo ? Boolean(scannedRepos[repo.name]) : false;

  if (!repoId) return <Navigate to="/developer" replace />;
  if (!repo) return <Navigate to="/developer" replace />;

  const riskTone = repo.errorCount === 0 ? '#2ea043' : repo.errorCount >= 3 ? '#f85149' : '#d29922';
  const riskLabel = repo.errorCount === 0 ? 'Clean' : repo.errorCount >= 3 ? 'High Risk' : 'Medium Risk';

  return (
    <div className="dev-dashboard-layout">
      <div className="bg-glow"></div>
      <div className="light-spot spot-1"></div>
      <div className="light-spot spot-2"></div>

      <header className="dev-topbar">
        <div className="dev-topbar-left">
          <button className="icon-btn" onClick={onBackToDashboard} title="Back to Dashboard">←</button>
          <img src="/logo.png" alt="Bugsentry Logo" className="dev-logo" />
          <span className="dev-topbar-title">Repository Details</span>
        </div>
        <div className="dev-topbar-center">
          <div className="dev-search-bar">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search findings..." />
          </div>
        </div>
        <div className="dev-topbar-right">
          <span style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '999px', border: `1px solid ${riskTone}33`, color: riskTone, background: `${riskTone}14` }}>
            {riskLabel}
          </span>
        </div>
      </header>

      <div className="dev-main-grid">
        <DevSidebarLeft
          repos={repos}
          activeRepoId={repoId}
          scannedRepos={scannedRepos}
          setScannedRepos={setScannedRepos}
          onOpenRepoDetails={onOpenRepoDetails}
        />

        <main className="dev-center-feed">
          <h2 className="feed-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{repo.name}</span>
            {isScanned ? (
              <span style={{ fontSize: '12px', color: '#2ea043' }}>• scanned</span>
            ) : (
              <span style={{ fontSize: '12px', color: '#d29922' }}>• not scanned</span>
            )}
          </h2>

          <div className="dev-activity-card" style={{ marginBottom: '18px' }}>
            <div className="activity-card-header">
              <div className="ac-avatar"></div>
              <div className="ac-meta">
                <span className="ac-repo">Remediation Timeline</span>
                <span className="ac-time">estimated</span>
              </div>
              <button className="icon-btn"><FiMoreHorizontal /></button>
            </div>
            <div className="activity-card-body" style={{ marginTop: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                <div className="desc-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px' }}>
                  <div style={{ color: '#8b949e', fontSize: '12px' }}>Days to remediate</div>
                  <div style={{ color: '#e6edf3', fontSize: '22px', fontWeight: 800, marginTop: '6px' }}>{findings?.etaDaysToFix ?? 0} days</div>
                </div>
                <div className="desc-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px' }}>
                  <div style={{ color: '#8b949e', fontSize: '12px' }}>Crash risk window</div>
                  <div style={{ color: '#e6edf3', fontSize: '22px', fontWeight: 800, marginTop: '6px' }}>{findings?.etaDaysToCrash ?? 0} days</div>
                </div>
                <div className="desc-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px' }}>
                  <div style={{ color: '#8b949e', fontSize: '12px' }}>Confidence</div>
                  <div style={{ color: '#e6edf3', fontSize: '22px', fontWeight: 800, marginTop: '6px' }}>{findings?.confidence ?? '—'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="dev-activity-card" style={{ marginBottom: '18px', borderColor: repo.errorCount ? 'rgba(248, 81, 73, 0.35)' : 'rgba(46, 160, 67, 0.25)' }}>
            <div className="activity-card-header">
              <div className="ac-avatar"></div>
              <div className="ac-meta">
                <span className="ac-repo">Error specification</span>
                <span className="ac-time">{repo.errorCount > 0 ? `${repo.errorCount} finding(s)` : '0 findings'}</span>
              </div>
              <button className="icon-btn"><FiMoreHorizontal /></button>
            </div>

            <div className="activity-card-body" style={{ marginTop: '14px' }}>
              {repo.errorCount === 0 ? (
                <div className="desc-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#e6edf3' }}>No critical issues detected</h4>
                  <p style={{ margin: 0, color: '#8b949e', fontSize: '13px', lineHeight: 1.6 }}>
                    This repository is currently classified as clean. Continue monitoring dependency updates and keep CI checks strict.
                  </p>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ color: '#8b949e', fontSize: '12px', marginBottom: '6px' }}>Suggested solutions</div>
                    <ul style={{ color: '#c9d1d9', fontSize: '13px', paddingLeft: '18px', margin: 0, lineHeight: 1.7 }}>
                      <li>Enable dependency update alerts and review weekly.</li>
                      <li>Keep CI required checks strict (lint + build + security scan).</li>
                      <li>Rotate secrets periodically and enforce least-privilege tokens.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                (findings?.findings ?? []).map((f, idx) => (
                  <div key={idx} className="desc-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, color: '#e6edf3' }}>{f.title}</h4>
                      <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '999px', border: `1px solid ${riskTone}33`, color: riskTone, background: `${riskTone}14`, whiteSpace: 'nowrap' }}>
                        {f.severity}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', color: '#c9d1d9', fontSize: '13px', lineHeight: 1.6 }}>
                      {f.spec}
                    </p>
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ color: '#8b949e', fontSize: '12px', marginBottom: '6px' }}>Suggested solutions</div>
                      <ul style={{ color: '#c9d1d9', fontSize: '13px', paddingLeft: '18px', margin: 0, lineHeight: 1.7 }}>
                        {f.solutions.map((s, si) => (
                          <li key={si}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function DeveloperDashboard({ onLogout, onBack, onOpenRepoDetails, scannedRepos, setScannedRepos }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [createMenuAnchorEl, setCreateMenuAnchorEl] = useState(null);
  const [createMenuPos, setCreateMenuPos] = useState({ top: 0, right: 0 });
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null);
  const [profileMenuPos, setProfileMenuPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!showCreateMenu) return;

    if (createMenuAnchorEl) {
      const rect = createMenuAnchorEl.getBoundingClientRect();
      setCreateMenuPos({
        top: Math.round(rect.bottom + 8),
        right: Math.max(8, Math.round(window.innerWidth - rect.right)),
      });
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowCreateMenu(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCreateMenu, createMenuAnchorEl]);

  useEffect(() => {
    if (!showProfileMenu) return;

    if (profileMenuAnchorEl) {
      const rect = profileMenuAnchorEl.getBoundingClientRect();
      setProfileMenuPos({
        top: Math.round(rect.bottom + 8),
        right: Math.max(8, Math.round(window.innerWidth - rect.right)),
      });
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowProfileMenu(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showProfileMenu, profileMenuAnchorEl]);

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
        <div className="dev-topbar-right" style={{ position: 'relative' }}>
          <div className="gh-plus-group" ref={setCreateMenuAnchorEl}>
            <button className="gh-btn-plus" title="Create">
              <FiPlus size={14} />
            </button>
            <button
              className="gh-btn-dropdown"
              title="Create menu"
              onClick={() => setShowCreateMenu(v => !v)}
            >
              <FiChevronDown size={14} />
            </button>
          </div>

          {showCreateMenu && (
            <>
              <button
                type="button"
                className="gh-menu-backdrop"
                aria-label="Close menu"
                onClick={() => setShowCreateMenu(false)}
              />
              <div
                className="gh-menu"
                role="menu"
                aria-label="Create menu"
                style={{ position: 'fixed', top: createMenuPos.top, right: createMenuPos.right, zIndex: 9999 }}
              >
                <button className="gh-menu-item" role="menuitem" onClick={() => setShowCreateMenu(false)}>
                <span className="gh-menu-icon"><FiAlertCircle size={16} /></span>
                <span>New issue</span>
              </button>
              <button className="gh-menu-item" role="menuitem" onClick={() => setShowCreateMenu(false)}>
                <span className="gh-menu-icon"><FiBookOpen size={16} /></span>
                <span>New repository</span>
              </button>
              <button className="gh-menu-item" role="menuitem" onClick={() => setShowCreateMenu(false)}>
                <span className="gh-menu-icon"><FiUpload size={16} /></span>
                <span>Import repository</span>
              </button>

              <div className="gh-menu-sep" role="separator" />

              <button className="gh-menu-item" role="menuitem" onClick={() => setShowCreateMenu(false)}>
                <span className="gh-menu-icon"><FiCpu size={16} /></span>
                <span>New codespace</span>
              </button>
              <button className="gh-menu-item" role="menuitem" onClick={() => setShowCreateMenu(false)}>
                <span className="gh-menu-icon"><FiCode size={16} /></span>
                <span>New gist</span>
              </button>

              <div className="gh-menu-sep" role="separator" />

              <button className="gh-menu-item" role="menuitem" onClick={() => setShowCreateMenu(false)}>
                <span className="gh-menu-icon"><FiUsers size={16} /></span>
                <span>New organization</span>
              </button>
              <button className="gh-menu-item" role="menuitem" onClick={() => setShowCreateMenu(false)}>
                <span className="gh-menu-icon"><FiFileText size={16} /></span>
                <span>New project</span>
              </button>
              </div>
            </>
          )}

          <button
            className="gh-avatar-btn"
            ref={setProfileMenuAnchorEl}
            title="Profile"
            onClick={() => setShowProfileMenu(v => !v)}
          >
            <span className="gh-avatar" aria-hidden="true">
              <FiUser size={14} />
            </span>
          </button>

          {showProfileMenu && (
            <>
              <button
                type="button"
                className="gh-menu-backdrop"
                aria-label="Close profile menu"
                onClick={() => setShowProfileMenu(false)}
              />
              <div
                className="gh-menu"
                role="menu"
                aria-label="Profile menu"
                style={{ position: 'fixed', top: profileMenuPos.top, right: profileMenuPos.right, zIndex: 9999, minWidth: 280 }}
              >
                <div style={{ padding: '8px 16px 10px 16px', color: '#e6edf3' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Onkarnagargoje</div>
                  <div style={{ color: '#8b949e', fontSize: '12px', marginTop: '2px' }}>@Onkar Nagargoje</div>
                </div>

                <div className="gh-menu-sep" role="separator" />

                <button className="gh-menu-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  <span className="gh-menu-icon"><FaRegSmile size={16} /></span>
                  <span>Set status</span>
                </button>

                <div className="gh-menu-sep" role="separator" />

                <button className="gh-menu-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  <span className="gh-menu-icon"><FiUser size={16} /></span>
                  <span>Profile</span>
                </button>
                <button className="gh-menu-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  <span className="gh-menu-icon"><FiBookOpen size={16} /></span>
                  <span>Repositories</span>
                </button>
                <button className="gh-menu-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  <span className="gh-menu-icon"><FiStar size={16} /></span>
                  <span>Stars</span>
                </button>
                <button className="gh-menu-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  <span className="gh-menu-icon"><FiCode size={16} /></span>
                  <span>Gists</span>
                </button>
                <button className="gh-menu-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  <span className="gh-menu-icon"><FiUsers size={16} /></span>
                  <span>Organizations</span>
                </button>

                <div className="gh-menu-sep" role="separator" />

                <button className="gh-menu-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  <span className="gh-menu-icon"><FiSettings size={16} /></span>
                  <span>Settings</span>
                </button>
                <button className="gh-menu-item" role="menuitem" onClick={() => { setShowProfileMenu(false); onLogout(); }}>
                  <span className="gh-menu-icon"><FiLogOut size={16} /></span>
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Grid content */}
      <div className="dev-main-grid">
        {/* Left Sidebar */}
        <DevSidebarLeft
          repos={DEV_REPOS}
          activeRepoId={null}
          scannedRepos={scannedRepos}
          setScannedRepos={setScannedRepos}
          onOpenRepoDetails={onOpenRepoDetails}
        />

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
             <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>Feed & Analytics</h4>
             <button className="btn-outline"><FiFilter /> Filter</button>
           </div>
           <div className="dev-activity-card" style={{ marginBottom: '32px', textAlign: 'center', padding: '48px 24px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
             <FiAlertCircle size={32} color="rgba(255,255,255,0.2)" style={{ marginBottom: '16px' }} />
             <h4 style={{ color: '#e6edf3', marginBottom: '8px' }}>Open a repository to view details</h4>
             <p style={{ color: '#8b949e', fontSize: '13px', margin: 0 }}>
               Click any repository on the left to open its dedicated page with error specifications, solutions, and remediation timelines.
             </p>
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
  const [scannedRepos, setScannedRepos] = useState({});
  const navigate = useNavigate();

  const repoFindings = useMemo(() => ({
    'healthone': {
      etaDaysToFix: 2,
      etaDaysToCrash: 90,
      confidence: 'Medium',
      findings: [],
    },
    'dsa': {
      etaDaysToFix: 3,
      etaDaysToCrash: 21,
      confidence: 'High',
      findings: [
        {
          severity: 'High',
          title: 'Unbounded recursion path in test harness',
          spec: 'A failing edge-case can trigger deep recursion and exhaust stack limits during CI runs and on debug builds.',
          solutions: [
            'Add recursion depth guard or convert to iterative approach.',
            'Add fuzz tests for worst-case inputs (e.g., sorted/duplicate-heavy arrays).',
            'Enforce timeouts in CI for pathological cases.',
          ],
        },
      ],
    },
    'pharmastic-bot': {
      etaDaysToFix: 6,
      etaDaysToCrash: 10,
      confidence: 'High',
      findings: [
        {
          severity: 'Critical',
          title: 'Secrets leakage in automation logs',
          spec: 'Bot execution logs can expose API keys/tokens due to verbose debug logging and unsafe string interpolation.',
          solutions: [
            'Rotate all exposed keys immediately and invalidate old tokens.',
            'Mask secrets in logs (redaction middleware + allowlist logging).',
            'Move secrets to environment variables/secret manager; never commit them.',
          ],
        },
        {
          severity: 'High',
          title: 'Unpinned dependencies causing supply-chain drift',
          spec: 'Dependencies are not pinned/locked, enabling unexpected upgrades that may introduce breaking changes or malicious packages.',
          solutions: [
            'Pin versions and commit lockfiles.',
            'Enable dependabot/renovate with review gates.',
            'Add SBOM + signature verification in CI.',
          ],
        },
        {
          severity: 'Medium',
          title: 'Missing retry/backoff on external requests',
          spec: 'Transient API failures can cascade and crash the job runner due to immediate hard failures.',
          solutions: [
            'Add exponential backoff retries for 429/5xx.',
            'Add circuit-breaker for repeated failures.',
            'Persist job state and resume instead of restarting from scratch.',
          ],
        },
      ],
    },
    'shivanya-rxai-system': {
      etaDaysToFix: 5,
      etaDaysToCrash: 14,
      confidence: 'Medium',
      findings: [
        {
          severity: 'High',
          title: 'Input validation gaps on diagnosis endpoints',
          spec: 'Certain fields accept unexpected types/lengths, which can cause downstream model errors and service instability.',
          solutions: [
            'Add strict schema validation at the boundary (e.g., Zod/Joi/Pydantic).',
            'Return structured error codes; block oversized payloads.',
            'Add rate limiting + WAF rules for abuse patterns.',
          ],
        },
      ],
    },
    'sanjeevani-whatsapp-chatbot': {
      etaDaysToFix: 4,
      etaDaysToCrash: 18,
      confidence: 'High',
      findings: [
        {
          severity: 'Medium',
          title: 'Session store eviction causing message loop',
          spec: 'When session state is evicted, the bot can re-process messages and create repeated replies, increasing failure rate.',
          solutions: [
            'Persist session state with TTL and idempotency keys.',
            'Deduplicate inbound message IDs for 24h window.',
            'Add a circuit breaker when repetition is detected.',
          ],
        },
        {
          severity: 'High',
          title: 'Unhandled media parsing exceptions',
          spec: 'Certain attachment types throw unhandled exceptions and crash the worker process.',
          solutions: [
            'Wrap parsers with try/catch and fall back gracefully.',
            'Add file type allowlist and size limits.',
            'Add poison-queue handling and retry policy.',
          ],
        },
      ],
    },
    'shivanya-care': {
      etaDaysToFix: 1,
      etaDaysToCrash: 60,
      confidence: 'Low',
      findings: [],
    },
  }), []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveRole(null);
    setScannedRepos({});
    navigate('/', { replace: true });
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              <LoginView onLogin={() => setIsLoggedIn(true)} />
            ) : !activeRole ? (
              <RoleSelectionView onLogout={handleLogout} onRoleSelect={(role) => { setActiveRole(role); if (role === 'developer') navigate('/developer'); }} />
            ) : activeRole === 'developer' ? (
              <Navigate to="/developer" replace />
            ) : (
              <WorkspaceView role={activeRole} onLogout={handleLogout} onBack={() => { setActiveRole(null); navigate('/'); }} />
            )
          }
        />

        <Route
          path="/developer"
          element={
            isLoggedIn && activeRole === 'developer' ? (
              <DeveloperDashboard
                onLogout={handleLogout}
                onBack={() => { setActiveRole(null); navigate('/'); }}
                onOpenRepoDetails={(repoId) => navigate(`/repo/${repoId}`)}
                scannedRepos={scannedRepos}
                setScannedRepos={setScannedRepos}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/repo/:repoId"
          element={
            isLoggedIn && activeRole === 'developer' ? (
              <RepoDetailsPage
                repos={DEV_REPOS}
                repoFindings={repoFindings}
                scannedRepos={scannedRepos}
                setScannedRepos={setScannedRepos}
                onOpenRepoDetails={(repoId) => navigate(`/repo/${repoId}`)}
                onBackToDashboard={() => navigate('/developer')}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
