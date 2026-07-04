import { Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductPage from './pages/ProductPage';
import FeaturesPage from './pages/FeaturesPage';
import SolutionsPage from './pages/SolutionsPage';
import PricingPage from './pages/PricingPage';
import CompanyPage from './pages/CompanyPage';

function App() {
  return (
    <WorkspaceProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </WorkspaceProvider>
  );
}

export default App;
