import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Layers, FileText, ExternalLink, ShieldCheck, User } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function KnowledgeCard({ item, onSelect }) {
  const isDecision = item.category?.toLowerCase().includes('decision');
  const isRisk = item.category?.toLowerCase().includes('risk') || item.category?.toLowerCase().includes('issue');
  const isReq = item.category?.toLowerCase().includes('requirement');

  const getCategoryStyles = () => {
    if (isDecision) return { icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', tone: 'positive' };
    if (isRisk) return { icon: AlertTriangle, bg: 'bg-amber-50 text-amber-700 border-amber-200', tone: 'critical' };
    if (isReq) return { icon: FileText, bg: 'bg-purple-50 text-purple-700 border-purple-200', tone: 'brand' };
    return { icon: Layers, bg: 'bg-blue-50 text-blue-700 border-blue-200', tone: 'neutral' };
  };

  const config = getCategoryStyles();
  const Icon = config.icon;

  return (
    <Card
      onClick={() => onSelect && onSelect(item)}
      className="flex flex-col justify-between gap-3 border border-ink-100 shadow-xs transition hover:border-brand-300 hover:shadow-md cursor-pointer group"
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${config.bg}`}>
            <Icon size={12} />
            {item.category}
          </span>
          <Badge tone={config.tone}>{item.status || 'Verified'}</Badge>
        </div>

        <h3 className="text-sm font-bold text-ink-900 group-hover:text-brand-700 transition-colors leading-snug">
          {item.title}
        </h3>

        <p className="text-xs leading-relaxed text-ink-600 line-clamp-3">
          {item.content}
        </p>
      </div>

      <div className="space-y-2 border-t border-ink-100 pt-2.5">
        <div className="flex items-center justify-between text-[11px] text-ink-500">
          {item.meetingId ? (
            <Link
              to={`/meetings/${item.meetingId}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline truncate max-w-[160px]"
              title={item.meetingName}
            >
              <span>{item.meetingName}</span>
              <ExternalLink size={10} />
            </Link>
          ) : (
            <span className="font-medium text-ink-600 truncate max-w-[160px]">{item.meetingName || 'System Baseline'}</span>
          )}

          <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
            {item.confidence || 95}% confidence
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-ink-400">
          <span className="flex items-center gap-1">
            <User size={10} /> {item.verifiedBy || 'Project Lead'}
          </span>
          <span>{item.lastUpdated || 'Recent'}</span>
        </div>
      </div>
    </Card>
  );
}
