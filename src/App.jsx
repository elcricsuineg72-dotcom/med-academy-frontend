import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { ProtectedRoute, PublicOnlyRoute } from './components/common/ProtectedRoute';

// Layouts
import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AuthPage from './pages/public/AuthPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentModules from './pages/student/StudentModules';
import ModuleDetail from './pages/student/ModuleDetail';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import StudentProfile from './pages/student/StudentProfile';
import PendingPage from './pages/student/PendingPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminModules from './pages/admin/AdminModules';
import AdminContent from './pages/admin/AdminContent';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAnalytics from './pages/admin/AdminAnalytics';

import LoadingSpinner from './components/common/LoadingSpinner';

// Smart redirect based on role
const SmartRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (user?.role === 'tutor') return <Navigate to="/admin/dashboard" replace />;
  if (user?.status === 'pending') return <Navigate to="/student/pending" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

// Student route wrapper that handles pending status
const StudentRouteWrapper = ({ children }) => {
  const { user } = useAuth();
  if (user?.status === 'pending') return <Navigate to="/student/pending" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/auth" element={
      <PublicOnlyRoute>
        <AuthPage />
      </PublicOnlyRoute>
    } />

    {/* Smart redirect from /app or /dashboard */}
    <Route path="/app" element={<SmartRedirect />} />

    {/* Student Pending */}
    <Route path="/student/pending" element={
      <ProtectedRoute requiredRole="student">
        <PendingPage />
      </ProtectedRoute>
    } />

    {/* Student Routes */}
    <Route path="/student/dashboard" element={
      <ProtectedRoute requiredRole="student">
        <StudentRouteWrapper>
          <StudentLayout>
            <StudentDashboard />
          </StudentLayout>
        </StudentRouteWrapper>
      </ProtectedRoute>
    } />
    <Route path="/student/modules" element={
      <ProtectedRoute requiredRole="student">
        <StudentRouteWrapper>
          <StudentLayout>
            <StudentModules />
          </StudentLayout>
        </StudentRouteWrapper>
      </ProtectedRoute>
    } />
    <Route path="/student/modules/:id" element={
      <ProtectedRoute requiredRole="student">
        <StudentRouteWrapper>
          <StudentLayout>
            <ModuleDetail />
          </StudentLayout>
        </StudentRouteWrapper>
      </ProtectedRoute>
    } />
    <Route path="/student/announcements" element={
      <ProtectedRoute requiredRole="student">
        <StudentRouteWrapper>
          <StudentLayout>
            <StudentAnnouncements />
          </StudentLayout>
        </StudentRouteWrapper>
      </ProtectedRoute>
    } />
    <Route path="/student/profile" element={
      <ProtectedRoute requiredRole="student">
        <StudentRouteWrapper>
          <StudentLayout>
            <StudentProfile />
          </StudentLayout>
        </StudentRouteWrapper>
      </ProtectedRoute>
    } />

    {/* Admin / Tutor Routes */}
    <Route path="/admin/dashboard" element={
      <ProtectedRoute requiredRole="tutor">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/students" element={
      <ProtectedRoute requiredRole="tutor">
        <AdminLayout>
          <AdminStudents />
        </AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/modules" element={
      <ProtectedRoute requiredRole="tutor">
        <AdminLayout>
          <AdminModules />
        </AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/content" element={
      <ProtectedRoute requiredRole="tutor">
        <AdminLayout>
          <AdminContent />
        </AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/announcements" element={
      <ProtectedRoute requiredRole="tutor">
        <AdminLayout>
          <AdminAnnouncements />
        </AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/analytics" element={
      <ProtectedRoute requiredRole="tutor">
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      </ProtectedRoute>
    } />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
