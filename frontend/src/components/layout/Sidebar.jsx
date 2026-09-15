import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CalendarClock, CircleHelp, BrainCog,
  FileText, BarChart3, Settings, ChevronsLeft, ChevronsRight, LogOut, Building2,
} from 'lucide-react';
import LogoMark from '../ui/LogoMark';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { organization } from '../../config/constants';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/meetings', label: 'Meetings', icon: CalendarClock },
  { to: '/questions', label: 'Questions', icon: CircleHelp },
  { to: '/knowledge', label: 'Knowledge', icon: BrainCog },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.name || user?.username || 'Consultant';
  const displayRole = user?.role || 'Project Lead';

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-ink-100 bg-white transition-all ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      <div className="flex items-center gap-2.5 px-4 py-5">
        <LogoMark size={28} />
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-ink-900">ProjectIQ</p>
            <p className="text-[11px] text-ink-400">Meeting Intelligence</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `focus-ring flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={17} strokeWidth={2} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-ink-100 px-2.5 py-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `focus-ring flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium ${
              isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
            }`
          }
        >
          <Settings size={17} />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <div className="mt-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <Avatar name={displayName} size={30} />
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-ink-800">{displayName}</p>
              <p className="truncate text-xs text-ink-400">{displayRole}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-ink-400">
            <Building2 size={13} />
            <span className="truncate">{user?.organization || organization.name}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="focus-ring flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut size={16} />
          {!collapsed && <span>Log out</span>}
        </button>

        <button
          onClick={onToggle}
          className="focus-ring mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-ink-100 py-1.5 text-ink-400 hover:bg-ink-50"
        >
          {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        </button>
      </div>
    </aside>
  );
}
