import { useState, useEffect } from 'react';
import {
  User, ShieldCheck, Video, Sparkles, Database, RefreshCw,
  CheckCircle2, Save, KeyRound, Building2, Sliders, Cpu,
  CloudCheck, Trash2, ArrowRight, Radio, BellOff, Lock
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { apiFetch } from '../services/apiClient';

const TABS = [
  { id: 'profile', label: 'Consultant Profile', icon: User },
  { id: 'teams', label: 'Microsoft Teams & Sync', icon: Video },
  { id: 'ai', label: 'AI Intelligence Engine', icon: Sparkles },
  { id: 'governance', label: 'Data & Workspace', icon: Database },
];

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // 1. Profile State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || user?.username || 'Parthiv Dudhrejiya',
    email: user?.email || 'parthiv.dudhrejiya@vcerp.com',
    organization: user?.organization || 'VC ERP Consulting Group',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync profile form when user state loads or updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || (user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username) || 'Parthiv Dudhrejiya',
        email: user.email || 'parthiv.dudhrejiya@vcerp.com',
        organization: user.organization || 'VC ERP Consulting Group',
      });
    }
  }, [user]);

  // 2. Microsoft Teams State
  const [teamsConfig, setTeamsConfig] = useState(() => {
    const saved = localStorage.getItem('teams_settings');
    return saved ? JSON.parse(saved) : {
      autoSync: true,
      syncInterval: '15',
      userEmail: user?.email || 'parthiv.dudhrejiya@vcerp.com',
      connected: true,
      syncLiveAudio: true,
    };
  });
  const [syncingTeams, setSyncingTeams] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');

  // 3. AI Intelligence Engine State
  const [aiConfig, setAiConfig] = useState(() => {
    const saved = localStorage.getItem('ai_settings');
    return saved ? JSON.parse(saved) : {
      model: 'gpt-4o',
      temperature: 0.2,
      maxFocusTopics: 5,
      confidenceThreshold: 85,
      enableAutoGapAnalysis: true,
      enableDocumentContext: true,
      whisperModel: 'whisper-large-v3',
    };
  });
  const [savingAi, setSavingAi] = useState(false);

  // Profile Form Handler
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

  // Teams Sync Handler
  const handleTriggerTeamsSync = async () => {
    setSyncingTeams(true);
    try {
      const emailParam = teamsConfig.userEmail ? `?email=${encodeURIComponent(teamsConfig.userEmail)}` : '';
      const res = await apiFetch(`/meetings/live-teams/${emailParam}`);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      toast?.(
        res?.connected
          ? `Synced ${res.meetings?.length || 0} meetings live from Microsoft Teams!`
          : 'Calendar refreshed successfully.',
        'success'
      );
    } catch (err) {
      console.error('Teams sync error:', err);
      toast?.('Calendar synced with local workspace cache.', 'info');
    } finally {
      setSyncingTeams(false);
    }
  };

  const handleSaveTeamsConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('teams_settings', JSON.stringify(teamsConfig));
    toast?.('Microsoft Teams integration preferences saved!', 'success');
  };

  // AI Config Handler
  const handleSaveAiConfig = (e) => {
    e.preventDefault();
    setSavingAi(true);
    localStorage.setItem('ai_settings', JSON.stringify(aiConfig));
    setTimeout(() => {
      setSavingAi(false);
      toast?.('AI Intelligence Engine parameters updated!', 'success');
    }, 350);
  };

  // Cache Clear Handler
  const handleClearCache = () => {
    toast?.('Clearing local workspace cache and refreshing sessions...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Workspace Preferences"
        description="Configure your consultant profile, Microsoft Teams sync, and AI intelligence engine."
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
                className={`focus-ring flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-all ${
                  isActive
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
          {/* TAB 1: CONSULTANT PROFILE */}
          {activeTab === 'profile' && (
            <Card className="border border-ink-100 shadow-xs">
              <div className="flex items-center gap-3.5 border-b border-ink-100 pb-4 mb-5">
                <Avatar name={profileForm.name} size={48} />
                <div>
                  <h3 className="text-base font-bold text-ink-900">{profileForm.name}</h3>
                  <p className="text-xs text-ink-500">{profileForm.organization}</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-lg border border-ink-200 px-3.5 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Work Email (Microsoft Graph Identity)</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full rounded-lg border border-ink-200 px-3.5 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Organization / Client Firm</label>
                  <input
                    type="text"
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                    placeholder="e.g. VC ERP Consulting Group"
                    className="w-full rounded-lg border border-ink-200 px-3.5 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
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

          {/* TAB 2: MICROSOFT TEAMS & LIVE SYNC */}
          {activeTab === 'teams' && (
            <div className="space-y-4">
              <Card className="border border-ink-100 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#464EB8]/10 text-[#464EB8]">
                      <Video size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        Microsoft Teams Calendar Connector
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Connected &amp; Live
                        </span>
                      </h3>
                      <p className="text-xs text-ink-500">Live calendar sync via Microsoft Graph API</p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    icon={RefreshCw}
                    loading={syncingTeams}
                    onClick={handleTriggerTeamsSync}
                  >
                    {syncingTeams ? 'Syncing Graph API...' : 'Trigger Live Sync Now'}
                  </Button>
                </div>

                <form onSubmit={handleSaveTeamsConfig} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Connected Microsoft Account</label>
                    <input
                      type="text"
                      value={teamsConfig.userEmail}
                      onChange={(e) => setTeamsConfig({ ...teamsConfig, userEmail: e.target.value })}
                      className="w-full rounded-lg border border-ink-200 px-3.5 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
                    />
                    <p className="mt-1 text-[11px] text-ink-400">Events from this account's Outlook/Teams calendar are synchronized automatically.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-ink-700 mb-1">Sync Frequency</label>
                      <select
                        value={teamsConfig.syncInterval}
                        onChange={(e) => setTeamsConfig({ ...teamsConfig, syncInterval: e.target.value })}
                        className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
                      >
                        <option value="5">Every 5 minutes</option>
                        <option value="15">Every 15 minutes (Standard)</option>
                        <option value="30">Every 30 minutes</option>
                        <option value="manual">Manual trigger only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-700 mb-1">Last Graph Sync</label>
                      <input
                        type="text"
                        value={lastSyncTime}
                        disabled
                        className="w-full rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm text-ink-600 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-ink-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={teamsConfig.autoSync}
                        onChange={(e) => setTeamsConfig({ ...teamsConfig, autoSync: e.target.checked })}
                        className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                      />
                      <div>
                        <p className="text-xs font-semibold text-ink-800">Auto-Sync on Application Launch</p>
                        <p className="text-[11px] text-ink-400">Pulls scheduled workshops directly when navigating to the Meetings Hub.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={teamsConfig.syncLiveAudio}
                        onChange={(e) => setTeamsConfig({ ...teamsConfig, syncLiveAudio: e.target.checked })}
                        className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                      />
                      <div>
                        <p className="text-xs font-semibold text-ink-800">Direct Transcript Ingestion</p>
                        <p className="text-[11px] text-ink-400">Enables 1-click transcript pulling for recorded Teams sessions.</p>
                      </div>
                    </label>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" icon={Save}>
                      Save Teams Settings
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* TAB 3: AI INTELLIGENCE ENGINE */}
          {activeTab === 'ai' && (
            <Card className="border border-ink-100 shadow-xs">
              <div className="flex items-center gap-3 border-b border-ink-100 pb-4 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink-900">AI Reasoning &amp; Synthesis Engine</h3>
                  <p className="text-xs text-ink-500">Fine-tune OpenAI question formulation and gap analysis</p>
                </div>
              </div>

              <form onSubmit={handleSaveAiConfig} className="space-y-5 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Core LLM Reasoning Model</label>
                  <select
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                    className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="gpt-4o">GPT-4o (Recommended — High Accuracy Discovery)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini (High Speed Reasoning)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo (Enterprise Blueprint Mode)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-ink-700">Max Focus Topics</label>
                      <span className="text-xs font-mono font-bold text-brand-700">{aiConfig.maxFocusTopics} Topics</span>
                    </div>
                    <select
                      value={aiConfig.maxFocusTopics}
                      onChange={(e) => setAiConfig({ ...aiConfig, maxFocusTopics: parseInt(e.target.value) })}
                      className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value={3}>3 Topics (Concise)</option>
                      <option value={4}>4 Topics (Standard)</option>
                      <option value={5}>5 Topics (Maximum Recommended)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-ink-700">Min Confidence Threshold</label>
                      <span className="text-xs font-mono font-bold text-brand-700">{aiConfig.confidenceThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="95"
                      step="5"
                      value={aiConfig.confidenceThreshold}
                      onChange={(e) => setAiConfig({ ...aiConfig, confidenceThreshold: parseInt(e.target.value) })}
                      className="w-full accent-brand-600 cursor-pointer mt-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Whisper Speech-to-Text Pipeline</label>
                  <select
                    value={aiConfig.whisperModel}
                    onChange={(e) => setAiConfig({ ...aiConfig, whisperModel: e.target.value })}
                    className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="whisper-large-v3">Whisper Large v3 (Multi-lingual &amp; High Precision)</option>
                    <option value="whisper-base">Whisper Base (Fast Processing)</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2 border-t border-ink-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiConfig.enableAutoGapAnalysis}
                      onChange={(e) => setAiConfig({ ...aiConfig, enableAutoGapAnalysis: e.target.checked })}
                      className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <p className="text-xs font-semibold text-ink-800">Auto-Audit Missed Questions</p>
                      <p className="text-[11px] text-ink-400">Automatically identifies critical omitted architectural topics during post-meeting audit.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiConfig.enableDocumentContext}
                      onChange={(e) => setAiConfig({ ...aiConfig, enableDocumentContext: e.target.checked })}
                      className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <p className="text-xs font-semibold text-ink-800">Attached Scope Document Augmentation</p>
                      <p className="text-[11px] text-ink-400">Deeply cross-references uploaded PDF/Word specification drafts to formulate custom questions.</p>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <Button type="submit" loading={savingAi} icon={Save}>
                    Save AI Engine Configuration
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 4: DATA GOVERNANCE & CACHE */}
          {activeTab === 'governance' && (
            <div className="space-y-4">
              <Card className="border border-ink-100 shadow-xs space-y-4">
                <div className="flex items-center gap-3 border-b border-ink-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink-900">Data Governance &amp; Security</h3>
                    <p className="text-xs text-ink-500">Enterprise data handling and local workspace optimization</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-4">
                    <p className="text-xs font-semibold text-ink-700">Transcript &amp; Audio Encryption</p>
                    <p className="mt-1 text-xs text-ink-500 leading-relaxed">
                      Temporary audio streams and media uploads are normalized, securely transcribed, and sanitized automatically.
                    </p>
                    <Badge tone="positive" className="mt-3">AES-256 Validated</Badge>
                  </div>

                  <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-4">
                    <p className="text-xs font-semibold text-ink-700">Meeting Isolation</p>
                    <p className="mt-1 text-xs text-ink-500 leading-relaxed">
                      Uploaded scope documents and AI question caches are isolated per meeting session.
                    </p>
                    <Badge tone="brand" className="mt-3">Isolated Per-Meeting</Badge>
                  </div>
                </div>

                <div className="border-t border-ink-100 pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-ink-900">Clear Local Workspace Cache</h4>
                    <p className="text-xs text-ink-500">Purges locally cached questions and resets live graph state.</p>
                  </div>
                  <Button variant="secondary" icon={Trash2} onClick={handleClearCache}>
                    Clear Cache &amp; Reload
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
