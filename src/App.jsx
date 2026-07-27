import React, { useState, useEffect } from 'react';
import { useUser } from './hooks/useUser';
import { LoginView } from './views/LoginView';
import { RoleSelectionView } from './views/RoleSelectionView';
import { DeveloperDashboard } from './views/DeveloperDashboard';
import { CEODashboard } from './views/CEODashboard';
import './index.css';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [activeRole, setActiveRole] = useState(null);
  const { user } = useUser(token);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      localStorage.setItem('token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogout = () => {
    setToken(null);
    setActiveRole(null);
    localStorage.removeItem('token');
  };

  const isLoggedIn = !!token;

  const isCEORoute = window.location.pathname === '/ceo';
  const isDevRoute = window.location.pathname === '/developer' || window.location.pathname === '/dashboard';

  // Auth Guard
  if ((isCEORoute || isDevRoute) && !isLoggedIn) {
    return <LoginView />;
  }

  if (isCEORoute) {
    return (
      <CEODashboard
        token={token}
        role="ceo"
        onLogout={handleLogout}
        onBack={() => window.location.href = '/'}
      />
    );
  }

  if (isDevRoute) {
    return (
      <DeveloperDashboard
        token={token}
        onLogout={handleLogout}
        onBack={() => window.location.href = '/'}
      />
    );
  }

  return (
    <>
      {!isLoggedIn ? (
        <LoginView />
      ) : !activeRole ? (
        <RoleSelectionView
          onLogout={handleLogout}
          onRoleSelect={setActiveRole}
          user={user}
        />
      ) : activeRole === 'developer' ? (
        <DeveloperDashboard
          token={token}
          onLogout={handleLogout}
          onBack={() => setActiveRole(null)}
        />
      ) : (
        <CEODashboard
          token={token}
          role={activeRole}
          onLogout={handleLogout}
          onBack={() => setActiveRole(null)}
        />
      )}
    </>
  );
}

export default App;
