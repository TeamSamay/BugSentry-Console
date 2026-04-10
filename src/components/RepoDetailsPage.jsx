import React, { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { FiMoreHorizontal, FiSearch } from 'react-icons/fi';
import DevSidebarLeft from './DevSidebarLeft.jsx';

export default function RepoDetailsPage({ repos, repoFindings, scannedRepos, setScannedRepos, onOpenRepoDetails, onBackToDashboard }) {
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

