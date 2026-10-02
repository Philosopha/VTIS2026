import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage        from './pages/LoginPage';
import DashboardPage    from './pages/DashboardPage';
import RegistrationsPage from './pages/RegistrationsPage';
import RegistrationDetailPage from './pages/RegistrationDetailPage';
import CheckInPage      from './pages/CheckInPage';
import Layout           from './components/Layout';

function Protected({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn === null) return null; // still loading
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <Protected>
          <Layout />
        </Protected>
      }>
        <Route index           element={<DashboardPage />} />
        <Route path="registrations" element={<RegistrationsPage />} />
        <Route path="registrations/:id" element={<RegistrationDetailPage />} />
        <Route path="checkin"  element={<CheckInPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
