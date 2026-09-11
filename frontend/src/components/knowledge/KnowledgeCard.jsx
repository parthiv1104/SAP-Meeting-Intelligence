import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function KnowledgeCard({ item }) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{item.category}</p>
        <Badge>{item.status}</Badge>
      </div>
      <h3 className="text-sm font-semibold text-ink-900">{item.title}</h3>
      <p className="text-sm leading-snug text-ink-600">{item.content}</p>
      <div className="flex items-center justify-between border-t border-ink-100 pt-2.5 text-xs text-ink-400">
        <span>Source: {item.source}</span>
        <span className="data-num font-medium text-ink-600">{item.confidence}% confidence</span>
      </div>
      <p className="text-[11px] text-ink-400">Last updated {item.lastUpdated}</p>
    </Card>
  );
}
