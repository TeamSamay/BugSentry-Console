import React from 'react';
import { FaDocker, FaGithub } from 'react-icons/fa';
import { FiAlertCircle, FiCpu, FiPlay } from 'react-icons/fi';

export default function DevSidebarLeft({ repos, activeRepoId, scannedRepos, setScannedRepos, onOpenRepoDetails }) {
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

