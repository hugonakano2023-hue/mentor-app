'use client';

import * as React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Award } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Insight {
  type: 'positive' | 'warning' | 'achievement';
  text: string;
}

const MOCK_INSIGHTS: Insight[] = [
  {
    type: 'positive',
    text: 'Nos dias que você dormiu antes de meia-noite, completou 92% do plano (vs 48% quando dormiu depois de 1h)',
  },
  {
    type: 'warning',
    text: 'Sua produtividade caiu 30% nos dias que fumou antes das 22h',
  },
  {
    type: 'achievement',
    text: 'Você está no melhor streak de água do mês — 6 dias! 💧',
  },
];

function InsightIcon({ type }: { type: Insight['type'] }) {
  switch (type) {
    case 'positive':
      return <TrendingUp className="size-4 shrink-0 text-emerald-400" />;
    case 'warning':
      return <AlertTriangle className="size-4 shrink-0 text-amber-400" />;
    case 'achievement':
      return <Award className="size-4 shrink-0 text-primary" />;
  }
}

export function HabitInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15">
            <Lightbulb className="size-4 text-amber-400" />
          </div>
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK_INSIGHTS.map((insight, i) => (
          <div
            key={i}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3 transition-colors',
              insight.type === 'positive' &&
                'border-emerald-500/20 bg-emerald-500/5',
              insight.type === 'warning' &&
                'border-amber-500/20 bg-amber-500/5',
              insight.type === 'achievement' &&
                'border-primary/20 bg-primary/5'
            )}
          >
            <InsightIcon type={insight.type} />
            <p className="text-sm leading-relaxed text-foreground/90">
              {insight.text}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
