import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import AppShell from './components/layout/AppShell';

import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectNew from './pages/ProjectNew';
import ProjectOverviewTab from './pages/project/ProjectOverviewTab';
import ProjectTeamTab from './pages/project/ProjectTeamTab';

import Meetings from './pages/Meetings';
import MeetingDetail from './pages/MeetingDetail';
import MeetingPreparation from './pages/MeetingPreparation';
import MeetingLive from './pages/MeetingLive';
import MeetingAnalysis from './pages/MeetingAnalysis';

import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import MissedQuestions from './pages/MissedQuestions';
import FrequentlyAsked from './pages/FrequentlyAsked';
import FrequentlyMissed from './pages/FrequentlyMissed';

import Knowledge from './pages/Knowledge';
import KnowledgeTimeline from './pages/KnowledgeTimeline';
import Requirements from './pages/Requirements';
import Decisions from './pages/Decisions';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<ProjectNew />} />
          <Route path="/projects/:id" element={<ProjectOverviewTab />} />
          <Route path="/projects/:id/team" element={<ProjectTeamTab />} />
          <Route path="/projects/:id/meetings" element={<Meetings />} />
          <Route path="/projects/:id/questions" element={<Questions />} />
          <Route path="/projects/:id/knowledge" element={<Knowledge />} />
          <Route path="/projects/:id/requirements" element={<Requirements />} />
          <Route path="/projects/:id/decisions" element={<Decisions />} />
          <Route path="/projects/:id/documents" element={<Documents />} />

          <Route path="/meetings" element={<Meetings />} />
          <Route path="/meetings/:id" element={<MeetingDetail />} />
          <Route path="/meetings/:id/preparation" element={<MeetingPreparation />} />
          <Route path="/meetings/:id/live" element={<MeetingLive />} />
          <Route path="/meetings/:id/analysis" element={<MeetingAnalysis />} />

          <Route path="/questions" element={<Questions />} />
          <Route path="/questions/faq" element={<FrequentlyAsked />} />
          <Route path="/questions/missed" element={<MissedQuestions />} />
          <Route path="/questions/frequently-missed" element={<FrequentlyMissed />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />

          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/knowledge/timeline" element={<KnowledgeTimeline />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/decisions" element={<Decisions />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
