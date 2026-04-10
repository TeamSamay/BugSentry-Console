import React from 'react';
import { FaBriefcase, FaCode } from 'react-icons/fa';

export default function RoleSelectionView({ onLogout, onRoleSelect }) {
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
          <div className="role-card" onClick={() => onRoleSelect('developer')}>
            <div className="role-icon">
              <FaCode />
            </div>
            <h3>Use as Developer</h3>
            <p>View technical insights, code-level risks, and detailed analysis</p>
          </div>

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

