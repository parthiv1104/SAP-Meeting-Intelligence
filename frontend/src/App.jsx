import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppShell from './components/layout/AppShell';

import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

import Projects from './pages/Projects';
import ProjectNew from './pages/ProjectNew';
import ProjectDetail from './pages/ProjectDetail';

import Meetings from './pages/Meetings';
import MeetingDetail from './pages/MeetingDetail';
import MeetingPreparation from './pages/MeetingPreparation';
import MeetingAnalysis from './pages/MeetingAnalysis';

import Questions from './pages/Questions';

import Knowledge from './pages/Knowledge';
import KnowledgeTimeline from './pages/KnowledgeTimeline';
import Documents from './pages/Documents';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Auth initialMode="login" />} />
          <Route path="/register" element={<Auth initialMode="register" />} />

          {/* Protected Application Workspace */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<ProjectNew />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />


            <Route path="/meetings" element={<Meetings />} />
            <Route path="/meetings/:id" element={<MeetingDetail />} />
            <Route path="/meetings/:id/preparation" element={<MeetingPreparation />} />
            <Route path="/meetings/:id/analysis" element={<MeetingAnalysis />} />

            <Route path="/questions" element={<Questions />} />

            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/knowledge/timeline" element={<KnowledgeTimeline />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reports" element={<Navigate to="/dashboard" replace />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

