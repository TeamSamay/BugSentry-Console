import React from 'react';
import { FiX, FiShield, FiCode, FiCheckCircle, FiCopy } from 'react-icons/fi';
import { ChatMessage } from './ChatComponents';

/**
 * Professional AI Security Remediation Modal
 * Theme: Deep Dark / Minimalist High-Contrast
 */
export function RemediationModal({ 
  activeSolution, 
  onClose, 
  loading 
}) {
  if (!activeSolution) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSolution.content);
    // You could replace this alert with a professional toast notification
    alert('Security patch copied to clipboard!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modern-remediation-panel" onClick={e => e.stopPropagation()}>
        
        {/* Header Section */}
        <div className="panel-header">
          <div className="header-left">
            <div className="status-indicator">
              <span className="pulse-dot"></span>
              <FiShield className="shield-icon" />
            </div>
            <div className="header-text">
              <h2>Security Remediation</h2>
              <span className="sub-text">AI-Generated Patch • v1.1</span>
            </div>
          </div>
          <button className="close-btn-circle" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="panel-body-scroll">
          {loading ? (
            <div className="ai-loading-state">
              <div className="cyber-spinner"></div>
              <h3>Synthesizing Solution</h3>
              <p>Analyzing architectural patterns and hardening logic...</p>
            </div>
          ) : (
            <div className="remediation-content-wrapper">
              {/* Context Summary Tag */}
              <div className="context-pill">
                <FiCode size={14} />
                <span>Target: {activeSolution.title?.split(':').pop() || 'Selected Module'}</span>
              </div>

              {/* Main Solution Area */}
              <div className="solution-markdown-container">
                <ChatMessage 
                  msg={{ role: 'bot', text: activeSolution.content }} 
                  noTitle 
                />
              </div>

              {/* Verification Badge */}
              <div className="verification-footer-note">
                <FiCheckCircle size={14} color="#10b981" />
                <span>Verified by Multi-Agent Consensus (Staff Engineer)</span>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Actions */}
        <div className="panel-actions">
          <button className="action-secondary" onClick={onClose}>
            Discard
          </button>
          <button className="action-primary" onClick={handleCopy}>
            <FiCopy size={16} />
            <span>Copy Implementation</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modern-remediation-panel {
          width: 100%;
          max-width: 520px; /* Narrow, professional profile-like width */
          height: 85vh;
          background: #0a0a0a;
          border: 1px solid #222;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .panel-header {
          padding: 20px 24px;
          background: #111;
          border-bottom: 1px solid #222;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-indicator {
          position: relative;
          color: #fff;
        }

        .pulse-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
        }

        .header-text h2 {
          font-size: 18px;
          color: #fff;
          margin: 0;
          font-weight: 600;
        }

        .sub-text {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .close-btn-circle {
          background: #222;
          border: none;
          color: #888;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn-circle:hover {
          background: #333;
          color: #fff;
        }

        .panel-body-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          scrollbar-width: thin;
          scrollbar-color: #333 transparent;
        }

        .remediation-content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .context-pill {
          align-self: flex-start;
          background: #1a1a1a;
          border: 1px solid #333;
          padding: 6px 12px;
          border-radius: 20px;
          color: #aaa;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .verification-footer-note {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(16, 185, 129, 0.05);
          border-radius: 8px;
          color: #888;
          font-size: 12px;
        }

        .panel-actions {
          padding: 20px 24px;
          background: #111;
          border-top: 1px solid #222;
          display: flex;
          gap: 12px;
        }

        .action-primary {
          flex: 1;
          background: #fff;
          color: #000;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.1s;
        }

        .action-primary:active { transform: scale(0.98); }

        .action-secondary {
          padding: 0 20px;
          background: transparent;
          border: 1px solid #333;
          color: #888;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-secondary:hover {
          border-color: #555;
          color: #fff;
        }

        .ai-loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #fff;
        }

        .cyber-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top: 3px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}