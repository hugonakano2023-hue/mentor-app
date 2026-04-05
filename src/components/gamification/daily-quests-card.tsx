'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, Circle, Scroll } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getDailyQuests, checkQuestCompletion, type DailyQuest } from '@/lib/daily-quests';

export function DailyQuestsCard() {
  const [quests, setQuests] = React.useState<DailyQuest[]>([]);
  const [justCompleted, setJustCompleted] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    setQuests(getDailyQuests());
  }, []);

  // Periodically check quest completion
  React.useEffect(() => {
    const interval = setInterval(() => {
      const newlyDone = checkQuestCompletion();
      if (newlyDone.length > 0) {
        setJustCompleted((prev) => {
          const next = new Set(prev);
          for (const q of newlyDone) next.add(q.id);
          return next;
        });
        setQuests(getDailyQuests());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm glow-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15">
              <Scroll className="size-4 text-amber-400" />
            </div>
            <CardTitle className="text-base">Missoes do Dia</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
            {completedCount}/{quests.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        <AnimatePresence mode="popLayout">
          {quests.map((quest, idx) => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-300',
                quest.completed
                  ? 'bg-emerald-500/10'
                  : 'bg-secondary/30'
              )}
            >
              {/* Check icon */}
              {quest.completed ? (
                <motion.div
                  initial={justCompleted.has(quest.id) ? { scale: 0 } : { scale: 1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 300 }}
                >
                  <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                </motion.div>
              ) : (
                <Circle className="size-5 text-muted-foreground/40 shrink-0" />
              )}

              {/* Quest icon */}
              <span className="text-lg shrink-0">{quest.icon}</span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium truncate',
                  quest.completed && 'line-through text-muted-foreground'
                )}>
                  {quest.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {quest.description}
                </p>
              </div>

              {/* XP Badge */}
              <div className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 shrink-0',
                quest.completed
                  ? 'bg-xp/15'
                  : 'bg-secondary/50'
              )}>
                <Zap className={cn(
                  'size-3',
                  quest.completed ? 'text-xp' : 'text-muted-foreground/50'
                )} />
                <span className={cn(
                  'text-xs font-bold font-mono',
                  quest.completed ? 'text-xp' : 'text-muted-foreground/50'
                )}>
                  +{quest.xpReward}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
