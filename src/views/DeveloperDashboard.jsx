import React, { useState, useEffect, useRef } from 'react';
import { FaBriefcase, FaDocker, FaCode, FaShieldAlt, FaBug, FaLightbulb } from 'react-icons/fa';
import {
  FiMessageSquare, FiRefreshCw, FiZap, FiHome,
  FiFilter, FiStar, FiGitBranch, FiAlertCircle, FiShield, FiX, FiSend, FiChevronDown, FiChevronUp, FiCpu,
  FiCreditCard, FiUsers, FiKey, FiBook, FiPlus, FiGitPullRequest
} from 'react-icons/fi';
import { useUser } from '../hooks/useUser';
import { useRepos } from '../hooks/useRepos';
import { AnalysisBadge } from '../components/AnalysisBadge';
import { RiskGraph, RepositoryRiskChart, ContributionGraph } from '../components/Charts';
import { ChatMessage, TypingIndicator } from '../components/ChatComponents';
import { SkeletonRepo } from '../components/Skeletons';
import { SYSTEM_URL, LANG_COLORS } from '../utils/constants';

function extractBullets(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-') || line.startsWith('*'))
    .map((line) => line.replace(/^[-*]\s*/, ''))
    .slice(0, 5);
}

function buildFallbackInsights(currentResult) {
  const outputs = currentResult?.agent_outputs || {};
  return {
    architecture_summary: outputs.analyzer?.slice(0, 320) || 'Architecture insights will appear after analysis.',
    directory_hotspots: [],
    probable_failures: extractBullets(outputs.prediction).map((item, index) => ({
      area: `Potential Area ${index + 1}`,
      bug_type: item,
      eta_days: 7 + index * 3,
      impact: 'Medium',
      confidence: 'Medium',
    })),
    fix_plan: extractBullets(outputs.fix).map((item, index) => ({
      title: `Fix Step ${index + 1}`,
      action: item,
      owner: 'Developer',
      priority: index === 0 ? 'High' : 'Medium',
    })),
    final_guidance: outputs.docs?.slice(0, 280) || 'Use Assistant to ask for file-level remediation.',
  };
}

function buildTreeRows(repoStructure) {
  const dirs = Array.isArray(repoStructure?.directories) ? repoStructure.directories : [];
  const files = Array.isArray(repoStructure?.files_sample) ? repoStructure.files_sample : [];
  const seen = new Set();
  const rows = [];

  dirs.forEach((path) => {
    if (!path || seen.has(`d:${path}`)) return;
    seen.add(`d:${path}`);
    rows.push({ type: 'dir', path, depth: path.split('/').length - 1 });
  });

  files.slice(0, 40).forEach((path) => {
    if (!path || seen.has(`f:${path}`)) return;
    seen.add(`f:${path}`);
    rows.push({ type: 'file', path, depth: path.split('/').length - 1 });
  });

  rows.sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.path.localeCompare(b.path);
  });

  return rows.slice(0, 55);
}

function getCopilotWelcome(repo) {
  if (!repo) {
    return [
      'BugSentry Assistant is ready.',
      '',
      '- Select a repository from the left panel to unlock deep, file-level AI responses.',
      '- You can still ask general bug-risk and remediation questions right now.',
      '- Try: "How should I start a secure scan for my Node project?"',
    ].join('\n');
  }

  return [
    `Connected to ${repo.full_name || repo.name}.`,
    '',
    '- Ask for risks, likely failure points, or patch-ready fixes.',
    '- While scan is running, I can still provide guidance from your question context.',
    '- Tip: press Enter to send and Shift+Enter for a new line.',
  ].join('\n');
}

function getAssistantActionPrompts(repoName) {
  const target = repoName || 'all repositories';
  return [
    { label: 'Agent', prompt: `Act as a principal security engineer and review ${target} with ranked risk priorities.` },
    { label: 'Create Issue', prompt: `Create issue-ready bug reports with title, severity, impacted files, and acceptance criteria for ${target}.` },
    { label: 'Write Code', prompt: `Provide patch-ready code suggestions for the highest-risk findings in ${target}.` },
    { label: 'Git', prompt: `Generate git commit messages and branch strategy for fixes in ${target}.` },
    { label: 'Pull Requests', prompt: `Draft pull request summaries with risks fixed, tests added, and rollout notes for ${target}.` },
  ];
}

function formatAssistantReport(answer, question, selectedRepo) {
  const text = (answer || '').trim();
  if (!text) return 'No response from analysis engine.';

  // If the AI is trying to provide a structured card, we keep it as is
  if (text.includes('[PR_CARD]') || text.includes('[ISSUE_CARD]')) return text;

  const isStructured = /(^|\n)(-|\d+\.)\s+/m.test(text) || text.length > 250;
  if (isStructured) return text;

  const repoLabel = selectedRepo?.name || 'Selected context';
  return `### Analysis for ${repoLabel}\n\n${text}\n\n---\n*Context: ${question}*`;
}

function buildLocalCopilotReply({ question, selectedRepo, isRunning, isAnalyzed }) {
  const q = (question || '').toLowerCase();

  if (!selectedRepo) {
    return [
      'Security guidance before repository selection:',
      '',
      'Greetings. To provide specific remediation for your codebase, please select a repository from the sidebar.',
      '',
      'How can I assist your security workflow today?',
    ].join('\n');
  }

  if (isRunning) {
    return [
      `Analysis in progress for **${selectedRepo.name}**.`,
      '',
      'I am currently processing your repository through our 7 AI security agents. I will be ready to discuss specific findings in approximately 30-60 seconds.',
    ].join('\n');
  }

  if (!isAnalyzed) {
    return [
      `Analysis has not completed yet for ${selectedRepo?.name}.`,
      '',
      '- Click "Run 7 Agents" to generate file-level findings.',
      '- After completion, ask for patch-ready remediations by file path.',
      '- I can still provide a generic remediation checklist right now if you want.',
    ].join('\n');
  }

  if (q.includes('bug') || q.includes('finding') || q.includes('flaw') || q.includes('vulnerability')) {
    return [
      '[BUG_LIST]',
      `- Potential SQL injection vulnerability in database connection strings`,
      `- Missing input validation in user registration flow`,
      `- Weak cryptographic algorithm used for session tokens`,
      `- Unprotected API endpoint exposing sensitive metadata`,
      `- Insecure direct object reference (IDOR) in profile viewing`,
      '[/BUG_LIST]'
    ].join('\n');
  }

  if (q.includes('risk')) {
    return [
      `Risk-focused prompt received for ${selectedRepo?.name}.`,
      '',
      'I have detected several architectural risks. Here is what we should focus on:',
      '- High cyclomatic complexity in the core validation engine',
      '- Outdated dependencies with known CVEs (2 critical, 5 high)',
      '- Lack of centralized logging for security-critical events',
      '',
      'Ask for "Top risky files" to see specific locations.',
    ].join('\n');
  }

  if (q.includes('fix') || q.includes('patch') || q.includes('remediation')) {
    return [
      '[PR_CARD]',
      `Title: Security Hardening Plan for ${selectedRepo.name}`,
      `- Implement parameterized queries to prevent SQL injection`,
      `- Upgrade React and associated libs to latest stable versions`,
      `- Integrate BugSentry middleware for automated request sanitization`,
      '[/PR_CARD]'
    ].join('\n');
  }

  return [
    'I can help with that.',
    '',
    '- Ask for risk ranking, fix plan, test strategy, or production hardening.',
    '- For best output, mention a file path, module name, or endpoint.',
  ].join('\n');
}

export function DeveloperDashboard({ token, onLogout, onBack }) {
  const AUTO_RUN_ON_REPO_SELECT = true;
  const { user } = useUser(token);
  const { repos, loading: reposLoading, syncing, refetch } = useRepos(token);

  const [selectedRepo, setSelectedRepo] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState({});
  const [analysisResults, setAnalysisResults] = useState({});
  const [repoChats, setRepoChats] = useState({}); // { [repoId]: messages[] }
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showAllRepos, setShowAllRepos] = useState(false);
  const [isChatMaximized, setIsChatMaximized] = useState(false);
  const [activeSolution, setActiveSolution] = useState(null);

  // Computed current chat history
  const chatHistory = selectedRepo ? (repoChats[selectedRepo.repo_id] || []) : (repoChats['home'] || []);

  const chatHistoryRef = useRef(null);
  const authHeaders = { Authorization: `Bearer ${token}` };
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            setAnalysisStatus((prev) => ({ ...prev, [rid]: 'completed' }));
            setAnalysisResults((prev) => ({ ...prev, [rid]: data.results || data }));
          } else if (data.status === 'failed') {
            setAnalysisStatus((prev) => ({ ...prev, [rid]: 'failed' }));
          }
        } catch {
          // ignore polling errors
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [analysisStatus, token]); // eslint-disable-line

  useEffect(() => {
    // Keep auto-scroll constrained inside chat panel so full page layout does not jump.
    if (chatHistory.length > 1 || chatLoading) {
      const historyEl = chatHistoryRef.current;
      if (historyEl) {
        historyEl.scrollTop = historyEl.scrollHeight;
      }
    }
  }, [chatHistory, chatLoading]);

  const runAnalysis = async (repo, force = false) => {
    const repoId = repo.repo_id;
    if (!force && (analysisStatus[repoId] === 'running' || analysisStatus[repoId] === 'completed')) return;

    setAnalysisStatus((prev) => ({ ...prev, [repoId]: 'running' }));
    try {
      const qs = repo.full_name ? `?full_name=${encodeURIComponent(repo.full_name)}` : '';
      const r = await fetch(`${SYSTEM_URL}/api/analysis/${repoId}${qs}`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (!r.ok) throw new Error('analysis-failed');
      const data = await r.json();
      setAnalysisStatus((prev) => ({ ...prev, [repoId]: 'completed' }));
      setAnalysisResults((prev) => ({ ...prev, [repoId]: data.results || data }));
    } catch {
      setAnalysisStatus((prev) => ({ ...prev, [repoId]: 'failed' }));
    }
  };

  const handleRepoSelect = async (repo) => {
    setSelectedRepo(repo);
    // Implicit switch via chatHistory computed ref.

    let currentStatus = null;
    if (!analysisStatus[repo.repo_id]) {
      try {
        const r = await fetch(`${SYSTEM_URL}/api/analysis/status/${repo.repo_id}`, { headers: authHeaders });
        const data = await r.json();
        if (data.status === 'completed') {
          setAnalysisStatus((prev) => ({ ...prev, [repo.repo_id]: 'completed' }));
          setAnalysisResults((prev) => ({ ...prev, [repo.repo_id]: data.results || data }));
          currentStatus = 'completed';
        } else if (data.status === 'running') {
          setAnalysisStatus((prev) => ({ ...prev, [repo.repo_id]: 'running' }));
          currentStatus = 'running';
        } else {
          setAnalysisStatus((prev) => ({ ...prev, [repo.repo_id]: 'not_started' }));
          currentStatus = 'not_started';
        }
      } catch {
        setAnalysisStatus((prev) => ({ ...prev, [repo.repo_id]: 'not_started' }));
        currentStatus = 'not_started';
      }
    } else {
      currentStatus = analysisStatus[repo.repo_id];
    }

    if (AUTO_RUN_ON_REPO_SELECT && currentStatus === 'not_started') {
      runAnalysis(repo);
    }
  };

  const sendChat = async (presetQuestion = null) => {
    const targetKey = selectedRepo ? selectedRepo.repo_id : 'home';
    const currentHist = repoChats[targetKey] || [];
    const question = (typeof presetQuestion === 'string' ? presetQuestion : chatInput).trim();
    if (!question || chatLoading) return;
    if (!presetQuestion) setChatInput('');

    const userMsg = { role: 'user', text: question };
    const historyWithUser = [...currentHist, userMsg];
    setRepoChats(prev => ({ ...prev, [targetKey]: historyWithUser }));
    setChatLoading(true);

    try {
      const repoStatus = selectedRepo ? analysisStatus[selectedRepo.repo_id] : null;
      const isAnalyzedNow = repoStatus === 'completed';
      const isRunningNow = repoStatus === 'running';

      if (!selectedRepo || !isAnalyzedNow) {
        await new Promise((resolve) => setTimeout(resolve, 550));
        const fallbackAnswer = buildLocalCopilotReply({
          question,
          selectedRepo,
          isRunning: isRunningNow,
          isAnalyzed: isAnalyzedNow,
        });
        setRepoChats(prev => ({ ...prev, [targetKey]: [...historyWithUser, { role: 'bot', text: fallbackAnswer }] }));
        return;
      }

      const r = await fetch(`${SYSTEM_URL}/api/analysis/copilot/${selectedRepo.repo_id}`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: currentHist }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.detail || `Assistant failed with status ${r.status}`);

      const answer = formatAssistantReport(data.answer || 'No response from AI.', question, selectedRepo);
      setRepoChats(prev => ({ ...prev, [targetKey]: [...historyWithUser, { role: 'bot', text: answer }] }));
    } catch (err) {
      const message = err?.message || 'Failed to reach BugSentry Assistant.';
      setRepoChats(prev => ({ ...prev, [targetKey]: [...historyWithUser, { role: 'bot', text: `Warning: ${message}` }] }));
    } finally {
      setChatLoading(false);
    }
  };

  const filteredRepos = repos.filter((r) =>
    r.full_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    r.name?.toLowerCase().includes(filterText.toLowerCase())
  );

  const displayedRepos = showAllRepos ? filteredRepos : filteredRepos.slice(0, 6);

  const statusDotClass = (repoId) => {
    const s = analysisStatus[repoId];
    if (s === 'completed') return 'green';
    if (s === 'running') return 'orange';
    if (s === 'failed') return 'red';
    return 'gray';
  };

  const selectedStatus = selectedRepo ? analysisStatus[selectedRepo.repo_id] : null;
  const isAnalyzed = selectedStatus === 'completed';
  const isRunning = selectedStatus === 'running';
  const hasLiveCopilot = Boolean(selectedRepo && isAnalyzed);
  const currentResult = selectedRepo ? analysisResults[selectedRepo.repo_id] : null;
  const assistantActionPrompts = getAssistantActionPrompts(selectedRepo?.name);
  const insight = currentResult?.structured_insights || buildFallbackInsights(currentResult);
  const deepReport = currentResult?.deep_scan_report || {};
  const repoStructure = currentResult?.repo_context?.repo_structure || {};
  const treeRows = buildTreeRows(repoStructure);
  const deepDirectoryHotspots = (deepReport.directory_risk_summary || []).map((d) => ({
    path: d.path,
    risk_reason: d.risk_reason,
    severity: d.severity,
  }));
  const directoryHotspots = (deepDirectoryHotspots.length ? deepDirectoryHotspots : (insight.directory_hotspots || [])).slice(0, 6);
  const probableFailures = ((deepReport.future_bug_predictions && deepReport.future_bug_predictions.length > 0)
    ? deepReport.future_bug_predictions
    : (insight.probable_failures || [])).slice(0, 5);
  const fixPlan = (insight.fix_plan || []).slice(0, 5);
  const topRiskyFiles = (deepReport.top_risky_files || []).slice(0, 8);
  const repoBriefPoints = [
    `Repository: ${selectedRepo?.full_name || selectedRepo?.name || 'N/A'}`,
    `Scope: ${repoStructure.total_files || 0} files across ${repoStructure.total_directories || 0} directories`,
    `Risk Signals: ${topRiskyFiles.length || 0} risky files detected in latest scan`,
    `Summary: ${(insight.architecture_summary || 'Architecture details are being generated.').slice(0, 140)}`,
    `Guidance: ${(insight.final_guidance || 'Use Assistant for patch-ready remediation by file path.').slice(0, 120)}`,
  ];

  return (
    <div className="dev-dashboard-layout">
      <div className="bg-glow" />
      <div className="light-spot spot-1" />
      <div className="light-spot spot-2" />

      <header className="dev-topbar">
        <div className="dev-topbar-left">
          <img src="/logo.png" alt="Bugsentry Logo" className="dev-logo" onClick={() => setSelectedRepo(null)} style={{ cursor: 'pointer' }} />
          {selectedRepo && <span className="dev-topbar-title" style={{ marginLeft: '12px', color: 'rgba(255,255,255,0.4)' }}>/</span>}
          {selectedRepo && <span className="dev-topbar-title">{selectedRepo.full_name}</span>}
        </div>

        <div className="dev-topbar-right">
          <button className="icon-btn" onClick={refetch} title="Sync repositories">
            <FiRefreshCw className={syncing ? 'spin' : ''} />
          </button>

          <div className="user-menu-wrapper" ref={userMenuRef}>
            <button type="button" className="profile-trigger" onClick={() => setShowUserMenu((prev) => !prev)}>
              {user?.picture ? (
                <img src={user.picture} alt="avatar" className="dev-user-avatar-img" />
              ) : (
                <div className="dev-user-avatar" />
              )}
              <FiChevronDown style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }} />
            </button>

            {showUserMenu && (
              <div className="profile-menu-dropdown">
                <div className="menu-header" style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Signed in as</span>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user?.name || user?.email}>
                    {user?.name || user?.email || 'Developer'}
                  </strong>
                </div>
                <div className="menu-list" style={{ padding: '8px' }}>
                  <button className="menu-item"><FiMessageSquare size={14} /> Profile</button>
                  <button className="menu-item"><FiStar size={14} /> Settings</button>
                  <button className="menu-item"><FiCreditCard size={14} /> Billing</button>
                  <button className="menu-item"><FiUsers size={14} /> Team Access</button>
                  <button className="menu-item"><FiKey size={14} /> API Keys</button>
                  <div className="menu-divider" />
                  <button className="menu-item logout" onClick={onLogout}>
                    <FiSend size={14} style={{ transform: 'rotate(180deg)' }} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dev-main-grid">
        <aside className="dev-sidebar-left">
          <div className="sidebar-nav-block">
            <ul className="sidebar-list">
              <li onClick={() => setSelectedRepo(null)} className={!selectedRepo ? 'active' : ''}>
                <FiHome className="sidebar-icon" /><span>Home</span>
              </li>
              <li onClick={() => document.getElementById('risk-findings')?.scrollIntoView({ behavior: 'smooth' })}>
                <FaBug className="sidebar-icon" /><span>Risk Findings</span>
              </li>
              <li onClick={() => document.getElementById('copilot-section')?.scrollIntoView({ behavior: 'smooth' })}>
                <FiZap className="sidebar-icon" /><span>Assistant</span>
              </li>
            </ul>
          </div>

          <input
            type="text"
            className="dev-input-filter"
            placeholder="Find a repository..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ marginTop: '16px' }}
          />

          <div className="expanded-sidebar-content">
            <ul className="dev-repo-list expanded">
              {reposLoading
                ? Array(6).fill(0).map((_, i) => <SkeletonRepo key={i} />)
                : displayedRepos.length === 0
                  ? <li className="no-repos-msg">{repos.length === 0 ? 'Syncing your GitHub repos...' : 'No repos match filter.'}</li>
                  : displayedRepos.map((repo) => (
                    <li
                      key={repo.repo_id}
                      className={`repo-list-item ${selectedRepo?.repo_id === repo.repo_id ? 'selected' : ''}`}
                      onClick={() => handleRepoSelect(repo)}
                    >
                      <span className={`status-dot ${statusDotClass(repo.repo_id)}`} />
                      <span className="repo-name" title={repo.full_name}>{repo.full_name || repo.name}</span>
                      <AnalysisBadge status={analysisStatus[repo.repo_id]} />
                    </li>
                  ))}
            </ul>

            {filteredRepos.length > 6 && (
              <button className="btn-see-more" onClick={() => setShowAllRepos(!showAllRepos)}>
                {showAllRepos ? <><FiChevronUp /> See Less</> : <><FiChevronDown /> See More ({filteredRepos.length - 6} more)</>}
              </button>
            )}

            <hr className="sidebar-divider" />

            <h4 className="sidebar-subhead">Quick Actions</h4>
            <ul className="sidebar-list">
              <li
                onClick={() => selectedRepo && runAnalysis(selectedRepo)}
                className={!selectedRepo || isRunning ? 'disabled' : ''}
                title={selectedRepo ? 'Run AI security scan' : 'Select a repo first'}
              >
                <FiCpu className="sidebar-icon" />
                <span>Run AI Scan</span>
              </li>
              <li onClick={() => document.getElementById('risk-findings')?.scrollIntoView({ behavior: 'smooth' })}>
                <FiAlertCircle className="sidebar-icon" /><span>View Issues</span>
              </li>
              <li onClick={() => alert('Dockerfile detailed audit feature is being synchronized. Please run a full scan first.')}>
                <FaDocker className="sidebar-icon" /><span>Dockerfile Audit</span>
              </li>
            </ul>

            <hr className="sidebar-divider" />
            <h4 className="sidebar-subhead">Repo count</h4>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '4px 0 0' }}>{repos.length} repositories loaded</p>
          </div>
        </aside>

        <main className="dev-center-feed">
          {!selectedRepo && (
            <>

              <div className="copilot-section integrated" id="copilot-section" style={{ marginTop: '0', marginBottom: '48px' }}>
                <div className="copilot-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* <FiZap className="copilot-zap" style={{ color: '#58a6ff' }} /> */}
                  {/* <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>BugSentry Assistant</h3> */}
                </div>

                {chatHistory.length > 0 && (
                  <div className="chat-history" ref={chatHistoryRef}>
                    {chatHistory.map((msg, i) => (
                      <ChatMessage
                        key={i}
                        msg={msg}
                        onViewSolution={(data) => setActiveSolution(data)}
                      />
                    ))}
                    {chatLoading && <TypingIndicator />}
                  </div>
                )}

                <div className="dev-ai-box copilot-input-box assistant-composer">
                  <textarea
                    placeholder="Ask anything or type @ to add context"
                    disabled={chatLoading}
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
                  <div className="assistant-composer-row">
                    <div className="assistant-context-controls" />
                    <div className="assistant-send-controls">
                      <span className="assistant-model-pill">BugSentry Core <FiChevronDown /></span>
                      <button className="btn-send" onClick={() => sendChat()} disabled={chatLoading || !chatInput.trim()} title="Send message (Enter)">
                        <FiSend />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="assistant-action-row">
                  {assistantActionPrompts.map((ap) => (
                    <button key={ap.label} className="assistant-action-btn" onClick={() => sendChat(ap.prompt)}>
                      {ap.label === 'Agent' && <FiCpu />}
                      {ap.label === 'Create Issue' && <FiAlertCircle />}
                      {ap.label === 'Write Code' && <FaCode />}
                      {ap.label === 'Git' && <FiGitBranch />}
                      {ap.label === 'Pull Requests' && <FiGitPullRequest />}
                      {ap.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="home-analytics-row">
                <RepositoryRiskChart data={repos.length > 0 ? repos.slice(0, 7).map((r, i) => ({
                  name: r.name.slice(0, 3).toUpperCase(),
                  risk: 400 + (analysisStatus[r.repo_id] === 'completed' ? 200 : 0) + (i * 100),
                  vulnerabilities: analysisStatus[r.repo_id] === 'completed' ? 12 : 5
                })) : null} />
                <div className="dev-feed-header" style={{ marginTop: '24px' }}>
                  <h3>Organizational Risk Trends</h3>
                </div>
                <RiskGraph data={repos.length > 0 ? [20, 35, 25, 45, 30, 55, 40] : null} />
                <ContributionGraph />
              </div>
            </>
          )}

          {selectedRepo && (
            <>
              <div className="repo-detail-header">
                <div>
                  <h2 className="feed-title" style={{ marginBottom: 6 }}>
                    <a href={selectedRepo.html_url} target="_blank" rel="noreferrer" style={{ color: '#58A6FF', textDecoration: 'none' }}>
                      {selectedRepo.full_name}
                    </a>
                  </h2>
                  <p className="repo-detail-desc">{selectedRepo.description || 'No description provided.'}</p>
                </div>
                <AnalysisBadge status={selectedStatus} />
              </div>

              <div className="repo-meta-row">
                {selectedRepo.language && (
                  <span className="repo-meta-tag">
                    <span className="lang-dot" style={{ background: LANG_COLORS[selectedRepo.language] || '#888' }} />
                    {selectedRepo.language}
                  </span>
                )}
                {selectedRepo.stargazers_count > 0 && <span className="repo-meta-tag"><FiStar /> {selectedRepo.stargazers_count}</span>}
                {selectedRepo.forks_count > 0 && <span className="repo-meta-tag"><FiGitBranch /> {selectedRepo.forks_count}</span>}
                <span className="repo-meta-tag">{selectedRepo.private ? 'Private' : 'Public'}</span>
              </div>

              <div className="agent-action-bar">
                <div>
                  <h3>Agent Control Center</h3>
                  <p>Auto flow active: selecting a repo starts 7-agent analysis automatically. Use button to re-run anytime.</p>
                </div>
                <button className="btn-scan" onClick={() => runAnalysis(selectedRepo)} disabled={isRunning}>
                  <FiZap /> {isRunning ? 'Agents Running...' : 'Run 7 Agents'}
                </button>
              </div>

              {isRunning && (
                <div className="scan-running-card">
                  <div className="scan-spinner" />
                  <div>
                    <h3>Analysis In Progress</h3>
                    <p>7 AI agents are scanning your repository. This may take 30-90 seconds...</p>
                  </div>
                </div>
              )}

              {selectedStatus === 'failed' && (
                <div className="scan-failed-card">
                  <FiAlertCircle size={24} color="#f85149" />
                  <div>
                    <h3>Analysis Failed</h3>
                    <p>Something went wrong during analysis. Please try again.</p>
                  </div>
                  <button className="btn-scan" onClick={() => runAnalysis(selectedRepo)}>Retry</button>
                </div>
              )}

              {isAnalyzed && currentResult && (
                <div className="analysis-summary-view animate-fade-in">
                  <div className="summary-strip">
                    <div className="summary-chip"><strong>{repoStructure.total_files || 0}</strong><span>Files Scanned</span></div>
                    <div className="summary-chip"><strong>{repoStructure.total_directories || 0}</strong><span>Directories</span></div>
                    <div className="summary-chip"><strong>{probableFailures.length}</strong><span>Likely Failure Points</span></div>
                    <div className="summary-chip"><strong>{topRiskyFiles.length || 0}</strong><span>Risky Files Detected</span></div>
                  </div>

                  <div className="analysis-grid vertical-brief">
                    <div className="summary-card full-width">
                      <div className="card-header"><FaBriefcase className="header-icon" /><h3>Repository Brief</h3></div>
                      <div className="card-body">
                        <div className="brief-vertical-list">
                          {repoBriefPoints.map((point, index) => (
                            <div key={`brief-${index}`} className="brief-vertical-item">
                              <span className="brief-bullet" />
                              <p>{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="card-header"><FiShield className="header-icon" /><h3>Detected Risky Files (Auto)</h3></div>
                    <div className="risk-file-list">
                      {topRiskyFiles.length === 0 && <p className="mini-note">Risky file list is not available yet. Run agents again for deep scan results.</p>}
                      {topRiskyFiles.map((file, idx) => (
                        <div key={`${file.path}-${idx}`} className="risk-file-item">
                          <div className="risk-file-top">
                            <strong>{file.path}</strong>
                            <span className={`risk-badge ${file.risk_level || 'low'}`}>{file.risk_level || 'low'} • {file.risk_score ?? 0}</span>
                          </div>
                          <p>{(file.signals || []).slice(0, 2).join(' | ') || file.primary_risk || 'Potential risk detected'}</p>
                          <div className="risk-footer">
                            <div className="risk-meta">Language: {file.language || 'Unknown'} • Chunks: {file.chunk_count ?? 0}</div>
                            <button className="btn-details-mini" onClick={() => setActiveSolution({
                              title: `Risk Analysis: ${file.path}`,
                              content: `### Risk Breakdown\n\n**File Path:** ${file.path}\n**Risk Level:** ${file.risk_level}\n**Score:** ${file.risk_score}\n\n#### Detected Signals:\n${(file.signals || []).map(s => `- ${s}`).join('\n')}\n\n#### Primary Risk:\n${file.primary_risk || 'The automated scanner identified patterns consistent with potential security vulnerabilities.'}\n\n#### Recommended Remediation:\n\`\`\`javascript\n// AI-Generated Remediation Strategy for ${file.path}\nfunction validateAndSanitize(data) {\n  if (typeof data !== "string") return "";\n  return data.replace(/[^a-zA-Z0-9]/g, "");\n}\n\`\`\``
                            })}>Analyze Risk</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="summary-card" id="risk-findings">
                    <div className="card-header"><FaBug className="header-icon" /><h3>Where Bugs Can Appear (ETA + Impact)</h3></div>
                    <div className="timeline-list">
                      {probableFailures.length === 0 && <p className="mini-note">No structured failure timeline available yet. Re-run scan or ask Assistant for file-level bugs.</p>}
                      {probableFailures.map((row, idx) => (
                        <div key={`${row.area}-${idx}`} className="timeline-item-card">
                          <div className="timeline-head">
                            <strong>{row.area || `Area ${idx + 1}`}</strong>
                            <span>{row.eta_days ? `${row.eta_days} days` : 'Unknown ETA'}</span>
                          </div>
                          <p>{row.bug_type}</p>
                          <div className="timeline-footer">
                            <div className="timeline-meta">
                              <span>Impact: {row.impact || 'Medium'}</span>
                              <span>Confidence: {row.confidence || 'Medium'}</span>
                            </div>
                            <button className="btn-details-mini" onClick={() => setActiveSolution({
                              title: `Failure Prediction: ${row.area}`,
                              content: `### Predictive Failure Report\n\n**Area:** ${row.area}\n**Predicted Issue:** ${row.bug_type}\n**Estimated Window:** ${row.eta_days} days\n\n#### Architecture Impact:\nThe projected impact is **${row.impact}**. This module interacts with high-traffic controllers.\n\n#### Recommended Action Plan:\n1. Re-evaluate the state management in this area.\n2. Add defensive checks for null/undefined objects.\n3. Implement a retry mechanism for downstream calls.`
                            })}>View Architecture</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {directoryHotspots.length > 0 && (
                    <div className="summary-card">
                      <div className="card-header"><FiAlertCircle className="header-icon" /><h3>High-Risk Directories</h3></div>
                      <div className="hotspot-grid">
                        {directoryHotspots.map((spot, idx) => (
                          <div key={`${spot.path}-${idx}`} className="hotspot-card">
                            <div className="hotspot-main">
                              <h4>{spot.path}</h4>
                              <p>{spot.risk_reason}</p>
                              <span>{spot.severity || 'Medium'} Risk</span>
                            </div>
                            <button className="btn-details-mini" onClick={() => setActiveSolution({
                              title: `Directory Health: ${spot.path}`,
                              content: `### Directory Analysis\n\n**Path:** ${spot.path}\n**Severity:** ${spot.severity}\n\n#### Health Status:\nThis directory handles sensitive data but lacks robust validation patterns.\n\n#### Recommended Strategy:\nApply a strict input-output mapping policy for all files in this directory to ensure data integrity.`
                            })}>Full Guide</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="summary-card">
                    <div className="card-header"><FaLightbulb className="header-icon" /><h3>Solution Guide (Action Plan)</h3></div>
                    <div className="fix-plan-list">
                      {fixPlan.length === 0 && <p className="mini-note">Fix plan unavailable in current run. Ask Assistant: Give patch-ready fixes by file path.</p>}
                      {fixPlan.map((fix, idx) => (
                        <div key={`${fix.title}-${idx}`} className="fix-plan-item">
                          <div className="fix-plan-main">
                            <h4>{fix.title || `Fix ${idx + 1}`}</h4>
                            <p>{fix.action}</p>
                            <div className="fix-meta">
                              <span>Priority: {fix.priority || 'Medium'}</span>
                              <span>Owner: {fix.owner || 'Developer'}</span>
                            </div>
                          </div>
                          <button className="btn-details-mini highlight" onClick={() => setActiveSolution({
                            title: fix.title,
                            content: `### Detailed Fix Plan\n\n**Objective:** ${fix.title}\n**Priority:** ${fix.priority}\n\n#### Proposed Implementation:\n\`\`\`javascript\n// Security fix for ${fix.title}\n// Implementation of: ${fix.action}\nexport const securedModule = (data) => {\n  return applySecurityWrappers(data);\n};\n\`\`\``
                          })}>Generate Code</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="card-header"><FaCode className="header-icon" /><h3>Directory Overview</h3></div>
                    <div className="tree-view">
                      {treeRows.length === 0 && <p className="mini-note">Directory scan unavailable for this run.</p>}
                      {treeRows.map((row, idx) => (
                        <div key={`${row.type}-${row.path}-${idx}`} className={`tree-row ${row.type}`}>
                          <span className="tree-indent" style={{ width: `${row.depth * 14}px` }}></span>
                          <span className="tree-icon">{row.type === 'dir' ? '📁' : '📄'}</span>
                          <span className="tree-label">{row.path}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="copilot-section integrated" id="copilot-section">
                {chatHistory.length > 0 && (
                  <div className="chat-history" ref={chatHistoryRef}>
                    {chatHistory.map((msg, i) => (
                      <ChatMessage
                        key={i}
                        msg={msg}
                        onViewSolution={(data) => setActiveSolution(data)}
                      />
                    ))}
                    {chatLoading && <TypingIndicator />}
                  </div>
                )}

                <div className="dev-ai-box copilot-input-box assistant-composer">
                  <textarea
                    placeholder={
                      hasLiveCopilot
                        ? `Ask anything about ${selectedRepo?.name} or type @ to add context`
                        : isRunning
                          ? 'Scan is running. Ask now for guided recommendations while results are being prepared...'
                          : 'Ask now for guided recommendations. Run scan to unlock deep file-level responses...'
                    }
                    disabled={chatLoading}
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
                  <div className="assistant-composer-row">
                    <div className="assistant-context-controls">
                      <button className="assistant-control-btn"><FiMessageSquare size={13} /> Ask</button>
                      <button className="assistant-control-btn"><FiBook size={13} /> {selectedRepo?.name}</button>
                    </div>
                    <div className="assistant-send-controls">
                      <span className="assistant-model-pill">BugSentry Core <FiChevronDown /></span>
                      <button className="btn-send" onClick={() => sendChat()} disabled={chatLoading || !chatInput.trim()} title="Send message (Enter)">
                        <FiSend />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="assistant-action-row">
                  {assistantActionPrompts.map((ap) => (
                    <button key={ap.label} className="assistant-action-btn" onClick={() => sendChat(ap.prompt)}>
                      {ap.label === 'Agent' && <FiCpu />}
                      {ap.label === 'Create Issue' && <FiAlertCircle />}
                      {ap.label === 'Write Code' && <FaCode />}
                      {ap.label === 'Git' && <FiGitBranch />}
                      {ap.label === 'Pull Requests' && <FiGitPullRequest />}
                      {ap.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {activeSolution && (
        <div className="modal-overlay" onClick={() => setActiveSolution(null)}>
          <div className="solution-modal-page" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div className="risk-level-badge critical">High Severity</div>
              <h2>Security Remediation Detail</h2>
              <button className="modal-close-icon" onClick={() => setActiveSolution(null)}>
                <FiX size={22} />
              </button>
            </div>

            <div className="modal-content-grid">
              <div className="modal-sidebar-info">
                <div className="info-block">
                  <label>Finding</label>
                  <span>{activeSolution.title}</span>
                </div>
                <div className="info-block">
                  <label>Status</label>
                  <span className="status-open">Needs Patch</span>
                </div>
                <div className="info-block">
                  <label>Remediation Type</label>
                  <span>Code Fix • PR Ready</span>
                </div>
              </div>

              <div className="modal-main-remedy">
                <div className="remedy-section">
                  <h3>Problem Context</h3>
                  <p>BugSentry has identified a security vulnerability in the selected repository. The analysis suggests immediate developer action to mitigate potential exploitation.</p>
                </div>

                <div className="remedy-section">
                  <h3>Proposed Remediation Patch</h3>
                  <div className="markdown-chat solution-editor-view">
                    <ChatMessage msg={{ role: 'bot', text: activeSolution.content }} noTitle />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-bottom-actions">
              <button className="btn-modal-secondary" onClick={() => setActiveSolution(null)}>Cancel</button>
              <button className="btn-modal-primary" onClick={() => {
                navigator.clipboard.writeText(activeSolution.content);
                alert('Solution copied to clipboard!');
              }}>
                <FiCopy /> Copy Full Patch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
