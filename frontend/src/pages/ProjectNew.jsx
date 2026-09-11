import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { industries, sapModules, teamMembers } from '../data/mockData';
import { useToast } from '../hooks/useToast';

const STEPS = ['Basic Information', 'SAP Scope', 'SAP Modules', 'Project Team', 'Timeline', 'Confirmation'];

const initialForm = {
  name: '', client: '', industry: industries[0], description: '',
  sapProduct: 'SAP S/4HANA', sapVersion: '2023', implementationType: 'Greenfield',
  modules: [],
  projectManager: '', functionalConsultants: [], technicalConsultants: [],
  startDate: '', endDate: '', status: 'Planning',
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}

const inputClass = 'focus-ring w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-800 placeholder:text-ink-400';

export default function ProjectNew() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const navigate = useNavigate();
  const toast = useToast();

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggleModule = (m) => setForm((f) => ({
    ...f,
    modules: f.modules.includes(m) ? f.modules.filter((x) => x !== m) : [...f.modules, m],
  }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    toast?.(`"${form.name || 'New project'}" created successfully`, 'success');
    navigate('/projects');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Create Project" description="Set up a new SAP engagement in six quick steps." />

      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-1.5">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i < step ? 'bg-success-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400'
              }`}
            >
              {i < step ? <Check size={13} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? 'bg-success-500' : 'bg-ink-100'}`} />}
          </div>
        ))}
      </div>
      <p className="text-sm font-medium text-ink-700">{STEPS[step]}</p>

      <Card>
        {step === 0 && (
          <div className="space-y-4">
            <Field label="Project Name">
              <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. ABC Manufacturing SAP Transformation" />
            </Field>
            <Field label="Client">
              <input className={inputClass} value={form.client} onChange={(e) => update('client', e.target.value)} placeholder="e.g. ABC Manufacturing Ltd." />
            </Field>
            <Field label="Industry">
              <select className={inputClass} value={form.industry} onChange={(e) => update('industry', e.target.value)}>
                {industries.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Description">
              <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Brief summary of the engagement scope" />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Field label="SAP Product">
              <select className={inputClass} value={form.sapProduct} onChange={(e) => update('sapProduct', e.target.value)}>
                {['SAP S/4HANA', 'SAP S/4HANA Finance', 'SAP ECC 6.0', 'SAP Business One'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="SAP Version">
              <input className={inputClass} value={form.sapVersion} onChange={(e) => update('sapVersion', e.target.value)} />
            </Field>
            <Field label="Implementation Type">
              <select className={inputClass} value={form.implementationType} onChange={(e) => update('implementationType', e.target.value)}>
                {['Greenfield', 'Brownfield', 'Rollout', 'Support & Enhancement'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-3 text-sm text-ink-500">Select the SAP modules in scope for this engagement.</p>
            <div className="flex flex-wrap gap-2">
              {sapModules.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleModule(m)}
                  className={`focus-ring rounded-lg border px-3.5 py-2 text-sm font-medium ${
                    form.modules.includes(m) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Field label="Project Manager">
              <select className={inputClass} value={form.projectManager} onChange={(e) => update('projectManager', e.target.value)}>
                <option value="">Select a project manager</option>
                {teamMembers.map((t) => <option key={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Functional Consultants">
              <div className="flex flex-wrap gap-2">
                {teamMembers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setForm((f) => ({
                      ...f,
                      functionalConsultants: f.functionalConsultants.includes(t.id)
                        ? f.functionalConsultants.filter((x) => x !== t.id)
                        : [...f.functionalConsultants, t.id],
                    }))}
                    className={`focus-ring rounded-lg border px-3 py-1.5 text-sm ${
                      form.functionalConsultants.includes(t.id) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Date">
                <input type="date" className={inputClass} value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
              </Field>
              <Field label="Expected End Date">
                <input type="date" className={inputClass} value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
              </Field>
            </div>
            <Field label="Project Status">
              <select className={inputClass} value={form.status} onChange={(e) => update('status', e.target.value)}>
                {['Planning', 'In Progress', 'On Hold'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <p className="text-sm text-ink-500">Review the project summary before creating it.</p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-ink-400">Project Name</dt><dd className="font-medium text-ink-800">{form.name || '—'}</dd></div>
              <div><dt className="text-ink-400">Client</dt><dd className="font-medium text-ink-800">{form.client || '—'}</dd></div>
              <div><dt className="text-ink-400">Industry</dt><dd className="font-medium text-ink-800">{form.industry}</dd></div>
              <div><dt className="text-ink-400">SAP Scope</dt><dd className="font-medium text-ink-800">{form.sapProduct} ({form.implementationType})</dd></div>
              <div className="col-span-2">
                <dt className="text-ink-400 mb-1">Modules</dt>
                <dd className="flex flex-wrap gap-1.5">{form.modules.length ? form.modules.map((m) => <Badge key={m} tone="neutral">{m}</Badge>) : '—'}</dd>
              </div>
              <div><dt className="text-ink-400">Project Manager</dt><dd className="font-medium text-ink-800">{form.projectManager || '—'}</dd></div>
              <div><dt className="text-ink-400">Timeline</dt><dd className="font-medium text-ink-800">{form.startDate || '—'} to {form.endDate || '—'}</dd></div>
            </dl>
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={back} disabled={step === 0}>Back</Button>
        {step === STEPS.length - 1 ? (
          <Button onClick={submit}>Create Project</Button>
        ) : (
          <Button onClick={next}>Continue</Button>
        )}
      </div>
    </div>
  );
}
