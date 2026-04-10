import React, { useEffect, useRef, useState } from 'react';
import { FaRegSmile } from 'react-icons/fa';
import {
  FiAlertCircle,
  FiBookOpen,
  FiChevronDown,
  FiCode,
  FiCpu,
  FiFileText,
  FiGitBranch,
  FiFilter,
  FiMessageSquare,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
  FiStar,
  FiTerminal,
  FiUpload,
  FiUsers,
  FiUser,
  FiSettings,
  FiLogOut
} from 'react-icons/fi';

import DevSidebarLeft from './DevSidebarLeft.jsx';
import RepositoryRiskChart from './RepositoryRiskChart.jsx';

export default function DeveloperDashboard({ onLogout, onBack, onOpenRepoDetails, scannedRepos, setScannedRepos, repos }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [createMenuAnchorEl, setCreateMenuAnchorEl] = useState(null);
  const [createMenuPos, setCreateMenuPos] = useState({ top: 0, right: 0 });
  const [profileMenuPos, setProfileMenuPos] = useState({ top: 0, right: 0 });
  const profileBtnRef = useRef(null);

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
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowProfileMenu(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showProfileMenu]);

  return (
    <div className="dev-dashboard-layout">
      <div className="bg-glow"></div>
      <div className="light-spot spot-1"></div>
      <div className="light-spot spot-2"></div>

      <header className="dev-topbar">
        <div className="dev-topbar-left">
          <button className="icon-btn"><span style={{ fontSize: 18 }}>☰</span></button>
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
            ref={profileBtnRef}
            title="Profile"
            onClick={() => {
              // Close other menu to avoid overlapping backdrops
              setShowCreateMenu(false);

              const el = profileBtnRef.current;
              if (el) {
                const rect = el.getBoundingClientRect();
                setProfileMenuPos({
                  top: Math.round(rect.bottom + 8),
                  right: Math.max(8, Math.round(window.innerWidth - rect.right)),
                });
              }

              setShowProfileMenu(v => !v);
            }}
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

      <div className="dev-main-grid">
        <DevSidebarLeft
          repos={repos}
          activeRepoId={null}
          scannedRepos={scannedRepos}
          setScannedRepos={setScannedRepos}
          onOpenRepoDetails={onOpenRepoDetails}
        />

        <main className="dev-center-feed">
          <h2 className="feed-title">Home</h2>

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
                <button className="btn-send"><FiMessageSquare /></button>
              </div>
            </div>
          </div>

          <div className="dev-action-pills">
            <button className="pill-btn"><FiTerminal /> Agent</button>
            <button className="pill-btn"><FiPlus /> Create issue</button>
            <button className="pill-btn"><FiFileText /> Write code ▼</button>
            <button className="pill-btn"><FiGitBranch /> Git ▼</button>
          </div>
          <div className="dev-action-pills center">
            <button className="pill-btn"><FiGitBranch /> Pull requests ▼</button>
          </div>

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

          <RepositoryRiskChart />

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

