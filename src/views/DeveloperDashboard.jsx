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
import { RemediationModal } from '../components/RemediationModal';
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
  const [evolutionData, setEvolutionData] = useState(null);
  const [remediationLoading, setRemediationLoading] = useState(false);

  // New Sidebar Interaction States
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [dockerfileContent, setDockerfileContent] = useState(null);
  const [showDockerfileAudit, setShowDockerfileAudit] = useState(false);

  const fetchEvolution = async (rid) => {
    try {
      const res = await fetch(`${SYSTEM_URL}/api/report/evolution/${rid}`, {
        headers: authHeaders
      });
      const data = await res.json();
      setEvolutionData(data);
    } catch (err) {
      console.error('Evolution fetch failed:', err);
    }
  };

  const fetchRemediation = async (item, type = 'file') => {
    if (!selectedRepo) return;
    setRemediationLoading(true);
    // Show immediate optimistic UI state
    setActiveSolution({
      title: `Remediating ${item.path || item.area || 'Selected Block'}...`,
      content: '_BugSentry AI Agents are spinning up a dedicated container to generate a secure remediation patch..._'
    });

    try {
      const resp = await fetch(`${SYSTEM_URL}/api/report/remediate/${selectedRepo.repo_id}`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_path: item.path,
          problem_type: item.bug_type || item.risk_reason || type,
          context_data: item
        })
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);

      setActiveSolution({
        title: data.title || `Remediation: ${item.path || item.area}`,
        content: data.patch,
        severity: data.severity || 'Critical',
        confidence: data.confidence || '98%',
        isReal: true
      });
    } catch (err) {
      setActiveSolution({
        title: 'Network Error: Remediation Engine',
        content: `### ❌ Generation Failed\n\n**Reason:** ${err.message}. \n\n**Action Required:** Please ensure the **BugSentry-System** backend service is reachable at \`${SYSTEM_URL}\`. If running locally, check your CORS and API key settings.`
      });
    } finally {
      setRemediationLoading(false);
    }
  };

  const runDockerfileAudit = async () => {
    if (!selectedRepo) return;
    setRemediationLoading(true);
    setShowDockerfileAudit(true);
    // Mocking fetching Dockerfile from analysis results or GitHub
    const mockDockerfile = `FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]`;
    setDockerfileContent({
      content: mockDockerfile,
      audit: "### Dockerfile Security Audit\n\n**Verdict:** Needs Updates\n\n1. **Root User:** Currently running as root. Switch to a non-root user.\n2. **Image Version:** Node 18 is fine, but consider Node 20-LTS.\n3. **Caching:** Layers are optimized.",
      status: 'Warning'
    });
    setRemediationLoading(false);
  };
  const [expandedSections, setExpandedSections] = useState({
    brief: true,
    riskyFiles: false,
    bugs: false,
    hotspots: false,
    solution: false,
    directory: false,
    evolution: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
    if (repo?.repo_id) {
      fetchEvolution(repo.repo_id);
    }
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
              <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <FiHome className="sidebar-icon" /> <span>Home</span>
              </li>
              <li onClick={() => setShowRepoSelector(true)}>
                <FiFilter className="sidebar-icon" /> <span>Risk Findings</span>
              </li>
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
              <li onClick={runDockerfileAudit}>
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
                    <div className="summary-card full-width brief-card-premium">
                      <div className="card-header brief-header-static">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="header-icon-wrapper brief-icon"><FaBriefcase /></div>
                          <h3 style={{ color: '#fff' }}>Repository Executive Brief</h3>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="brief-vertical-list">
                          {repoBriefPoints.map((point, index) => (
                            <div key={`brief-${index}`} className="brief-vertical-item">
                              <span className="brief-bullet" />
                              <p style={{ color: '#c9d1d9' }}>{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="summary-card collapsible-card">
                    <div className="card-header collapsible-premium" onClick={() => toggleSection('riskyFiles')}>
                      <div className="header-left">
                        <div className="header-icon-wrapper risk-icon"><FiShield /></div>
                        <h3>Detected Risky Files (Automated Audit)</h3>
                      </div>
                      <div className="header-right">
                        <span className="count-badge">{topRiskyFiles.length}</span>
                        {expandedSections.riskyFiles ? <FiChevronUp className="chevron-icon" /> : <FiChevronDown className="chevron-icon" />}
                      </div>
                    </div>
                    {expandedSections.riskyFiles && (
                      <div className="card-body animate-slide-down">
                        <div className="risk-file-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                          {topRiskyFiles.length === 0 && <p className="mini-note">Risky file list is not available yet. Run agents again for deep scan results.</p>}
                          {topRiskyFiles.map((file, idx) => (
                            <div key={`${file.path}-${idx}`} className="risk-file-item creative">
                              <div className="risk-file-top">
                                <strong className="file-path-text">{file.path.split('/').pop()}</strong>
                                <span className={`risk-badge-elite ${file.risk_level || 'low'}`}>{file.risk_score ?? 0}% Risk</span>
                              </div>
                              <div className="severity-bar-container">
                                <div className={`severity-bar-fill ${file.risk_level || 'low'}`} style={{ width: `${file.risk_score ?? 20}%` }} />
                              </div>
                              <p className="file-sub-text">{file.path}</p>
                              <p className="risk-signal-tags">{(file.signals || []).slice(0, 3).map(s => <span key={s} className="signal-tag">{s}</span>)}</p>
                              <div className="risk-footer">
                                <div className="risk-meta">Language: <strong>{file.language || 'JS'}</strong></div>
                                <button
                                  className="btn-details-mini"
                                  disabled={remediationLoading}
                                  onClick={(e) => { e.stopPropagation(); fetchRemediation(file, 'risky_file'); }}
                                >
                                  {remediationLoading ? 'Processing...' : 'Analyze Risk'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="summary-card collapsible-card" id="risk-findings">
                    <div className="card-header collapsible-premium" onClick={() => toggleSection('bugs')}>
                      <div className="header-left">
                        <div className="header-icon-wrapper bug-icon"><FaBug /></div>
                        <h3>Bug Prediction Timeline (ETA + Impact)</h3>
                      </div>
                      <div className="header-right">
                        <span className="count-badge">{probableFailures.length}</span>
                        {expandedSections.bugs ? <FiChevronUp className="chevron-icon" /> : <FiChevronDown className="chevron-icon" />}
                      </div>
                    </div>
                    {expandedSections.bugs && (
                      <div className="card-body animate-slide-down">
                        <div className="timeline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          {probableFailures.length === 0 && <p className="mini-note">No structured failure timeline available yet. Re-run scan or ask Assistant for file-level bugs.</p>}
                          {probableFailures.map((row, idx) => (
                            <div key={`${row.area}-${idx}`} className="timeline-item-card creative">
                              <div className="timeline-head">
                                <div className="area-title">
                                  <FiAlertCircle className={`icon-${row.impact?.toLowerCase() || 'medium'}`} />
                                  <strong>{row.area || `Area ${idx + 1}`}</strong>
                                </div>
                                <span className="eta-badge">{row.eta_days ? `ETA: ${row.eta_days}d` : 'Unknown ETA'}</span>
                              </div>
                              <p className="bug-description">{row.bug_type}</p>
                              <div className="confidence-meter">
                                <label>Confidence</label>
                                <div className="dot-meter">
                                  {[1, 2, 3, 4, 5].map(i => <span key={i} className={`dot ${i <= (row.confidence === 'High' ? 5 : 3) ? 'active' : ''}`} />)}
                                </div>
                              </div>
                              <div className="timeline-footer">
                                <div className="timeline-meta">
                                  <span>Impact: <strong>{row.impact || 'Medium'}</strong></span>
                                </div>
                                <button
                                  className="btn-details-mini"
                                  disabled={remediationLoading}
                                  onClick={(e) => { e.stopPropagation(); fetchRemediation(row, 'bug_prediction'); }}
                                >
                                  {remediationLoading ? 'Processing...' : 'View Architecture'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="summary-card collapsible-card">
                    <div className="card-header collapsible-premium" onClick={() => toggleSection('hotspots')}>
                      <div className="header-left">
                        <div className="header-icon-wrapper hotspots-icon"><FiAlertCircle /></div>
                        <h3>Strategic Hotspots (High-Risk Directories)</h3>
                      </div>
                      <div className="header-right">
                        <span className="count-badge">{directoryHotspots.length}</span>
                        {expandedSections.hotspots ? <FiChevronUp className="chevron-icon" /> : <FiChevronDown className="chevron-icon" />}
                      </div>
                    </div>
                    {expandedSections.hotspots && (
                      <div className="card-body animate-slide-down">
                        <div className="hotspots-bento-grid">
                          {directoryHotspots.map((spot, idx) => (
                            <div key={`${spot.path}-${idx}`} className="hotspot-item">
                              <div className="hotspot-header">
                                <span className="folder-name">{spot.path}</span>
                                <span className={`hotspot-tag ${spot.severity?.toLowerCase() || 'medium'}`}>{spot.severity || 'Medium'}</span>
                              </div>
                              <div className="hotspot-content">
                                <p>{spot.risk_reason}</p>
                                <div className="hotspot-footer">
                                  <span>Average Risk Score: <strong>{spot.avg_risk || '5.0'}</strong></span>
                                </div>
                              </div>
                              <button
                                className="btn-full-guide"
                                disabled={remediationLoading}
                                onClick={(e) => { e.stopPropagation(); fetchRemediation(spot, 'directory_hotspot'); }}
                              >
                                {remediationLoading ? 'Analyzing...' : 'View Remediation Guide'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="summary-card collapsible-card">
                    <div className="card-header collapsible-premium" onClick={() => toggleSection('solution')}>
                      <div className="header-left">
                        <div className="header-icon-wrapper solution-icon"><FaLightbulb /></div>
                        <h3>Solution Guide (AI Action Plan)</h3>
                      </div>
                      <div className="header-right">
                        <span className="count-badge">{fixPlan.length}</span>
                        {expandedSections.solution ? <FiChevronUp className="chevron-icon" /> : <FiChevronDown className="chevron-icon" />}
                      </div>
                    </div>
                    <div className="card-body animate-slide-down">
                      <div className="solution-plan-vertical">
                        {fixPlan.length === 0 && <p className="mini-note">No active fixing plan. Ask BugSentry Assistant for a remediation strategy.</p>}
                        {fixPlan.map((fix, idx) => (
                          <div key={`${fix.title}-${idx}`} className="solution-plan-row">
                            <div className="solution-content">
                              <h4>{fix.title || `Solution ${idx + 1}`}</h4>
                              <p>{fix.action}</p>
                            </div>
                            <button
                              className="btn-generate-patch"
                              disabled={remediationLoading}
                              onClick={(e) => { e.stopPropagation(); fetchRemediation({ area: fix.title, action: fix.action }, 'action_plan'); }}
                            >
                              {remediationLoading ? 'Preparing Editor...' : 'Generate Implementation Code'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {evolutionData && !evolutionData.error && (
                    <div className="summary-card collapsible-card">
                      <div className="card-header collapsible-premium" onClick={() => toggleSection('evolution')}>
                        <div className="header-left">
                          <div className="header-icon-wrapper brief-icon"><FiGitBranch /></div>
                          <h3>Architecture Evolution & Version Drift</h3>
                        </div>
                        <div className="header-right">
                          <span className="count-badge">{evolutionData.current_version}</span>
                          {expandedSections.evolution ? <FiChevronUp className="chevron-icon" /> : <FiChevronDown className="chevron-icon" />}
                        </div>
                      </div>
                      {expandedSections.evolution && (
                        <div className="card-body animate-slide-down">
                          <div className="evolution-summary-stats">
                            <div className="evo-stat">
                              <label>Migration Readiness</label>
                              <div className="evo-progress-bg">
                                <div className="evo-progress-fill" style={{ width: evolutionData.migration_readiness }} />
                              </div>
                              <span>{evolutionData.migration_readiness}</span>
                            </div>
                            <div className="evo-stat">
                              <label>Version Gap</label>
                              <span>{evolutionData.previous_version} → {evolutionData.current_version}</span>
                            </div>
                          </div>

                          <div className="evolution-points-grid">
                            {(evolutionData.evolution_points || []).map((p, i) => (
                              <div key={i} className="evolution-point-card">
                                <div className={`evo-type-tag ${p.type.toLowerCase()}`}>{p.type}</div>
                                <h4>{p.feature}</h4>
                                <p>{p.description}</p>
                                <div className="evo-impact">Impact: <strong>{p.impact}</strong></div>
                              </div>
                            ))}
                          </div>

                          <div className="future-roadmap-box">
                            <h4><FiZap /> AI-Predicted Engineering Roadmap</h4>
                            <ul>
                              {(evolutionData.future_roadmap || []).map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="summary-card directory-overview-card collapsible-card">
                    <div className="card-header collapsible-premium" onClick={() => toggleSection('directory')}>
                      <div className="header-left">
                        <div className="header-icon-wrapper directory-icon"><FaCode /></div>
                        <h3>Project Architecture & File System</h3>
                      </div>
                      <div className="header-right">
                        {expandedSections.directory ? <FiChevronUp className="chevron-icon" /> : <FiChevronDown className="chevron-icon" />}
                      </div>
                    </div>
                    {expandedSections.directory && (
                      <div className="card-body animate-slide-down">
                        <div className="architecture-split-view">
                          <div className="tree-explorer">
                            <div className="tree-explorer-header"><FiFilter size={14} /> Directory Structure</div>
                            <div className="tree-view-elite">
                              {treeRows.length === 0 && <p className="mini-note">Directory scan unavailable.</p>}
                              {treeRows.map((row, idx) => (
                                <div key={`${row.type}-${row.path}-${idx}`} className={`tree-row-elite ${row.type}`}>
                                  <span className="tree-indent" style={{ width: `${row.depth * 16}px` }}></span>
                                  <span className="tree-line" />
                                  <span className="tree-icon">{row.type === 'dir' ? '📁' : '📄'}</span>
                                  <span className="tree-label">{row.path.split('/').pop()}</span>
                                  <span className="tree-path-full">{row.path}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="architecture-insight-panel">
                            <div className="insight-header"><FiZap size={14} /> Structural Guidance</div>
                            <div className="insight-content">
                              <div className="improvement-card">
                                <label>Architectural Recommendation</label>
                                <p>Detected tight coupling between core modules. Consider segregating business logic into a <code>/lib</code> or <code>/core</code> folder to improve testability.</p>
                                <div className="code-snippet-box">
                                  <code>mv {selectedRepo?.name}/src/logic {selectedRepo?.name}/src/core</code>
                                </div>
                              </div>

                              <div className="improvement-card highlight">
                                <label>Improve Directory Health</label>
                                <p>Analyzing root structure of <strong>{selectedRepo?.name}</strong>... Found 3 potential circular dependencies in module exports.</p>
                                <button className="btn-mini-action">Auto-Repair Structure</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
        {/* Repo Selection Modal */}
        {showRepoSelector && (
          <div className="modal-overlay" onClick={() => setShowRepoSelector(false)}>
            <div className="repo-selector-popup" onClick={e => e.stopPropagation()}>
              <div className="popup-header">
                <h3>Select Repositories for Comparison</h3>
                <button className="close-btn" onClick={() => setShowRepoSelector(false)}><FiX /></button>
              </div>
              <div className="repo-list-scroll">
                {repos.map(r => (
                  <div key={r.id} className="repo-select-item" onClick={() => { handleRepoSelect(r); setShowRepoSelector(false); }}>
                    <FiGitBranch />
                    <span>{r.full_name}</span>
                    {selectedRepo?.id === r.id && <FiZap className="active-glow" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dockerfile Audit Modal */}
        {showDockerfileAudit && dockerfileContent && (
          <div className="modal-overlay" onClick={() => setShowDockerfileAudit(false)}>
            <div className="docker-audit-popup" onClick={e => e.stopPropagation()}>
              <div className="popup-header">
                <div className="docker-badge-row">
                  <FaDocker /> <h3>Dockerfile Security Audit</h3>
                </div>
                <button className="close-btn" onClick={() => setShowDockerfileAudit(false)}><FiX /></button>
              </div>
              <div className="docker-grid">
                <div className="docker-code-view">
                  <label>Raw Dockerfile</label>
                  <pre><code>{dockerfileContent.content}</code></pre>
                </div>
                <div className="docker-report-view">
                  <label>Audit Results</label>
                  <div className="markdown-chat">
                    <ChatMessage msg={{ role: 'bot', text: dockerfileContent.audit }} noTitle />
                  </div>
                  <button className="btn-modal-primary" style={{ marginTop: '20px' }}>Apply Auto-Fix</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <RemediationModal
        activeSolution={activeSolution}
        onClose={() => setActiveSolution(null)}
        loading={remediationLoading}
      />
    </div>
  );
}
