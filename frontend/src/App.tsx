import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { LevelPage } from './pages/LevelPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLessonsPage } from './pages/admin/AdminLessonsPage';
import { AdminLessonFormPage } from './pages/admin/AdminLessonFormPage';
import { AdminWordsPage } from './pages/admin/AdminWordsPage';
import { AdminWordFormPage } from './pages/admin/AdminWordFormPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/lessons" replace />} />
                <Route path="lessons" element={<AdminLessonsPage />} />
                <Route path="lessons/new" element={<AdminLessonFormPage />} />
                <Route path="lessons/:id/edit" element={<AdminLessonFormPage />} />
                <Route path="words" element={<AdminWordsPage />} />
                <Route path="words/new" element={<AdminWordFormPage />} />
                <Route path="words/:id/edit" element={<AdminWordFormPage />} />
              </Route>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomePage />} />
                <Route path="lessons/:lessonId" element={<LessonDetailPage />} />
                <Route
                  path="lessons/:lessonId/level/:levelNumber"
                  element={<LevelPage />}
                />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
