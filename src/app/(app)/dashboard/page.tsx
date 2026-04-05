'use client';

import * as React from 'react';
import { CountdownCard } from "@/components/dashboard/countdown-card";
import { StatsRow } from "@/components/dashboard/stats-row";
import { DayPlanCard } from "@/components/dashboard/day-plan-card";
import { MentorPreview } from "@/components/dashboard/mentor-preview";
import { MiniCards } from "@/components/dashboard/mini-cards";
import { WeeklyView } from "@/components/dashboard/weekly-view";
import { seedInitialData } from "@/lib/storage/seed";

export default function DashboardPage() {
  const [seeded, setSeeded] = React.useState(false);

  // Seed initial data on first load if no data exists
  React.useEffect(() => {
    seedInitialData();
    setSeeded(true);
  }, []);

  if (!seeded) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
        <div className="h-24 rounded-xl bg-secondary/30 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visao geral do seu sistema de vida
        </p>
      </div>

      {/* Countdown — Full Width */}
      <CountdownCard />

      {/* Stats Row — 3 Columns */}
      <StatsRow />

      {/* Main Content — 2 Columns on Desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Day Plan */}
        <DayPlanCard />

        {/* Right Column: Mentor + Mini Cards + Weekly */}
        <div className="flex flex-col gap-4">
          <MentorPreview />
          <MiniCards />
          <WeeklyView />
        </div>
      </div>
    </div>
  );
}
