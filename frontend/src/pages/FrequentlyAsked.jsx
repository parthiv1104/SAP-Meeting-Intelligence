import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { questionService } from '../services/questionService';

export default function FrequentlyAsked() {
  const [faq, setFaq] = useState(null);

  useEffect(() => { questionService.faq().then(setFaq); }, []);

  if (!faq) return <SkeletonGrid count={3} />;

  const topTopics = ['Approval Workflow', 'Vendor Management', 'Inventory Tolerance', 'Warehouse Slotting'];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Frequently Asked Questions"
        description="Questions repeated across meetings and projects — a sign the platform has learned to stop re-asking them from scratch."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Most Common Questions</h3>
          <Table columns={['Question', 'Frequency', 'Module', 'Last Asked', 'Status']}>
            {faq.map((f, i) => (
              <tr key={i} className="hover:bg-ink-50/60">
                <td className="px-4 py-3 max-w-sm text-ink-800">{f.question}</td>
                <td className="px-4 py-3 data-num text-ink-700">Asked {f.frequency} times</td>
                <td className="px-4 py-3"><Badge tone="neutral">{f.module}</Badge></td>
                <td className="px-4 py-3 text-ink-600">{f.lastAsked}</td>
                <td className="px-4 py-3"><Badge>{f.status}</Badge></td>
              </tr>
            ))}
          </Table>
        </Card>
        <div className="space-y-4">
          <Card>
            <h3 className="mb-2 text-sm font-semibold text-ink-900">Frequently Discussed Topics</h3>
            <div className="flex flex-wrap gap-1.5">
              {topTopics.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
            </div>
          </Card>
          <Card>
            <h3 className="mb-1 text-sm font-semibold text-ink-900">Repeated Questions Prevented</h3>
            <p className="data-num text-2xl font-semibold text-success-600">37</p>
            <p className="text-xs text-ink-500">times the platform recognized a question had already been answered elsewhere in the project.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
