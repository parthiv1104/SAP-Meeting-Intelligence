import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CalendarClock, CircleHelp, BrainCog,
  FileText, BarChart3, Settings, ChevronsLeft, ChevronsRight, LogOut, Building2,
} from 'lucide-react';
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
];


export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.name || user?.username || 'Consultant';

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-ink-100 bg-white transition-all ${
        collapsed ? 'w-[64px]' : 'w-[218px]'
      }`}
    >
      <div className={`flex items-center ${collapsed ? 'px-2 py-3 justify-center' : 'px-3.5 pt-4 pb-3 mb-2.5'}`}>
        <NavLink to="/dashboard" className="flex items-center w-full">
          <img
            src="/logo.png"
            alt="Meeting Intelligence Workspace"
            className={collapsed ? "h-7 w-auto max-w-[44px] object-contain" : "w-full h-auto max-h-14 object-contain object-left"}
          />
        </NavLink>
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
