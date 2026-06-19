import { Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <WorkspaceProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </WorkspaceProvider>
  );
}

export default App;
