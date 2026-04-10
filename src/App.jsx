import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaGithub, FaGitlab, FaGoogle, FaCode, FaBriefcase, FaRegSmile, FaDocker } from 'react-icons/fa';
import {
  FiMenu, FiSearch, FiPlus, FiInbox,
  FiMessageSquare, FiGitBranch, FiFileText, FiFilter, FiMoreHorizontal, FiTerminal,
  FiCpu, FiAlertCircle, FiStar, FiChevronDown, FiBookOpen, FiSend, FiRefreshCw, FiZap,
  FiX, FiShield, FiGitCommit
} from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './index.css';

/* ── Service URLs ──────────────────────────────────────────────────────────── */
const AUTH_URL   = 'https://bugsentry-auth.onrender.com';
const SYSTEM_URL = 'https://bugsentry-system.onrender.com';

/* ── Language Color Map ────────────────────────────────────────────────────── */
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', Go: '#00ADD8', Rust: '#dea584',
  Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF',
  Dart: '#00B4AB', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
};

/* ── Marketing Reviews ─────────────────────────────────────────────────────── */
const REVIEWS_DATA = [
  {
    id: 1,
    name: 'Relevance AI',
    handle: '@RelevanceAI_',
    text: (
      <>
        YouTube tech wizard Al Jason has just dropped a mind-blowing video
        showcasing his latest creation with Relevance, <span className="highlight">@Vapi_AI</span> and{' '}
        <span className="highlight">@GroqInc</span>: a real-time, multi-channel AI voice sales agent.
      </>
    ),
    footer: "This isn't your run-of-the-mill chatbot.",
    emoji: '🔮',
  },
  {
    id: 2,
    name: 'Sarah Chen System',
    handle: '@sarahc_dev',
    text: (
      <>
        We integrated BugSentry into our CI/CD pipeline yesterday. It automatically isolated three
        zero-day dependencies before they ever reached our staging branch.
      </>
    ),
    footer: 'Absolutely vital for modern enterprise DevOps.',
    emoji: '🛡️',
  },
  {
    id: 3,
    name: 'Marcus Tech',
    handle: '@marcustechie',
    text: (
      <>
        The speed at which <span className="highlight">@Bugsentry</span> analyzes threat vectors is
        insane. It's exactly like having a senior security engineer reviewing your PRs live.
      </>
    ),
    footer: 'A total game changer for scaling startups.',
    emoji: '⚡',
  },
];

/* ── Hooks ─────────────────────────────────────────────────────────────────── */

/** Fetches current user from bugsentry-auth using stored JWT */
function useUser(token) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { setUser(null); return; }
    setLoading(true);
    fetch(`${AUTH_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error('auth'); return r.json(); })
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [token]);

  return { user, loading };
}

/** Fetches real GitHub repos from bugsentry-system */
function useRepos(token) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchRepos = useCallback(async (doSync = false) => {
    if (!token) return;

    // Optionally sync to DB first (also fetches live from GitHub)
    if (doSync) {
      setSyncing(true);
      try {
        await fetch(`${SYSTEM_URL}/api/github/sync`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* ignore sync errors */ }
      setSyncing(false);
    }

    // Fetch live repos directly from GitHub via the system service
    setLoading(true);
    try {
      const r = await fetch(`${SYSTEM_URL}/api/github/repos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error('repos-live');
      const data = await r.json();
      // Normalize raw GitHub API fields
      const normalized = (data.repos || []).map(repo => ({
        repo_id: String(repo.repo_id || repo.id),
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || '',
        language: repo.language || null,
        stargazers_count: repo.stargazers_count || 0,
        forks_count: repo.forks_count || 0,
        private: repo.private || false,
        html_url: repo.html_url || repo.url || '',
        updated_at: repo.updated_at || '',
      }));
      setRepos(normalized);
    } catch {
      // Fallback: try list-saved from DB
      try {
        const r = await fetch(`${SYSTEM_URL}/api/github/list-saved`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await r.json();
        const normalized = (data.repos || []).map(repo => ({
          repo_id: String(repo.repo_id || repo.id || Math.random()),
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description || '',
          language: repo.language || null,
          stargazers_count: repo.stargazers_count || 0,
          forks_count: repo.forks_count || 0,
          private: repo.private || false,
          html_url: repo.html_url || repo.url || '',
          updated_at: repo.updated_at || '',
        }));
        setRepos(normalized);
      } catch { /* both failed */ }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRepos(true); // sync + fetch on mount
  }, [fetchRepos]);

  return { repos, loading, syncing, refetch: () => fetchRepos(true) };
}

/* ── Helper Components ─────────────────────────────────────────────────────── */

function SkeletonRepo() {
  return (
    <li className="skeleton-repo">
      <div className="skeleton-dot" />
      <div className="skeleton-line" />
    </li>
  );
}

function AnalysisBadge({ status }) {
  if (!status || status === 'not_started') return null;
  const map = {
    completed:   { label: 'Scanned',     cls: 'badge-green'  },
    running:     { label: 'Scanning…',   cls: 'badge-orange' },
    failed:      { label: 'Failed',      cls: 'badge-red'    },
  };
  const { label, cls } = map[status] || {};
  if (!label) return null;
  return <span className={`analysis-badge ${cls}`}>{label}</span>;
}

function TypingIndicator() {
  return (
    <div className="chat-msg chat-msg-bot">
      <div className="chat-bot-avatar">
        <FiZap size={10} />
      </div>
      <div className="chat-typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  return (
    <div className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}`}>
      {msg.role === 'bot' && (
        <div className="chat-bot-avatar">
          <FiZap size={10} />
        </div>
      )}
      <div className="chat-bubble">{msg.text}</div>
    </div>
  );
}

/* ── Static Charts (unchanged) ─────────────────────────────────────────────── */

function RiskGraph() {
  const data = [15, 25, 45, 30, 60, 40, 20];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const width = 600;
  const height = 120;
  const dx = width / (data.length - 1);
  const max = 100;
  const dy = height / max;

  let pathLine = `M 0 ${height - data[0] * dy}`;
  let pathArea = `M 0 ${height} L 0 ${height - data[0] * dy}`;

  data.forEach((val, i) => {
    if (i > 0) {
      pathLine += ` L ${i * dx} ${height - val * dy}`;
      pathArea += ` L ${i * dx} ${height - val * dy}`;
    }
  });
  pathArea += ` L ${width} ${height} Z`;

  return (
    <div className="dev-activity-card" style={{ marginBottom: '24px' }}>
      <div className="dev-feed-header" style={{ marginBottom: '32px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Repository Risk Trend</h3>
        <span style={{ background: 'rgba(210, 153, 34, 0.1)', color: '#d29922', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', border: '1px solid rgba(210, 153, 34, 0.2)' }}>
          Medium Risk
        </span>
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
              <text x={i * dx} y={height - val * dy - 15} fill="#fff" fontSize="12" textAnchor="middle" fontWeight="bold">{val}%</text>
              <text x={i * dx} y={height + 25} fill="rgba(255,255,255,0.5)" fontSize="12" textAnchor="middle">{labels[i]}</text>
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
          <AreaChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f85149" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#f85149" stopOpacity={0} />
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

/* ── LoginView ─────────────────────────────────────────────────────────────── */

function LoginView() {
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview(prev => (prev + 1) % REVIEWS_DATA.length);
    }, 3000);
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
          <div className="glass-card">
            <div className="header">
              <h1 className="title">Welcome to Bugsentry</h1>
              <p className="subtitle">AI-powered Software Risk Intelligence</p>
            </div>

            <div className="button-group">
              <a href={`${AUTH_URL}/auth/google/login`} className="auth-btn">
                <span className="btn-icon"><FaGoogle color="#4285F4" /></span>
                Continue with Google
              </a>
              <a href={`${AUTH_URL}/auth/github/login`} className="auth-btn">
                <span className="btn-icon"><FaGithub /></span>
                Continue with GitHub
              </a>
              <a href={`${AUTH_URL}/auth/gitlab/login`} className="auth-btn">
                <span className="btn-icon"><FaGitlab color="#FC6D26" /></span>
                Continue with GitLab
              </a>
            </div>

            <p className="auth-footnote">
              By continuing, you agree to BugSentry's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </section>

      {/* Right — Marketing */}
      <section className="layout-right">
        <div className="review-card">
          <div key={activeReview.id} className="review-content-animate">
            <div className="review-header">
              <div className="review-avatar">
                <div className="avatar-shape" />
                <div className="avatar-shape-secondary" />
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

/* ── RoleSelectionView ─────────────────────────────────────────────────────── */

function RoleSelectionView({ onLogout, onRoleSelect, user }) {
  return (
    <main className="dashboard-wrapper">
      <div className="bg-glow" />
      <nav className="navbar" style={{ justifyContent: 'space-between' }}>
        <img src="/logo.png" alt="Bugsentry Logo" className="logo" />
        <button onClick={onLogout} className="logout-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', fontSize: '13px' }}>
          Sign Out
        </button>
      </nav>

      <div className="dashboard-content">
        {user && (
          <div className="role-select-user">
            {user.picture
              ? <img src={user.picture} alt="avatar" className="role-user-avatar-img" />
              : <div className="role-user-avatar-placeholder" />
            }
            <p className="role-user-welcome">Welcome back, <strong>{user.name || user.email}</strong></p>
          </div>
        )}
        <h1 className="dashboard-title">Choose your workspace experience</h1>
        <div className="role-cards-container">
          <div className="role-card" onClick={() => onRoleSelect('developer')}>
            <div className="role-icon"><FaCode /></div>
            <h3>Use as Developer</h3>
            <p>View technical insights, code-level risks, and detailed AI security analysis</p>
          </div>
          <div className="role-card" onClick={() => onRoleSelect('ceo')}>
            <div className="role-icon"><FaBriefcase /></div>
            <h3>Use as CEO</h3>
            <p>View business impact, risk summary, and decision insights</p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── DeveloperDashboard ────────────────────────────────────────────────────── */

function DeveloperDashboard({ token, onLogout, onBack }) {
  const { user } = useUser(token);
  const { repos, loading: reposLoading, syncing, refetch } = useRepos(token);

  const [selectedRepo, setSelectedRepo]   = useState(null);
  const [filterText,   setFilterText]     = useState('');
  const [analysisStatus,  setAnalysisStatus]  = useState({});  // { repo_id: 'not_started'|'running'|'completed'|'failed' }
  const [analysisResults, setAnalysisResults] = useState({});  // { repo_id: resultObj }
  const [chatHistory,  setChatHistory]    = useState([]);
  const [chatInput,    setChatInput]      = useState('');
  const [chatLoading,  setChatLoading]    = useState(false);
  const chatEndRef = useRef(null);
  const authHeaders = { Authorization: `Bearer ${token}` };

  /* Poll running analyses every 5s */
  useEffect(() => {
    const runningIds = Object.entries(analysisStatus)
      .filter(([, s]) => s === 'running')
      .map(([id]) => id);
    if (!runningIds.length) return;

    const interval = setInterval(async () => {
      for (const rid of runningIds) {
        try {
          const r = await fetch(`${SYSTEM_URL}/api/analysis/status/${rid}`, { headers: authHeaders });
          const data = await r.json();
          if (data.status === 'completed') {
            setAnalysisStatus(prev => ({ ...prev, [rid]: 'completed' }));
            setAnalysisResults(prev => ({ ...prev, [rid]: data.results }));
          }
        } catch { /* ignore */ }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [analysisStatus, token]); // eslint-disable-line

  /* Auto-scroll chat */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  /* Select a repo from sidebar */
  const handleRepoSelect = async (repo) => {
    if (selectedRepo?.repo_id === repo.repo_id) return;
    setSelectedRepo(repo);
    setChatHistory([]);

    // Only check status if we haven't already
    if (!analysisStatus[repo.repo_id]) {
      try {
        const r = await fetch(`${SYSTEM_URL}/api/analysis/status/${repo.repo_id}`, { headers: authHeaders });
        const data = await r.json();
        if (data.status === 'completed') {
          setAnalysisStatus(prev => ({ ...prev, [repo.repo_id]: 'completed' }));
          setAnalysisResults(prev => ({ ...prev, [repo.repo_id]: data.results }));
        } else {
          setAnalysisStatus(prev => ({ ...prev, [repo.repo_id]: 'not_started' }));
        }
      } catch {
        setAnalysisStatus(prev => ({ ...prev, [repo.repo_id]: 'not_started' }));
      }
    }
  };

  /* Trigger 7-agent AI analysis */
  const runAnalysis = async (repo) => {
    const repoId = repo.repo_id;
    setAnalysisStatus(prev => ({ ...prev, [repoId]: 'running' }));
    try {
      const qs = repo.full_name ? `?full_name=${encodeURIComponent(repo.full_name)}` : '';
      const r = await fetch(`${SYSTEM_URL}/api/analysis/${repoId}${qs}`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (!r.ok) throw new Error('analysis-failed');
      const data = await r.json();
      setAnalysisStatus(prev => ({ ...prev, [repoId]: 'completed' }));
      setAnalysisResults(prev => ({ ...prev, [repoId]: data }));
    } catch {
      setAnalysisStatus(prev => ({ ...prev, [repoId]: 'failed' }));
    }
  };

  /* Send chat message to copilot */
  const sendChat = async () => {
    if (!chatInput.trim() || !selectedRepo || chatLoading) return;
    if (analysisStatus[selectedRepo.repo_id] !== 'completed') return;

    const question = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: question }]);
    setChatLoading(true);

    try {
      const r = await fetch(`${SYSTEM_URL}/api/analysis/copilot/${selectedRepo.repo_id}`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await r.json();
      const answer = data.answer || data.detail || 'No response from AI.';
      setChatHistory(prev => [...prev, { role: 'bot', text: answer }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'bot', text: '⚠️ Failed to reach BugSentry Copilot. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  /* Helpers */
  const filteredRepos = repos.filter(r =>
    r.full_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    r.name?.toLowerCase().includes(filterText.toLowerCase())
  );

  const statusDotClass = (repoId) => {
    const s = analysisStatus[repoId];
    if (s === 'completed')  return 'green';
    if (s === 'running')    return 'orange';
    if (s === 'failed')     return 'red';
    return 'gray';
  };

  const selectedStatus = selectedRepo ? analysisStatus[selectedRepo.repo_id] : null;
  const isAnalyzed = selectedStatus === 'completed';
  const isRunning  = selectedStatus === 'running';

  return (
    <div className="dev-dashboard-layout">
      <div className="bg-glow" />
      <div className="light-spot spot-1" />
      <div className="light-spot spot-2" />

      {/* ── Top Navbar ── */}
      <header className="dev-topbar">
        <div className="dev-topbar-left">
          <button className="icon-btn"><FiMenu /></button>
          <img src="/logo.png" alt="Bugsentry Logo" className="dev-logo" />
          <span className="dev-topbar-title">
            {selectedRepo ? selectedRepo.full_name : 'Dashboard'}
          </span>
        </div>

        <div className="dev-topbar-center">
          <div className="dev-search-bar">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Type / to search" />
          </div>
        </div>

        <div className="dev-topbar-right">
          <button className="icon-btn" onClick={onBack} title="Switch Role">
            <FaBriefcase style={{ fontSize: '14px' }} />
          </button>
          <button
            className="icon-btn"
            onClick={refetch}
            title="Sync repositories"
          >
            <FiRefreshCw className={syncing ? 'spin' : ''} />
          </button>
          <button className="icon-btn"><FiInbox /></button>
          {user?.picture
            ? <img src={user.picture} alt="avatar" className="dev-user-avatar-img" />
            : <div className="dev-user-avatar" />
          }
          <button onClick={onLogout} className="logout-btn-small">Sign Out</button>
        </div>
      </header>

      {/* ── Main Grid ── */}
      <div className="dev-main-grid">

        {/* ── Left Sidebar ── */}
        <aside className="dev-sidebar-left">
          <div className="dev-dropdown">
            {user?.picture
              ? <img src={user.picture} alt="avatar" className="dev-user-avatar-img small" />
              : <div className="dev-user-avatar small" />
            }
            <span>{user?.name || user?.email || '…'}</span>
            <span className="dropdown-arrow">▼</span>
          </div>

          <div className="dev-section-header">
            <h4>Your repositories</h4>
            {syncing && <span className="sync-label">Syncing…</span>}
          </div>

          <input
            type="text"
            className="dev-input-filter"
            placeholder="Find a repository…"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />

          <div className="expanded-sidebar-content">
            <ul className="dev-repo-list expanded">
              {reposLoading
                ? Array(6).fill(0).map((_, i) => <SkeletonRepo key={i} />)
                : filteredRepos.length === 0
                  ? <li className="no-repos-msg">
                      {repos.length === 0
                        ? 'Syncing your GitHub repos…'
                        : 'No repos match filter.'}
                    </li>
                  : filteredRepos.map(repo => (
                      <li
                        key={repo.repo_id}
                        className={`repo-list-item ${selectedRepo?.repo_id === repo.repo_id ? 'selected' : ''}`}
                        onClick={() => handleRepoSelect(repo)}
                      >
                        <span className={`status-dot ${statusDotClass(repo.repo_id)}`} />
                        <span className="repo-name" title={repo.full_name}>
                          {repo.full_name || repo.name}
                        </span>
                        <AnalysisBadge status={analysisStatus[repo.repo_id]} />
                      </li>
                    ))
              }
            </ul>

            <hr className="sidebar-divider" />

            <h4 className="sidebar-subhead">Quick Actions</h4>
            <ul className="sidebar-list">
              <li
                onClick={() => selectedRepo && runAnalysis(selectedRepo)}
                style={{ opacity: selectedRepo ? 1 : 0.4, cursor: selectedRepo ? 'pointer' : 'not-allowed' }}
                title={selectedRepo ? 'Run AI security scan' : 'Select a repo first'}
              >
                <FiCpu className="sidebar-icon" />
                <span>Run AI Scan</span>
              </li>
              <li><FiAlertCircle className="sidebar-icon" /><span>View Issues</span></li>
              <li><FaDocker className="sidebar-icon" /><span>Dockerfile Audit</span></li>
            </ul>

            <hr className="sidebar-divider" />

            <h4 className="sidebar-subhead">Repo count</h4>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '4px 0 0' }}>
              {repos.length} repositories loaded
            </p>
          </div>
        </aside>

        {/* ── Center Content ── */}
        <main className="dev-center-feed">

          {/* ── DEFAULT HOME (no repo selected) ── */}
          {!selectedRepo && (
            <>
              <h2 className="feed-title">Home</h2>

              {/* Disabled copilot box */}
              <div className="dev-ai-box chatbot-disabled">
                <textarea
                  placeholder="← Select a repository from the sidebar to start chatting with BugSentry Copilot"
                  disabled
                />
                <div className="ai-box-toolbar">
                  <div className="toolbar-left">
                    <button className="btn-outline" disabled><FiMessageSquare /> Ask ▼</button>
                    <button className="btn-outline" disabled><FiFileText /> All repositories ▼</button>
                  </div>
                  <div className="toolbar-right">
                    <span className="ai-model-selector">BugSentry Copilot</span>
                    <button className="btn-send" disabled><FiSend /></button>
                  </div>
                </div>
              </div>

              <RepositoryRiskChart />

              <div className="dev-feed-header">
                <h3>Feed &amp; Analytics</h3>
                <button className="btn-outline"><FiFilter /> Filter</button>
              </div>

              <RiskGraph />
            </>
          )}

          {/* ── REPO DETAIL VIEW (repo selected) ── */}
          {selectedRepo && (
            <>
              {/* Header */}
              <div className="repo-detail-header">
                <div>
                  <h2 className="feed-title" style={{ marginBottom: 6 }}>
                    <a
                      href={selectedRepo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#58A6FF', textDecoration: 'none' }}
                    >
                      {selectedRepo.full_name}
                    </a>
                  </h2>
                  <p className="repo-detail-desc">
                    {selectedRepo.description || 'No description provided.'}
                  </p>
                </div>
                <AnalysisBadge status={selectedStatus} />
              </div>

              {/* Repo Meta Row */}
              <div className="repo-meta-row">
                {selectedRepo.language && (
                  <span className="repo-meta-tag">
                    <span className="lang-dot" style={{ background: LANG_COLORS[selectedRepo.language] || '#888' }} />
                    {selectedRepo.language}
                  </span>
                )}
                {selectedRepo.stargazers_count > 0 && (
                  <span className="repo-meta-tag"><FiStar /> {selectedRepo.stargazers_count}</span>
                )}
                {selectedRepo.forks_count > 0 && (
                  <span className="repo-meta-tag"><FiGitBranch /> {selectedRepo.forks_count}</span>
                )}
                <span className="repo-meta-tag">
                  {selectedRepo.private ? '🔒 Private' : '🌐 Public'}
                </span>
              </div>

              {/* ── Analysis Trigger ── */}
              {(!selectedStatus || selectedStatus === 'not_started') && (
                <div className="scan-prompt-card">
                  <div className="scan-prompt-icon"><FiZap /></div>
                  <div className="scan-prompt-text">
                    <h3>Run AI Security Scan</h3>
                    <p>
                      Trigger the 7-agent AI pipeline to analyze this repository for vulnerabilities,
                      dependency risks, code quality, and DevOps issues.
                    </p>
                  </div>
                  <button className="btn-scan" onClick={() => runAnalysis(selectedRepo)}>
                    <FiCpu /> Run Analysis
                  </button>
                </div>
              )}

              {/* ── Scanning progress card ── */}
              {isRunning && (
                <div className="scan-running-card">
                  <div className="scan-spinner" />
                  <div>
                    <h3>Analysis In Progress</h3>
                    <p>7 AI agents are scanning your repository. This may take 30–90 seconds…</p>
                  </div>
                </div>
              )}

              {/* ── Failed card ── */}
              {selectedStatus === 'failed' && (
                <div className="scan-failed-card">
                  <FiAlertCircle size={24} color="#f85149" />
                  <div>
                    <h3>Analysis Failed</h3>
                    <p>Something went wrong during analysis. Please try again.</p>
                  </div>
                  <button className="btn-scan" onClick={() => runAnalysis(selectedRepo)}>
                    Retry
                  </button>
                </div>
              )}

              {/* ── Analysis Summary ── */}
              {isAnalyzed && analysisResults[selectedRepo.repo_id] && (
                <div className="analysis-summary-card">
                  <div className="analysis-summary-header">
                    <FiShield className="summary-icon" />
                    <h3>AI Analysis Summary</h3>
                  </div>
                  <p className="analysis-summary-text">
                    {analysisResults[selectedRepo.repo_id]?.ai_summary
                      || analysisResults[selectedRepo.repo_id]?.executive_summary
                      || JSON.stringify(analysisResults[selectedRepo.repo_id]).slice(0, 500) + '…'
                    }
                  </p>
                </div>
              )}

              {/* ── BugSentry Copilot Chat ── */}
              <div className={`copilot-section ${(!isAnalyzed && !isRunning) ? 'copilot-locked' : ''}`}>
                <div className="copilot-header">
                  <FiZap className="copilot-zap" />
                  <h3>BugSentry Copilot</h3>
                  {!isAnalyzed && (
                    <span className="copilot-lock-hint">
                      {isRunning ? 'Available after scan completes' : 'Run analysis first to enable chat'}
                    </span>
                  )}
                </div>

                {/* Chat History */}
                {chatHistory.length > 0 && (
                  <div className="chat-history">
                    {chatHistory.map((msg, i) => (
                      <ChatMessage key={i} msg={msg} />
                    ))}
                    {chatLoading && <TypingIndicator />}
                    <div ref={chatEndRef} />
                  </div>
                )}

                {/* Chat Input */}
                <div className={`dev-ai-box copilot-input-box ${!isAnalyzed ? 'chatbot-disabled' : ''}`}>
                  <textarea
                    placeholder={
                      isAnalyzed
                        ? `Ask about ${selectedRepo.name}… e.g. "What are the main security risks?"`
                        : isRunning
                          ? 'Waiting for scan to complete…'
                          : 'Run analysis first to enable BugSentry Copilot…'
                    }
                    disabled={!isAnalyzed || chatLoading}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChat();
                      }
                    }}
                    rows={3}
                  />
                  <div className="ai-box-toolbar">
                    <div className="toolbar-left">
                      <span className="ai-model-selector">
                        BugSentry Copilot • {selectedRepo.name}
                      </span>
                    </div>
                    <div className="toolbar-right">
                      {chatHistory.length > 0 && (
                        <button
                          className="btn-outline small"
                          onClick={() => setChatHistory([])}
                          title="Clear chat"
                        >
                          <FiX /> Clear
                        </button>
                      )}
                      <button
                        className="btn-send"
                        onClick={sendChat}
                        disabled={!isAnalyzed || chatLoading || !chatInput.trim()}
                        title="Send message (Enter)"
                      >
                        <FiSend />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── WorkspaceView (CEO) ───────────────────────────────────────────────────── */

function WorkspaceView({ role, onLogout, onBack }) {
  return (
    <main className="dashboard-wrapper">
      <div className="bg-glow" />
      <nav className="navbar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <img src="/logo.png" alt="Bugsentry Logo" className="logo" />
          <button
            className="auth-btn"
            onClick={onBack}
            style={{ height: '36px', padding: '0 16px', borderRadius: '8px', background: 'transparent', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            ← Switch Role
          </button>
        </div>
        <button
          onClick={onLogout}
          className="logout-btn"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', fontSize: '13px' }}
        >
          Sign Out
        </button>
      </nav>

      <div className="workspace-content animate-zoom-in">
        <div className="workspace-icon" style={{ color: '#9b51e0' }}>
          <FaBriefcase size={64} />
        </div>
        <h1 className="workspace-title">CEO Executive Dashboard</h1>
        <p className="workspace-subtitle">
          Aggregated organization risk posture, deployment velocity metrics, and compliance analytics.
        </p>
        <button className="hologram-btn">Initialize Workspace</button>
      </div>
    </main>
  );
}

/* ── App Root ──────────────────────────────────────────────────────────────── */

function App() {
  // Initialize token from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('bugsentry_token'));
  const [activeRole, setActiveRole] = useState(null);
  const { user } = useUser(token);

  // Capture ?token=<jwt> from URL after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('bugsentry_token', urlToken);
      setToken(urlToken);
      // Clean query string from URL without a page reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bugsentry_token');
    setToken(null);
    setActiveRole(null);
  };

  const isLoggedIn = !!token;

  return (
    <>
      {!isLoggedIn ? (
        <LoginView />
      ) : !activeRole ? (
        <RoleSelectionView
          onLogout={handleLogout}
          onRoleSelect={setActiveRole}
          user={user}
        />
      ) : activeRole === 'developer' ? (
        <DeveloperDashboard
          token={token}
          onLogout={handleLogout}
          onBack={() => setActiveRole(null)}
        />
      ) : (
        <WorkspaceView
          role={activeRole}
          onLogout={handleLogout}
          onBack={() => setActiveRole(null)}
        />
      )}
    </>
  );
}

export default App;
