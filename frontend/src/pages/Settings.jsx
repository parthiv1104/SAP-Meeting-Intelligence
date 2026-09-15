import { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { teamMembers, organization } from '../config/constants';

const SECTIONS = [
  'Organization', 'Users', 'Roles & Permissions', 'AI Settings',
  'Meeting Integrations', 'Microsoft Teams', 'Notifications', 'Security', 'Audit Logs',
];

const inputClass = 'focus-ring w-full max-w-md rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-800';

function Toggle({ label, description, defaultChecked = true }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-ink-800">{label}</p>
        {description && <p className="text-xs text-ink-500">{description}</p>}
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={`focus-ring h-6 w-11 rounded-full transition-colors ${on ? 'bg-brand-600' : 'bg-ink-200'}`}
      >
        <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const [section, setSection] = useState('Organization');

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Manage your organization, team access, and platform behavior." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-0.5">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`focus-ring block w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
                section === s ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
              }`}
            >
              {s}
            </button>
          ))}
        </nav>

        <div>
          {section === 'Organization' && (
            <Card className="space-y-4">
              <h3 className="text-sm font-semibold text-ink-900">Organization Profile</h3>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">Organization Name</span>
                <input className={inputClass} defaultValue={organization.name} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">Plan</span>
                <input className={inputClass} defaultValue={organization.plan} disabled />
              </label>
              <Button size="sm">Save Changes</Button>
            </Card>
          )}

          {section === 'Users' && (
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-900">Users</h3>
                <Button size="sm">Invite User</Button>
              </div>
              <div className="divide-y divide-ink-100">
                {teamMembers.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name} size={32} />
                      <div>
                        <p className="text-sm font-medium text-ink-800">{t.name}</p>
                        <p className="text-xs text-ink-500">{t.email}</p>
                      </div>
                    </div>
                    <Badge tone="neutral">{t.role}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === 'Roles & Permissions' && (
            <Card className="space-y-3">
              <h3 className="mb-1 text-sm font-semibold text-ink-900">Roles &amp; Permissions</h3>
              {['Administrator', 'Project Lead', 'Project Manager', 'SAP Functional Consultant'].map((role) => (
                <div key={role} className="flex items-center justify-between border-b border-ink-100 py-2.5 last:border-0">
                  <span className="text-sm text-ink-800">{role}</span>
                  <Button size="sm" variant="ghost">Edit Permissions</Button>
                </div>
              ))}
            </Card>
          )}

          {section === 'AI Settings' && (
            <Card>
              <h3 className="mb-1 text-sm font-semibold text-ink-900">AI Settings</h3>
              <p className="mb-2 text-xs text-ink-500">Control how question recommendations and knowledge extraction behave.</p>
              <Toggle label="Recommend questions from cross-project knowledge" description="Suggest questions learned from other projects in your organization." />
              <Toggle label="Auto-extract knowledge from uploaded documents" />
              <Toggle label="Flag frequently missed topics automatically" />
              <Toggle label="Minimum confidence to surface a recommendation" description="Below 70% confidence, recommendations are hidden by default." defaultChecked={false} />
            </Card>
          )}

          {section === 'Meeting Integrations' && (
            <Card className="space-y-2">
              <h3 className="mb-1 text-sm font-semibold text-ink-900">Meeting Integrations</h3>
              <Toggle label="Zoom" description="Auto-import recordings and transcripts from Zoom." />
              <Toggle label="Google Meet" defaultChecked={false} />
              <Toggle label="Webex" defaultChecked={false} />
            </Card>
          )}

          {section === 'Microsoft Teams' && (
            <Card className="space-y-2">
              <h3 className="mb-1 text-sm font-semibold text-ink-900">Microsoft Teams</h3>
              <Toggle label="Connect Microsoft Teams" description="Import meeting recordings and transcripts automatically." defaultChecked={false} />
              <Toggle label="Post meeting analysis summary to a Teams channel" defaultChecked={false} />
            </Card>
          )}

          {section === 'Notifications' && (
            <Card className="space-y-1">
              <h3 className="mb-1 text-sm font-semibold text-ink-900">Notification Preferences</h3>
              <Toggle label="Critical question detected" />
              <Toggle label="Meeting analysis completed" />
              <Toggle label="Requirement requires approval" />
              <Toggle label="Follow-up required" />
              <Toggle label="Knowledge changed" defaultChecked={false} />
            </Card>
          )}

          {section === 'Security' && (
            <Card className="space-y-2">
              <h3 className="mb-1 text-sm font-semibold text-ink-900">Security</h3>
              <Toggle label="Require single sign-on (SSO)" />
              <Toggle label="Require two-factor authentication" />
              <Toggle label="Restrict document downloads to project members" />
            </Card>
          )}

          {section === 'Audit Logs' && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-ink-900">Audit Logs</h3>
              <div className="space-y-2 text-sm">
                <p className="text-ink-700">Ananya Kulkarni created project "Northgate Retail Group Finance Uplift" — <span className="text-ink-400">2 days ago</span></p>
                <p className="text-ink-700">Vikram Desai updated AI Settings — <span className="text-ink-400">4 days ago</span></p>
                <p className="text-ink-700">Rahul Shah uploaded ABC_MM_SRS_Draft.docx — <span className="text-ink-400">1 week ago</span></p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
