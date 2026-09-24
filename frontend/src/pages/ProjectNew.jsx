import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, Trash2, ArrowLeft, ArrowRight, ShieldCheck, UserCheck, Users } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';
import { projectService } from '../services/projectService';
import { teamService } from '../services/teamService';
import { industries, sapModules } from '../config/constants';

import { useAuth } from '../context/AuthContext';

const STEPS = ['Client & Basics', 'Architecture & ERP', 'Scope Modules', 'Functional Team', 'Review & Launch'];

const ERP_SYSTEM_OPTIONS = [
  'SAP S/4HANA (Private Cloud / On-Premise)',
  'SAP S/4HANA Public Cloud (Grow with SAP / Clean Core)',
  'SAP ECC 6.0 (Legacy Modernization)',
  'SAP BTP (Business Technology Platform / Extensions)',
  'AI & Data Science Platform',
  'Custom Enterprise Architecture',
];

export default function ProjectNew() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [availableConsultants, setAvailableConsultants] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  const currentUserName = user?.name || user?.username || '';
  const currentUserEmail = user?.email || '';

  useEffect(() => {
    teamService.list().then((list) => {
      if (Array.isArray(list)) {
        setAvailableConsultants(list);
      }
    });
  }, []);

  const [form, setForm] = useState({
    name: '',
    client: '',
    industry: 'Manufacturing',
    sapProduct: 'SAP S/4HANA (Private Cloud / On-Premise)',
    modules: ['MM', 'FI', 'SD'],
    projectManager: currentUserName,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'In Progress',
    scopeDescription: '',
    team: currentUserName ? [
      { id: `lead-${Date.now()}`, name: currentUserName, role: 'Lead Solution Architect', email: currentUserEmail },
    ] : [],
  });


  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleModule = (m) => setForm((f) => ({
    ...f,
    modules: f.modules.includes(m) ? f.modules.filter((x) => x !== m) : [...f.modules, m],
  }));

  const addCustomMember = (nameOverride, roleOverride, emailOverride) => {
    const name = (nameOverride || newMemberName).trim();
    const role = (roleOverride || newMemberRole).trim() || 'Functional Consultant';
    const email = (emailOverride || newMemberEmail).trim();

    if (!name) return;

    // Check if already in team
    if (form.team.some((m) => m.name.toLowerCase() === name.toLowerCase() || (email && m.email === email))) {
      toast('Consultant already added to project team', 'info');
      return;
    }

    setForm((f) => ({
      ...f,
      team: [
        ...f.team,
        {
          id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name,
          role,
          email,
        }
      ]
    }));

    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberEmail('');
  };

  const removeMember = (id) => {
    setForm((f) => ({
      ...f,
      team: f.team.filter((m) => m.id !== id),
    }));
  };

  const toggleQuickConsultant = (consultant) => {
    const isAdded = form.team.some((m) => m.name.toLowerCase() === consultant.name.toLowerCase() || m.email === consultant.email);
    if (isAdded) {
      setForm((f) => ({
        ...f,
        team: f.team.filter((m) => m.name.toLowerCase() !== consultant.name.toLowerCase() && m.email !== consultant.email),
      }));
    } else {
      addCustomMember(consultant.name, consultant.responsibilities?.[0] || 'Functional Consultant', consultant.email);
    }
  };

  const handleNext = () => {
    if (step === 0 && (!form.name.trim() || !form.client.trim())) {
      toast('Please enter both Project Name and Client Name', 'error');
      return;
    }

    // If user typed a custom member in step 3 but forgot to press "Add", auto-add it!
    if (step === 3 && newMemberName.trim()) {
      addCustomMember();
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!form.name.trim() || !form.client.trim()) {
      toast('Project Name and Client Name are required', 'error');
      return;
    }

    // Include any typed member that was not yet added
    let finalTeam = [...form.team];
    if (newMemberName.trim()) {
      const exists = finalTeam.some((m) => m.name.toLowerCase() === newMemberName.trim().toLowerCase());
      if (!exists) {
        finalTeam.push({
          id: `member-${Date.now()}`,
          name: newMemberName.trim(),
          role: newMemberRole.trim() || 'Functional Consultant',
          email: newMemberEmail.trim(),
        });
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        client: form.client,
        industry: form.industry,
        sap_product: form.sapProduct,
        implementation_type: form.implementationType,
        modules: form.modules,
        status: form.status,
        project_manager: form.projectManager,
        start_date: form.startDate || null,
        end_date: form.endDate || null,
        scope_description: form.scopeDescription,
        team: finalTeam,
      };

      const created = await projectService.create(payload);
      toast(`Project "${created.name}" created successfully!`, 'success');
      navigate(`/projects/${created.id}`);
    } catch (err) {
      toast(err.message || 'Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'focus-ring w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 bg-white transition-all focus:border-brand-500';

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <PageHeader
        title="Create New Project"
        description="Set up an enterprise client project to organize multiple workshops, cumulative requirements, and functional leads."
      />

      {/* Stepper Header */}
      <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i < step
                    ? 'bg-success-500 text-white'
                    : i === step
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                    : 'bg-ink-100 text-ink-400'
                }`}
              >
                {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <div className="hidden sm:block min-w-0">
                <p className={`text-xs font-semibold truncate ${i === step ? 'text-brand-700' : 'text-ink-500'}`}>
                  {s}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 transition-colors ${i < step ? 'bg-success-500' : 'bg-ink-100'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-ink-900">Step 1: Client & Basic Information</h3>
            <p className="text-xs text-ink-500">Provide the client name and engagement details.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">Project Name *</label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. Torrent Pharma S/4HANA Greenfield"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">Client Name *</label>
                <input
                  className={inputClass}
                  value={form.client}
                  onChange={(e) => update('client', e.target.value)}
                  placeholder="e.g. Torrent Pharmaceuticals Ltd."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">Industry Sector</label>
                <select
                  className={inputClass}
                  value={form.industry}
                  onChange={(e) => update('industry', e.target.value)}
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">Project Status</label>
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) => update('status', e.target.value)}
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Scope & Objectives Description</label>
              <textarea
                className={inputClass}
                rows={3}
                value={form.scopeDescription}
                onChange={(e) => update('scopeDescription', e.target.value)}
                placeholder="High-level background, transformation goals, and target outcomes for this client project..."
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-ink-900">Step 2: Architecture & ERP Platform</h3>
            <p className="text-xs text-ink-500">
              Select the exact ERP architecture. The AI pre-meeting engine will generate questions tailored to this technology platform.
            </p>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-ink-700">Target ERP & Cloud Platform</label>
              <div className="grid grid-cols-1 gap-2.5">
                {ERP_SYSTEM_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => update('sapProduct', opt)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-all ${
                      form.sapProduct === opt
                        ? 'border-brand-500 bg-brand-50/70 font-semibold text-brand-900 ring-2 ring-brand-400/30'
                        : 'border-ink-200 text-ink-700 hover:bg-ink-50/60'
                    }`}
                  >
                    <span>{opt}</span>
                    {form.sapProduct === opt && <Check size={16} className="text-brand-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-ink-900">Step 3: Functional Scope Modules</h3>
            <p className="text-xs text-ink-500">Select all functional and technical modules involved in this client engagement.</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {sapModules.map((mod) => {
                const isSelected = form.modules.includes(mod);
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => toggleModule(mod)}
                    className={`focus-ring flex items-center justify-between rounded-xl border p-3 text-sm font-semibold transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-800 shadow-sm'
                        : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50/50'
                    }`}
                  >
                    <span>{mod}</span>
                    {isSelected ? (
                      <Check size={16} className="text-brand-600" />
                    ) : (
                      <Plus size={14} className="text-ink-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg bg-ink-50 p-3 text-xs text-ink-600 flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-600 shrink-0" />
              <span>
                Selected modules ({form.modules.length}): {form.modules.join(', ') || 'None'}
              </span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-ink-900">Step 4: Functional Team Assignment</h3>
                <p className="text-xs text-ink-500">Assign project manager, functional module leads, and architects to this engagement.</p>
              </div>
              <Badge tone="brand" className="gap-1">
                <Users size={12} /> {form.team.length} Member{form.team.length === 1 ? '' : 's'} Assigned
              </Badge>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Lead Project Manager</label>
              <input
                className={inputClass}
                value={form.projectManager}
                onChange={(e) => update('projectManager', e.target.value)}
                placeholder="e.g. Parthiv Dudhrejiya"
              />
            </div>

            {/* Quick-Select Existing Consultants from Database */}
            {availableConsultants.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-ink-700">Quick-Select Registered Team Members:</p>
                <div className="flex flex-wrap gap-2">
                  {availableConsultants.map((c) => {
                    const isAdded = form.team.some((m) => (m.email && m.email === c.email) || (m.name && m.name.toLowerCase() === (c.name || '').toLowerCase()));
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleQuickConsultant(c)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          isAdded
                            ? 'border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-300'
                            : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50'
                        }`}
                      >
                        {isAdded ? <Check size={12} className="text-brand-600" /> : <Plus size={12} />}
                        <span>{c.name || c.username}</span>
                        <span className="text-[10px] text-ink-400 font-normal">({c.role || 'Consultant'})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Team Members List */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-ink-700">
                Assigned Team Members ({form.team.length}):
              </label>
              <div className="space-y-2">
                {form.team.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-ink-200 bg-white p-3 text-sm shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-ink-900">{member.name}</p>
                        <p className="text-xs text-brand-700 font-medium">
                          {member.role} {member.email ? `• ${member.email}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Custom Member Form */}
            <div className="rounded-xl border border-dashed border-ink-300 p-4 bg-ink-50/60 space-y-3">
              <p className="text-xs font-bold text-ink-800">Add Other Consultant / Custom Specialist:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-ink-600 mb-1">Consultant Name *</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Chirag Modi"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ink-600 mb-1">Role / Specialization</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Senior AI / MM Architect"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ink-600 mb-1">Email Address</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. chirag@vc-erp.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addCustomMember()}
                disabled={!newMemberName.trim()}
              >
                <Plus size={14} className="mr-1" /> Add Consultant to List
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-ink-900">Step 5: Review & Launch Project</h3>
            <p className="text-xs text-ink-500">Confirm project parameters before creating the workspace.</p>

            <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink-100 bg-ink-50/60 p-4 text-sm">
              <div>
                <span className="text-xs font-medium text-ink-400">Project Name</span>
                <p className="font-semibold text-ink-900 mt-0.5">{form.name}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-ink-400">Client</span>
                <p className="font-semibold text-ink-900 mt-0.5">{form.client}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-ink-400">Industry</span>
                <p className="font-medium text-ink-800 mt-0.5">{form.industry}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-ink-400">Lead Project Manager</span>
                <p className="font-medium text-ink-800 mt-0.5">{form.projectManager || 'Lead Architect'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-medium text-ink-400">Target Technology & Architecture</span>
                <p className="font-medium text-brand-700 mt-0.5">{form.sapProduct}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-medium text-ink-400">In-Scope Modules</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {form.modules.map((m) => <Badge key={m} tone="brand">{m}</Badge>)}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-medium text-ink-400">
                  Assigned Team ({form.team.length + (newMemberName.trim() ? 1 : 0)} Consultants):
                </span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {form.team.map((m) => (
                    <span key={m.id} className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold border border-ink-200 text-ink-800 shadow-2xs">
                      {m.name} <span className="text-brand-600 font-normal">({m.role})</span>
                    </span>
                  ))}
                  {newMemberName.trim() && (
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold border border-emerald-300 text-emerald-800 shadow-2xs">
                      {newMemberName.trim()} <span className="text-emerald-600 font-normal">({newMemberRole.trim() || 'Consultant'})</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={step === 0 || loading}
        >
          <ArrowLeft size={15} className="mr-1.5" /> Back
        </Button>

        {step === STEPS.length - 1 ? (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating Project...' : 'Launch Project Workspace'}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Continue <ArrowRight size={15} className="ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
