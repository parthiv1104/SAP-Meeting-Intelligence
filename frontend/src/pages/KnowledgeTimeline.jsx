import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { knowledgeService } from '../services/knowledgeService';

export default function KnowledgeTimeline() {
  const [items, setItems] = useState(null);

  useEffect(() => { knowledgeService.timeline().then(setItems); }, []);

  if (!items) return <SkeletonGrid count={3} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Knowledge Timeline" description="A chronological trail of how the project's memory has evolved." />
      <Card>
        <ol className="relative space-y-6 border-l border-ink-200 pl-6">
          {items.map((item, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-500" />
              <p className="text-xs font-medium text-ink-400">{item.date}</p>
              <p className="text-sm font-semibold text-ink-900">{item.type}</p>
              <p className="text-sm text-ink-600">{item.description}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
