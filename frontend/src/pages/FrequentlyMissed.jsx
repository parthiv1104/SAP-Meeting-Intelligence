import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Sparkles } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { questionService } from '../services/questionService';

export default function FrequentlyMissed() {
  const [topics, setTopics] = useState(null);

  useEffect(() => { questionService.frequentlyMissed().then(setTopics); }, []);

  if (!topics) return <SkeletonGrid count={3} />;

  const chartData = topics.map((t) => ({ topic: t.topic, missedPct: Math.round((t.missed / t.total) * 100) }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Frequently Missed Topics"
        description="Topics the platform has learned are commonly skipped in similar meetings — so they surface earlier next time."
      />

      <Card className="flex items-start gap-3 border-brand-100 bg-brand-50/40">
        <Sparkles size={16} className="mt-0.5 text-brand-500" />
        <p className="text-sm text-ink-700">
          <span className="font-semibold text-ink-900">Historical pattern detected — </span>
          the platform detected that approval escalation is frequently omitted during procurement workshops.
        </p>
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Missed Rate by Topic</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="topic" type="category" width={160} tick={{ fontSize: 12, fill: '#3d4356' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
            <Bar dataKey="missedPct" fill="#d33f34" radius={[0, 6, 6, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <Card key={t.topic}>
            <p className="text-sm font-semibold text-ink-900">{t.topic}</p>
            <p className="mt-1 text-sm text-critical-600">
              Missed in <span className="data-num font-semibold">{t.missed} / {t.total}</span> meetings
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
