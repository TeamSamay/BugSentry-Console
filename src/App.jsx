import React from 'react';
import { FaGithub, FaGitlab, FaGoogle } from 'react-icons/fa';
import './index.css';

function App() {
  return (
    <>
      {/* Background Elements */}
      <div className="bg-glow"></div>
      <div className="light-spot spot-1"></div>
      <div className="light-spot spot-2"></div>

      {/* Main Content */}
      <div className="auth-container">
        <div className="glass-card">
          <div className="header">
            <h1 className="title">Welcome to Bugsentry</h1>
            <p className="subtitle">AI-powered Software Risk Intelligence</p>
          </div>

          <div className="button-group">
            <button className="auth-btn">
              <span className="btn-icon"><FaGithub /></span>
              Continue with GitHub
            </button>
            <button className="auth-btn">
              <span className="btn-icon"><FaGitlab color="#FC6D26" /></span>
              Continue with GitLab
            </button>
            <button className="auth-btn">
              <span className="btn-icon"><FaGoogle color="#4285F4" /></span>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
