import { useState, useEffect } from 'react';
import {
  User, Activity, ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle,
  RefreshCw, Save, Server, Sparkles, Database, FileText, Check, Clock,
  ArrowRight, ExternalLink, HelpCircle, Users, UserPlus, Trash2, Key, X, Shield, Lock
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { apiFetch } from '../services/apiClient';
import { teamService } from '../services/teamService';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('users');

  const permissions = user?.permissions || {
    canCreateUsers: user?.role === 'Admin' || user?.role === 'Team Leader' || user?.role === 'Project Manager',
    allowedRolesToCreate: user?.role === 'Admin'
      ? ['Admin', 'Team Leader', 'Project Manager', 'Consultant']
      : user?.role === 'Team Leader'
        ? ['Project Manager', 'Consultant']
        : user?.role === 'Project Manager'
          ? ['Consultant']
          : [],
    canDeleteUsers: user?.role === 'Admin' || user?.role === 'Team Leader',
  };

  const TABS = [
    { id: 'users', label: 'User & Role Access', icon: Users },
    { id: 'profile', label: 'Consultant Profile', icon: User },
    { id: 'health', label: 'Platform Health & Status', icon: Activity },
  ];

  // 1. Profile State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || user?.username || 'Parthiv Dudhrejiya',
    email: user?.email || 'parthiv.dudhrejiya@vc-erp.com',
    organization: user?.organization || 'VC ERP Consulting Group',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync profile form when user state loads or updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || (user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username) || 'Parthiv Dudhrejiya',
        email: user.email || 'parthiv.dudhrejiya@vc-erp.com',
        organization: user.organization || 'VC ERP Consulting Group',
      });
    }
  }, [user]);

  // 2. User Management State
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: permissions.allowedRolesToCreate[0] || 'Consultant',
    password: '',
  });
  const [deletingUserId, setDeletingUserId] = useState(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await teamService.list();
      setUsersList(data);
    } catch (err) {
      console.error('Failed to load user list:', err);
      toast?.('Failed to load user list.', 'critical');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      toast?.('Name and Email are required.', 'warning');
      return;
    }
    setCreatingUser(true);
    try {
      const res = await teamService.create({
        name: newUserForm.name,
        email: newUserForm.email,
        role: newUserForm.role,
        password: newUserForm.password || 'Welcome@123',
      });
      if (res?.user || res?.status === 'success') {
        toast?.(`Account successfully created for ${newUserForm.name}!`, 'success');
        setShowCreateModal(false);
        setNewUserForm({
          name: '',
          email: '',
          role: permissions.allowedRolesToCreate[0] || 'Consultant',
          password: '',
        });
        fetchUsers();
      } else {
        toast?.(res?.error || 'Failed to create user account.', 'critical');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      toast?.(err?.message || 'Failed to create user account.', 'critical');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (String(targetUser.id) === String(user?.id)) {
      toast?.('You cannot delete your own logged-in account.', 'warning');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete account "${targetUser.name || targetUser.email}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(targetUser.id);
    try {
      const res = await teamService.delete(targetUser.id);
      if (res?.error) {
        toast?.(res.error, 'critical');
      } else {
        toast?.(`User account "${targetUser.name || targetUser.email}" deleted.`, 'success');
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast?.('Failed to delete user account.', 'critical');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleUpdateRole = async (targetUser, newRole) => {
    if (targetUser.role === newRole) return;
    try {
      const res = await teamService.updateRole(targetUser.id, newRole);
      if (res?.error) {
        toast?.(res.error, 'critical');
      } else {
        toast?.(`Updated role for ${targetUser.name} to ${newRole}`, 'success');
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to update role:', err);
      toast?.('Failed to update role.', 'critical');
    }
  };

  // 3. Platform Health & Diagnostics State
  const [healthData, setHealthData] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(null);

  const runHealthCheck = async () => {
    setCheckingHealth(true);
    const start = Date.now();
    try {
      const res = await apiFetch('/meetings/health-check/');
      const elapsed = Date.now() - start;
      if (elapsed < 600) {
        await new Promise((r) => setTimeout(r, 600 - elapsed));
      }
      setHealthData(res);
      setLastCheckTime(res.timestamp || new Date().toLocaleTimeString());
      toast?.('Platform diagnostic health check completed!', 'success');
    } catch (err) {
      console.error('Health check failed:', err);
      toast?.('Diagnostic check failed to connect to backend server.', 'critical');
      setHealthData({
        overall_status: 'BACKEND SERVER ERROR',
        status_tone: 'critical',
        health_score: 0,
        passed_checks: 0,
        total_checks: 4,
        timestamp: new Date().toLocaleTimeString(),
        checks: [
          {
            id: 'server',
            name: 'Django API Server',
            category: 'Core Infrastructure',
            status: 'Offline / Unreachable',
            healthy: false,
            latency_ms: 0,
            details: 'Could not reach http://localhost:8000/api/meetings/health-check/',
            troubleshooting: 'Ensure backend server is running via `python manage.py runserver`.'
          }
        ],
        issues: [
          {
            component: 'Backend API',
            issue: 'Server connection refused or timed out.',
            fix: 'Start the Django server on port 8000.'
          }
        ]
      });
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'health' && !healthData) {
      runHealthCheck();
    }
  }, [activeTab]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const nameParts = (profileForm.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await updateProfile({
        name: profileForm.name,
        first_name: firstName,
        last_name: lastName,
        email: profileForm.email,
        organization: profileForm.organization,
      });
      toast?.('Consultant profile updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast?.('Failed to update profile. Please try again.', 'critical');
    } finally {
      setSavingProfile(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Admin': return 'brand';
      case 'Team Leader': return 'info';
      case 'Project Manager': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Role-Based Access"
        description="Manage user account provision hierarchy, consultant profiles, and system health status."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Navigation Sidebar */}
        <nav className="space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`focus-ring flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-all ${isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'text-ink-600 hover:bg-ink-100/70 hover:text-ink-900'
                  }`}
              >
                <Icon size={17} className={isActive ? 'text-white' : 'text-ink-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="min-w-0">
          {/* TAB 1: USER & ROLE ACCESS */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              {/* Role Scope Header Banner */}
              <Card className="border border-brand-200 bg-gradient-to-r from-brand-50/80 via-white to-brand-50/30 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-500/30">
                      <Shield size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-ink-900">
                          {user?.role || 'Admin'} Role Access Level
                        </h3>
                        <Badge variant={getRoleBadgeVariant(user?.role)}>
                          {user?.role || 'Admin'}
                        </Badge>
                      </div>
                      <p className="text-xs text-ink-600 mt-1">
                        {user?.role === 'Admin'
                          ? 'Full Workspace Authority — You can create Admins, Team Leaders, Project Managers, and Consultants.'
                          : user?.role === 'Team Leader'
                            ? 'Team Leadership Authority — You can provision Project Managers and Consultants.'
                            : user?.role === 'Project Manager'
                              ? 'Project Management Authority — You can provision Consultants for assigned projects.'
                              : 'Consultant Authority — View assigned project preparation and meeting intelligence.'}
                      </p>
                    </div>
                  </div>

                  {permissions.canCreateUsers && (
                    <Button
                      variant="primary"
                      icon={UserPlus}
                      onClick={() => {
                        setNewUserForm({
                          name: '',
                          email: '',
                          role: permissions.allowedRolesToCreate[0] || 'Consultant',
                          password: '',
                        });
                        setShowCreateModal(true);
                      }}
                    >
                      Create User Account
                    </Button>
                  )}
                </div>
              </Card>

              {/* Accounts Directory Table */}
              <Card className="border border-ink-100 p-0 overflow-hidden">
                <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 bg-ink-50/40">
                  <div>
                    <h3 className="text-sm font-bold text-ink-900">Registered User Accounts</h3>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Total Accounts: {usersList.length} &bull; Manage workspace access permissions
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" icon={RefreshCw} loading={loadingUsers} onClick={fetchUsers}>
                    Refresh Directory
                  </Button>
                </div>

                {loadingUsers ? (
                  <div className="p-12 text-center text-sm text-ink-500 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="animate-spin text-brand-600" size={20} />
                    <span>Loading workspace accounts...</span>
                  </div>
                ) : usersList.length === 0 ? (
                  <div className="p-12 text-center text-sm text-ink-500">
                    No user accounts found. Click "Create User Account" to provision team members.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-ink-700">
                      <thead className="border-b border-ink-100 bg-ink-50/70 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                        <tr>
                          <th className="px-5 py-3">User Member</th>
                          <th className="px-5 py-3">Email Address</th>
                          <th className="px-5 py-3">Assigned Role</th>
                          <th className="px-5 py-3">Provisioned By</th>
                          <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-100">
                        {usersList.map((u) => {
                          const isCurrentUser = String(u.id) === String(user?.id);
                          return (
                            <tr key={u.id} className="hover:bg-ink-50/40 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <Avatar name={u.name || u.email} size="sm" />
                                  <div>
                                    <div className="font-bold text-ink-900 flex items-center gap-1.5">
                                      {u.name}
                                      {isCurrentUser && (
                                        <span className="rounded bg-brand-100 px-1.5 py-0.2 text-[10px] font-semibold text-brand-700">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-ink-400 font-mono">{u.username}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-3.5 font-mono text-ink-600">
                                {u.email}
                              </td>

                              <td className="px-5 py-3.5">
                                {permissions.canDeleteUsers && !isCurrentUser ? (
                                  <select
                                    value={u.role}
                                    onChange={(e) => handleUpdateRole(u, e.target.value)}
                                    className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs font-semibold text-ink-800 focus:border-brand-500 focus:outline-none"
                                  >
                                    <option value="Admin">Admin</option>
                                    <option value="Team Leader">Team Leader</option>
                                    <option value="Project Manager">Project Manager</option>
                                    <option value="Consultant">Consultant</option>
                                  </select>
                                ) : (
                                  <Badge variant={getRoleBadgeVariant(u.role)}>
                                    {u.role}
                                  </Badge>
                                )}
                              </td>

                              <td className="px-5 py-3.5 text-ink-500 font-mono text-[11px]">
                                {u.createdBy ? u.createdBy : 'System Admin'}
                              </td>

                              <td className="px-5 py-3.5 text-right">
                                {permissions.canDeleteUsers && !isCurrentUser ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={Trash2}
                                    loading={deletingUserId === u.id}
                                    onClick={() => handleDeleteUser(u)}
                                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                  >
                                    Delete
                                  </Button>
                                ) : (
                                  <span className="text-[11px] text-ink-400 italic">
                                    {isCurrentUser ? 'Active Session' : 'Protected'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Account Provisioning Modal */}
              {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                  <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-ink-200 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                          <UserPlus size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-ink-900">Provision User Account</h3>
                          <p className="text-xs text-ink-500">Add a team member to the workspace</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleCreateUser} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-ink-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newUserForm.name}
                          onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="w-full rounded-lg border border-ink-200 px-3.5 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-ink-700 mb-1">Work Email Address</label>
                        <input
                          type="email"
                          required
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                          placeholder="e.g. john.doe@vc-erp.com"
                          className="w-full rounded-lg border border-ink-200 px-3.5 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-ink-700 mb-1">Assign Role</label>
                        <select
                          value={newUserForm.role}
                          onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                          className="w-full rounded-lg border border-ink-200 px-3.5 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                          {permissions.allowedRolesToCreate.map((r) => (
                            <option key={r} value={r}>
                              {r} {r === 'Admin' ? '(Full Executive Access)' : r === 'Team Leader' ? '(Lead Access)' : r === 'Project Manager' ? '(PM Access)' : '(Standard Consultant)'}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-[11px] text-ink-400">
                          Allowed by your role: {permissions.allowedRolesToCreate.join(', ')}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-ink-700 mb-1">Initial Password (Optional)</label>
                        <input
                          type="password"
                          value={newUserForm.password}
                          onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                          placeholder="Default: Welcome@123"
                          className="w-full rounded-lg border border-ink-200 px-3.5 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-100">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setShowCreateModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          loading={creatingUser}
                          icon={UserPlus}
                        >
                          Create Account
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONSULTANT PROFILE */}
          {activeTab === 'profile' && (
            <Card className="border border-ink-100 shadow-xs">
              <div className="flex items-center gap-3.5 border-b border-ink-100 pb-4 mb-5">
                <Avatar name={profileForm.name} size="lg" />
                <div>
                  <h3 className="text-base font-bold text-ink-900">{profileForm.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-ink-500">{profileForm.organization}</p>
                    <Badge variant={getRoleBadgeVariant(user?.role)}>
                      {user?.role || 'Admin'}
                    </Badge>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-lg border border-ink-200 px-3.5 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="Parthiv Dudhrejiya"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Work Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full rounded-lg border border-ink-200 px-3.5 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="parthiv.dudhrejiya@vc-erp.com"
                    required
                  />
                  <p className="mt-1 text-[11px] text-ink-400">Used as default identity for live Microsoft 365 calendar synchronization.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Organization / Client Firm</label>
                  <input
                    type="text"
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                    className="w-full rounded-lg border border-ink-200 px-3.5 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="VC ERP Consulting Group"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" loading={savingProfile} icon={Save}>
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 3: PLATFORM HEALTH STATUS */}
          {activeTab === 'health' && (
            <div className="space-y-5">
              {/* Main Overall Health Banner */}
              <div className={`rounded-2xl border p-5 shadow-xs transition-all ${healthData?.status_tone === 'healthy'
                ? 'border-emerald-200 bg-emerald-50/50'
                : healthData?.status_tone === 'warning'
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-rose-200 bg-rose-50/50'
                }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${healthData?.status_tone === 'healthy'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : healthData?.status_tone === 'warning'
                        ? 'bg-amber-600 text-white'
                        : 'bg-rose-600 text-white'
                      }`}>
                      {healthData?.status_tone === 'healthy' ? (
                        <ShieldCheck size={26} />
                      ) : (
                        <AlertTriangle size={26} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-ink-900">
                          {healthData?.overall_status || 'Checking Platform Status...'}
                        </h2>
                        {healthData && (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${healthData.status_tone === 'healthy'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                            }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {healthData.health_score}% Healthy
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {healthData?.status_tone === 'healthy'
                          ? `All ${healthData?.total_checks || 4} core enterprise services are operational with zero detected errors.`
                          : 'One or more platform services requires your attention. Review details below.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {lastCheckTime && (
                      <span className="text-[11px] text-ink-400 font-mono hidden md:inline">
                        Checked: {lastCheckTime}
                      </span>
                    )}
                    <Button
                      variant={healthData?.status_tone === 'healthy' ? 'secondary' : 'primary'}
                      icon={RefreshCw}
                      loading={checkingHealth}
                      onClick={runHealthCheck}
                    >
                      Run Health Check Now
                    </Button>
                  </div>
                </div>
              </div>

              {/* Component Health Check Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-ink-900">Component Diagnostic Breakdown</h3>
                  <span className="text-xs text-ink-500 font-medium">
                    {healthData?.passed_checks ?? 4} of {healthData?.total_checks ?? 4} Services Operational
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                  {(healthData?.checks || [
                    { id: 'ms_graph', name: 'Microsoft 365 Teams & Calendar Sync', status: 'Operational', healthy: true, latency_ms: 120, details: 'Azure AD integration verified.' },
                    { id: 'openai', name: 'OpenAI Intelligence Engine', status: 'Operational', healthy: true, latency_ms: 250, details: 'Model: gpt-4o-mini active.' },
                    { id: 'database', name: 'Database & Local Workspace Cache', status: 'Operational', healthy: true, latency_ms: 2, details: 'Database connection verified.' },
                    { id: 'doc_parser', name: 'Scope Document Ingestion Pipeline', status: 'Operational', healthy: true, latency_ms: 0, details: 'Multi-format PDF/Word parser ready.' }
                  ]).map((c) => {
                    let Icon = Server;
                    if (c.id === 'ms_graph') Icon = Activity;
                    if (c.id === 'openai') Icon = Sparkles;
                    if (c.id === 'database') Icon = Database;
                    if (c.id === 'doc_parser') Icon = FileText;

                    return (
                      <Card
                        key={c.id}
                        className={`border p-4 transition-all ${c.healthy
                          ? 'border-ink-100 hover:border-emerald-200 bg-white'
                          : 'border-rose-200 bg-rose-50/20'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${c.healthy ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                              <Icon size={18} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-ink-900 truncate">{c.name}</h4>
                              </div>
                              <p className="text-[11px] text-ink-500 mt-1 leading-relaxed">
                                {c.details}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col items-end gap-1">
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${c.healthy
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                              {c.healthy ? <Check size={10} /> : <AlertCircle size={10} />}
                              {c.status}
                            </span>
                            {c.latency_ms > 0 && (
                              <span className="text-[10px] text-ink-400 font-mono">
                                {c.latency_ms}ms
                              </span>
                            )}
                          </div>
                        </div>

                        {c.troubleshooting && (
                          <div className="mt-3 pt-2.5 border-t border-rose-100 bg-rose-50/60 rounded-lg p-2.5 text-[11px] text-rose-800 flex items-start gap-2">
                            <HelpCircle size={13} className="shrink-0 mt-0.5 text-rose-600" />
                            <div>
                              <span className="font-bold">Recommended Fix: </span>
                              {c.troubleshooting}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>

              {healthData?.issues && healthData.issues.length > 0 && (
                <Card className="border border-rose-200 bg-rose-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-rose-800">
                    <AlertTriangle size={17} />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Detected Issues &amp; Quick Fix Guide</h4>
                  </div>
                  <div className="space-y-2">
                    {healthData.issues.map((iss, i) => (
                      <div key={i} className="rounded-xl border border-rose-200 bg-white p-3 text-xs space-y-1">
                        <div className="font-bold text-ink-900 flex items-center gap-2">
                          <span className="rounded bg-rose-100 text-rose-800 px-1.5 py-0.5 text-[10px] font-mono uppercase">
                            {iss.component}
                          </span>
                          <span>{iss.issue}</span>
                        </div>
                        <p className="text-ink-600 text-[11px] pl-1">
                          <span className="font-semibold text-emerald-700">Resolution:</span> {iss.fix}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-4 text-xs text-ink-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Real-time platform monitors MS Graph API, OpenAI Engine, PostgreSQL Database, and Document Parsers.</span>
                </div>
                <span className="font-mono text-[11px] text-ink-400">
                  Meeting Intelligence v2.0 Enterprise
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

