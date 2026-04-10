import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBriefcase, FaUsers, FaProjectDiagram, FaServer, 
  FaShieldAlt, FaTrophy, FaExclamationTriangle, FaChartLine 
} from 'react-icons/fa';
import { 
  FiMessageSquare, FiSend, FiRefreshCw, FiZap, 
  FiChevronDown, FiStar, FiActivity, FiCpu, FiFilter, FiSettings, FiAlertCircle 
} from 'react-icons/fi';
import { useUser } from '../hooks/useUser';
import { useRepos } from '../hooks/useRepos';
import { ChatMessage, TypingIndicator } from '../components/ChatComponents';
import { GitHubContributionChart } from '../components/Charts';
import { SYSTEM_URL } from '../utils/constants';

// ---- DUMMY DATA GENERATION ---- //
const generatePersonnelStats = () => [
  { id: 1, name: 'Alex Johnson', role: 'Full Stack Engineer', score: 96, status: 'Excellent', tasks: 140, commitTrend: [12, 15, 8, 19, 21, 14, 25] },
  { id: 2, name: 'Sarah Lee', role: 'DevOps Specialist', score: 88, status: 'Great', tasks: 75, commitTrend: [5, 4, 9, 7, 8, 12, 10] },
  { id: 3, name: 'Dave Patel', role: 'Frontend Architect', score: 65, status: 'At Risk', tasks: 52, commitTrend: [10, 8, 5, 4, 3, 2, 1] },
  { id: 4, name: 'Emma Wilson', role: 'Security Analyst', score: 92, status: 'Excellent', tasks: 88, commitTrend: [6, 7, 8, 6, 9, 11, 13] },
];

const generateOrgRiskData = () => [
  { day: 'Mon', risk: 400 },
  { day: 'Tue', risk: 380 },
  { day: 'Wed', risk: 450 },
  { day: 'Thu', risk: 320 },
  { day: 'Fri', risk: 850 },
  { day: 'Sat', risk: 700 },
  { day: 'Sun', risk: 1300 },
];

// ---- COMPONENTS ---- //
const ArchNode = ({ title, icon, active, type, status }) => (
  <div className={`arch-node-detailed ${type} ${active ? 'active' : ''}`}>
    <div className="arch-node-status-dot" style={{ backgroundColor: status === 'healthy' ? '#238636' : '#d29922' }} />
    <div className="arch-node-icon">{icon}</div>
    <div className="arch-node-info">
      <span className="arch-node-title">{title}</span>
      <span className="arch-node-subtitle">{type.toUpperCase()}</span>
    </div>
    {active && <div className="arch-node-glow" />}
  </div>
);

export function CEODashboard({ token, onLogout, onBack }) {
  const { user } = useUser(token);
  const { repos, loading: reposLoading, syncing, refetch } = useRepos(token);
  
  const [activeView, setActiveView] = useState('overview'); // overview, risk, personnel, architecture
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: 'Good evening, Executive. I am the BugSentry Strategic Assistant. How can I help you navigate organizational performance today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const personnel = generatePersonnelStats();
  const riskData = generateOrgRiskData();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    setChatLoading(true);

    // Mock Strategic Response
    setTimeout(() => {
      let response = "I've analyzed the organizational data. ";
      if (q.toLowerCase().includes('personnel') || q.toLowerCase().includes('who')) {
        response += `Alex Johnson is currently leading with a 96% quality score. However, Dave Patel has shown a declining commit trend over the last 4 days.`;
      } else if (q.toLowerCase().includes('risk')) {
        response += "The overall risk posture has moved to 1300 units this Sunday, primarily driven by new merges in the 'Sanjeevani' service cluster.";
      } else {
        response += "The system is operating within normal executive parameters. I recommend reviewing the System Architecture topology for the latest service health.";
      }
      setChatHistory(prev => [...prev, { role: 'bot', text: response }]);
      setChatLoading(false);
    }, 1200);
  };

  return (
    <div className="dev-dashboard-layout ceo-version">
      <div className="bg-glow" />
      <div className="light-spot spot-1" style={{ background: 'rgba(88, 166, 255, 0.05)' }} />
      <div className="light-spot spot-2" style={{ background: 'rgba(139, 92, 246, 0.05)' }} />

      {/* TOPBAR */}
      <header className="dev-topbar">
        <div className="dev-topbar-left">
          <img src="/logo.png" alt="Bugsentry Logo" className="dev-logo" onClick={() => setActiveView('overview')} style={{ cursor: 'pointer' }} />
          <span className="dev-topbar-title" style={{ marginLeft: '12px', color: 'rgba(255,255,255,0.4)' }}>/</span>
          <span className="dev-topbar-title">Organization</span>
        </div>

        <div className="dev-topbar-right">
          <button className="dev-topbar-title-btn" onClick={() => setActiveView('overview')}>
            Executive Command Center
          </button>
          
          <button className="icon-btn" onClick={refetch} title="Sync organization data">
            <FiRefreshCw className={syncing ? 'spin' : ''} />
          </button>
          
          <div className="ceo-user-badge">
             <div className="ceo-user-details">
                <span className="ceo-user-name">{user?.name || 'Lead Executive'}</span>
                <span className="ceo-user-role">Strategic Control</span>
             </div>
             {user?.picture ? <img src={user.picture} alt="avatar" className="dev-user-avatar-img" /> : <div className="dev-user-avatar" />}
          </div>
          <button className="logout-btn-small" onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      <div className="dev-main-grid">
        {/* SIDEBAR */}
        <aside className="dev-sidebar-left">
          <div className="sidebar-nav-block">
            <h4 className="sidebar-subhead">Strategic Dimensions</h4>
            <ul className="sidebar-list">
              <li className={activeView === 'overview' ? 'active' : ''} onClick={() => setActiveView('overview')}>
                <FiActivity className="sidebar-icon" /><span>Organization Overview</span>
              </li>
              <li className={activeView === 'risk' ? 'active' : ''} onClick={() => setActiveView('risk')}>
                <FaChartLine className="sidebar-icon" /><span>Real-time Risk Analytics</span>
              </li>
              <li className={activeView === 'personnel' ? 'active' : ''} onClick={() => setActiveView('personnel')}>
                <FaUsers className="sidebar-icon" /><span>Personnel Performance</span>
              </li>
              <li className={activeView === 'architecture' ? 'active' : ''} onClick={() => setActiveView('architecture')}>
                <FaProjectDiagram className="sidebar-icon" /><span>System Architecture</span>
              </li>
            </ul>
            <hr className="sidebar-divider" />
          </div>

          <div className="sidebar-org-stats">
            <h4 className="sidebar-subhead">Key Performance Indicators</h4>
            <div className="sidebar-stat-mini">
              <span>Risk Posture</span>
              <span className="val" style={{ color: '#d29922' }}>A- Stable</span>
            </div>
            <div className="sidebar-stat-mini">
              <span>Managed Nodes</span>
              <span className="val">1,204</span>
            </div>
            <div className="sidebar-stat-mini">
              <span>AI Agent Velocity</span>
              <span className="val" style={{ color: '#238636' }}>+12%</span>
            </div>
          </div>

          <hr className="sidebar-divider" />
          <ul className="sidebar-list">
            <li><FiSettings className="sidebar-icon" /><span>Admin Settings</span></li>
          </ul>
        </aside>

        {/* CENTER FEED */}
        <main className="dev-center-feed">
          <h2 className="feed-title">{activeView.charAt(0).toUpperCase() + activeView.slice(1)} Feed</h2>

          {/* COPILOT BOX - ALWAYS AT TOP */}
          <div className="dev-ai-box ceo-copilot-central">
            <div className="copilot-header-mini">
               <FiZap style={{ color: '#58A6FF' }} />
               <span>BugSentry Strategic Copilot</span>
            </div>
            <textarea 
              placeholder="Ask for an executive summary, personnel audit, or risk mitigation strategy..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendChat();
                }
              }}
              rows={2}
            />
            <div className="ai-box-toolbar">
              <div className="toolbar-left">
                <button className="btn-outline small"><FiFilter /> Insights</button>
              </div>
              <div className="toolbar-right">
                <button className="btn-send" onClick={sendChat} disabled={chatLoading || !chatInput.trim()}><FiSend /></button>
              </div>
            </div>
          </div>

          {/* CHAT HISTORY IF ACTIVE */}
          {chatHistory.length > 1 && (
            <div className="ceo-floating-chat">
               {chatHistory.slice(-2).map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            </div>
          )}

          {/* DYNAMIC CONTENT BELOW */}
          <div className="ceo-dynamic-content animate-fade-in">
            {activeView === 'overview' && (
              <>
                <div className="ceo-grid-4">
                  <div className="ceo-stat-card-detailed">
                    <FaProjectDiagram className="card-icon" color="#58A6FF" />
                    <div className="card-info">
                      <h3>{repos.length || 0}</h3>
                      <p>Repositories Under Management</p>
                    </div>
                  </div>
                  <div className="ceo-stat-card-detailed">
                    <FaUsers className="card-icon" color="#2ea043" />
                    <div className="card-info">
                      <h3>12</h3>
                      <p>Total Engineers In-Play</p>
                    </div>
                  </div>
                  <div className="ceo-stat-card-detailed">
                    <FiCpu className="card-icon" color="#9b51e0" />
                    <div className="card-info">
                      <h3>7</h3>
                      <p>Active AI Agents</p>
                    </div>
                  </div>
                  <div className="ceo-stat-card-detailed">
                    <FiAlertCircle className="card-icon" color="#f85149" />
                    <div className="card-info">
                      <h3>3</h3>
                      <p>Critical Vulnerabilities</p>
                    </div>
                  </div>
                </div>

                <div className="ceo-panel">
                  <div className="panel-header">
                     <h3>Organizational Risk Overview</h3>
                     <span>Live Data Stream</span>
                  </div>
                  <div className="risk-graph-container">
                    <div className="risk-bars">
                      {riskData.map((d, i) => (
                        <div key={i} className="risk-bar-group">
                          <div className="risk-bar" style={{ height: `${(d.risk / 1500) * 100}%`, background: d.risk > 1000 ? '#f85149' : '#58A6FF' }} />
                          <span className="risk-label">{d.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <GitHubContributionChart username={user?.login || user?.github_username || user?.name} />
              </>
            )}

            {activeView === 'risk' && (
              <div className="ceo-panel">
                 <div className="panel-header">
                    <h3>Deep Risk Analytics</h3>
                    <button className="btn-outline small">Export PDF</button>
                 </div>
                 <div className="detailed-risk-list">
                    {repos.slice(0, 5).map(repo => (
                      <div key={repo.repo_id} className="risk-item-row">
                        <div className="risk-repo-info">
                          <strong>{repo.name}</strong>
                          <span>Last scanned: Today</span>
                        </div>
                        <div className="risk-meter">
                          <div className="meter-fill" style={{ width: '70%', background: '#d29922' }} />
                        </div>
                        <div className="risk-indicator">MEDIUM</div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeView === 'personnel' && (
              <div className="personnel-grid">
                {personnel.map(p => (
                  <div key={p.id} className="personnel-card">
                    <div className="p-header">
                      <div className="p-avatar">
                        {p.name.charAt(0)}
                      </div>
                      <div className="p-names">
                        <h4>{p.name}</h4>
                        <span>{p.role}</span>
                      </div>
                      <div className="p-score" style={{ color: p.score > 90 ? '#238636' : p.score > 70 ? '#d29922' : '#f85149' }}>
                        {p.score}%
                      </div>
                    </div>
                    <div className="p-stats">
                      <div className="p-stat"><span>Tasks</span><strong>{p.tasks}</strong></div>
                      <div className="p-stat"><span>Status</span><strong>{p.status}</strong></div>
                    </div>
                    <div className="p-trend">
                       <div className="trend-dots">
                         {p.commitTrend.map((v, i) => <div key={i} className="trend-dot" style={{ height: v, background: p.score > 70 ? '#58A6FF' : '#f85149' }} />)}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'architecture' && (
              <div className="architecture-viewport">
                 <div className="arch-header">
                    <h3>System Topology</h3>
                    <p>Visualizing interconnects between frontend, gateway, and AI agents.</p>
                 </div>
                 <div className="arch-canvas-detailed">
                    <div className="arch-row">
                       <ArchNode title="Client Console" icon={<FaBriefcase />} type="frontend" status="healthy" active />
                    </div>
                    <div className="arch-connector-v">|</div>
                    <div className="arch-row">
                       <ArchNode title="BugSentry API" icon={<FaServer />} type="gateway" status="healthy" active />
                    </div>
                    <div className="arch-cluster-horizontal">
                       <div className="connector-h-arm left" />
                       <div className="connector-h-arm right" />
                    </div>
                    <div className="arch-row spread">
                       <ArchNode title="Auth Guard" icon={<FaShieldAlt />} type="service" status="healthy" />
                       <ArchNode title="Agent 7 Engine" icon={<FiCpu />} type="core" status="healthy" active />
                       <ArchNode title="Vector Stream" icon={<FaServer />} type="database" status="warning" />
                    </div>
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
