import { useState } from 'react';
import { Outlet, useMatch } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ProjectContextBar from './ProjectContextBar';

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const projectMatch = useMatch('/projects/:id/*');

  return (
    <div className="flex min-h-screen bg-[#fafafb]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        {projectMatch && <ProjectContextBar />}
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
