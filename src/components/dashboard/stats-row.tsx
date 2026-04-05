"use client";

import * as React from "react";
import { Flame, Zap, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getXPState, getLevel } from "@/lib/storage/xp-storage";
import { getCompletionForDate } from "@/lib/storage/day-plan-storage";

function useStats() {
  const [stats, setStats] = React.useState({
    streak: 0,
    longestStreak: 0,
    xp: 0,
    level: 1,
    dayProgress: 0,
    tasksCompleted: 0,
    tasksTotal: 0,
  });

  React.useEffect(() => {
    const xpState = getXPState();
    const levelInfo = getLevel();
    const today = new Date().toISOString().split("T")[0];
    const completion = getCompletionForDate(today);

    setStats({
      streak: xpState.currentStreak,
      longestStreak: xpState.longestStreak,
      xp: levelInfo.totalXP,
      level: levelInfo.level,
      dayProgress: completion.percentage,
      tasksCompleted: completion.done,
      tasksTotal: completion.total,
    });
  }, []);

  return stats;
}

function StreakCard() {
  const stats = useStats();

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-[oklch(0.22_0.04_55)] to-[oklch(0.18_0.02_55)] hover:scale-[1.02] transition-transform duration-300 glow-streak">
      <div className="absolute -top-8 -right-8 size-24 rounded-full bg-streak/5 blur-2xl pointer-events-none" />
      <CardContent className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-streak/70 mb-1">
              Streak
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-4xl font-black tracking-tighter text-streak">
                {stats.streak}
              </span>
              <span className="text-sm font-medium text-streak/60">dias</span>
            </div>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl bg-streak/10">
            <Flame className="size-6 text-streak" />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Recorde pessoal: {stats.longestStreak} dias
        </p>
      </CardContent>
    </Card>
  );
}

function XPCard() {
  const stats = useStats();
  const currentLevelXP = stats.xp % 1000;
  const xpForLevel = 1000;
  const xpPercent = Math.round((currentLevelXP / xpForLevel) * 100);

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-[oklch(0.22_0.04_145)] to-[oklch(0.18_0.02_145)] hover:scale-[1.02] transition-transform duration-300 glow-xp">
      <div className="absolute -top-8 -right-8 size-24 rounded-full bg-xp/5 blur-2xl pointer-events-none" />
      <CardContent className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-xp/70 mb-1">
              Experiencia
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-4xl font-black tracking-tighter text-xp">
                {stats.xp.toLocaleString("pt-BR")}
              </span>
              <span className="text-sm font-medium text-xp/60">XP</span>
            </div>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl bg-xp/10">
            <Zap className="size-6 text-xp" />
          </div>
        </div>

        {/* XP progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Sparkles className="size-3 text-level" />
              <span className="text-[10px] font-bold text-level">
                Level {stats.level}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
              {currentLevelXP}/{xpForLevel}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-background/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-xp to-[oklch(0.8_0.2_160)] transition-all duration-700"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DayProgressCard() {
  const stats = useStats();
  const percent = stats.dayProgress;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-[oklch(0.22_0.04_264)] to-[oklch(0.18_0.02_264)] hover:scale-[1.02] transition-transform duration-300 glow-card">
      <div className="absolute -top-8 -right-8 size-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
      <CardContent className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary/70 mb-1">
              Hoje
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-4xl font-black tracking-tighter text-primary">
                {percent}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {stats.tasksCompleted}/{stats.tasksTotal} concluidos
            </p>
          </div>

          {/* Circular progress */}
          <div className="relative flex size-16 items-center justify-center">
            <svg className="size-16 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="text-background/20"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="oklch(0.65 0.25 264)" />
                  <stop offset="100%" stopColor="oklch(0.55 0.2 300)" />
                </linearGradient>
              </defs>
            </svg>
            <CheckCircle2 className="absolute size-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StreakCard />
      <XPCard />
      <DayProgressCard />
    </div>
  );
}
