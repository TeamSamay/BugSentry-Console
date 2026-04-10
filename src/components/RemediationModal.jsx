import React from 'react';
import { FiX, FiAlertTriangle, FiShield, FiFileText, FiCopy, FiTrash2 } from 'react-icons/fi';
import { ChatMessage } from './ChatComponents';
import './RemediationModal.css';

export function RemediationModal({
  activeSolution,
  onClose,
  loading
}) {
  if (!activeSolution) return null;

  const targetFile = activeSolution.title?.split(':').pop() || 'Selected Module';

  return (
    <div className="full-page-overlay">
      <div className="audit-container animate-fade-in">

        {/* Top Navigation Bar */}
        <div className="audit-header">
          <div className="header-left">
            <div className="brand-tag">SECURE_OS</div>
            <div className="file-breadcrumb">
              <FiFileText size={14} />
              <span>{targetFile}</span>
            </div>
          </div>
          <button className="exit-button" onClick={onClose} title="Close Report">
            <FiX size={24} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="audit-content-grid">

          {/* Summary Sidebar - Problem & Location focus */}
          <div className="audit-meta-panel">
            <div className="section-group">
              <label><FiAlertTriangle size={14} color="#ff4d4d" /> DETECTED VULNERABILITY</label>
              <h3>Logic Complexity & Security Risk</h3>
              <p>The code in <b>{targetFile}</b> contains potential security loopholes that could lead to unauthorized data access or logic bypass.</p>
            </div>

            <div className="section-group">
              <label><FiShield size={14} color="#10b981" /> REMEDIATION STRATEGY</label>
              <ul>
                <li>Input Sanitization</li>
                <li>Modular Logic Refactoring</li>
                <li>Error Boundary Implementation</li>
              </ul>
            </div>

            <div className="security-id-tag">
              AUDIT_ID: #BS-{activeSolution.auditId || '5054'}
            </div>
          </div>

          {/* Detailed Solution Area (The Report) */}
          <div className="audit-main-report">
            {loading ? (
              <div className="full-loading-view">
                <div className="pulse-loader"></div>
                <h2>Generating Secure Implementation...</h2>
                <p>Our Staff Engineer agents are verifying the patch logic.</p>
              </div>
            ) : (
              <div className="report-scroll-view">
                <div className="report-heading">
                  <h1>Implementation Details</h1>
                  <p>Follow the code changes below to secure your application.</p>
                </div>

                <div className="markdown-display">
                  {/* Using your existing ChatMessage component to render the solution */}
                  <ChatMessage msg={{ role: 'bot', text: activeSolution.content }} noTitle />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Dock */}
        <div className="audit-actions-dock">
          <button className="dock-btn secondary" onClick={onClose}>
            <FiTrash2 size={18} />
            <span>Discard Changes</span>
          </button>

          <button className="dock-btn primary" onClick={() => {
            navigator.clipboard.writeText(activeSolution.content);
            alert('Security implementation copied to clipboard!');
          }}>
            <FiCopy size={18} />
            <span>Copy Implementation</span>
          </button>
        </div>
      </div>

    </div>
  );
}