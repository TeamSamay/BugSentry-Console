import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './index.css';

import LoginView from './components/LoginView.jsx';
import RoleSelectionView from './components/RoleSelectionView.jsx';
import WorkspaceView from './components/WorkspaceView.jsx';
import DeveloperDashboard from './components/DeveloperDashboard.jsx';
import RepoDetailsPage from './components/RepoDetailsPage.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

import { DEV_REPOS } from './data/repos.js';
import { REPO_FINDINGS } from './data/repoFindings.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const [scannedRepos, setScannedRepos] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const repoFindings = useMemo(() => REPO_FINDINGS, []);
  const wantsDevRoute = location.pathname === '/developer' || location.pathname.startsWith('/repo/');
  const effectiveIsLoggedIn = isLoggedIn || wantsDevRoute;
  const effectiveRole = activeRole ?? (wantsDevRoute ? 'developer' : null);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveRole(null);
    setScannedRepos({});
    navigate('/', { replace: true });
  };

  // Demo convenience: allow direct URLs like /developer and /repo/:id
  useEffect(() => {
    const path = location.pathname;
    const wantsDev =
      path === '/developer' ||
      path.startsWith('/repo/');

    if (wantsDev && (!isLoggedIn || activeRole !== 'developer')) {
      setIsLoggedIn(true);
      setActiveRole('developer');
    }
  }, [location.pathname, isLoggedIn, activeRole]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/"
          element={
            !effectiveIsLoggedIn ? (
              <LoginView onLogin={() => setIsLoggedIn(true)} />
            ) : !effectiveRole ? (
              <RoleSelectionView
                onLogout={handleLogout}
                onRoleSelect={(role) => {
                  setActiveRole(role);
                  if (role === 'developer') navigate('/developer');
                }}
              />
            ) : effectiveRole === 'developer' ? (
              <Navigate to="/developer" replace />
            ) : (
              <WorkspaceView
                role={effectiveRole}
                onLogout={handleLogout}
                onBack={() => {
                  setActiveRole(null);
                  navigate('/');
                }}
              />
            )
          }
        />

        <Route
          path="/developer"
          element={
            effectiveIsLoggedIn && effectiveRole === 'developer' ? (
              <DeveloperDashboard
                onLogout={handleLogout}
                onBack={() => {
                  setActiveRole(null);
                  navigate('/');
                }}
                onOpenRepoDetails={(repoId) => navigate(`/repo/${repoId}`)}
                scannedRepos={scannedRepos}
                setScannedRepos={setScannedRepos}
                repos={DEV_REPOS}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/repo/:repoId"
          element={
            effectiveIsLoggedIn && effectiveRole === 'developer' ? (
              <RepoDetailsPage
                repos={DEV_REPOS}
                repoFindings={repoFindings}
                scannedRepos={scannedRepos}
                setScannedRepos={setScannedRepos}
                onOpenRepoDetails={(repoId) => navigate(`/repo/${repoId}`)}
                onBackToDashboard={() => navigate('/developer')}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;

