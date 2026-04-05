'use client';

import * as React from 'react';
import { Heart, Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DailyCheckin } from '@/components/habits/daily-checkin';
import { HabitCard, type HabitData } from '@/components/habits/habit-card';
import { HabitInsights } from '@/components/habits/habit-insights';
import {
  getActiveHabits,
  createHabit,
  getStreak,
  getLast7Days,
  logHabit,
  getLogsForDate,
  type StoredHabit,
} from '@/lib/storage/habit-storage';
import { getCompletionForDate } from '@/lib/storage/day-plan-storage';

export default function HabitosPage() {
  const [habits, setHabits] = React.useState<StoredHabit[]>([]);
  const [habitDisplayData, setHabitDisplayData] = React.useState<HabitData[]>(
    []
  );
  const [showNewHabitForm, setShowNewHabitForm] = React.useState(false);
  const [newHabitName, setNewHabitName] = React.useState('');
  const [newHabitIcon, setNewHabitIcon] = React.useState('');
  const [loaded, setLoaded] = React.useState(false);

  function loadData() {
    const activeHabits = getActiveHabits();
    setHabits(activeHabits);

    const displayData: HabitData[] = activeHabits.map((h) => {
      const last7 = getLast7Days(h.id);
      const streak = getStreak(h.id);
      // Convert boolean[] to (boolean | null)[] — last entry is null if today not logged
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = getLogsForDate(today);
      const todayLogged = todayLogs.some((l) => l.habitId === h.id);
      const last7Display: (boolean | null)[] = last7.map((val, i) => {
        // Last item (today) is null if not logged
        if (i === 6 && !todayLogged) return null;
        return val;
      });

      return {
        name: h.name,
        icon: h.icon,
        streak,
        last7: last7Display,
      };
    });

    setHabitDisplayData(displayData);
  }

  React.useEffect(() => {
    loadData();
    setLoaded(true);
  }, []);

  function handleCreateHabit() {
    if (!newHabitName.trim()) return;
    createHabit({
      userId: 'local',
      name: newHabitName.trim(),
      type: 'boolean',
      dailyGoal: null,
      icon: newHabitIcon || '\u{2705}',
      active: true,
    });
    setNewHabitName('');
    setNewHabitIcon('');
    setShowNewHabitForm(false);
    loadData();
  }

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <Heart className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Habitos</h1>
            <p className="text-sm text-muted-foreground">
              Rastreie seus habitos diarios e veja padroes
            </p>
          </div>
        </div>
        <Button onClick={() => setShowNewHabitForm(!showNewHabitForm)}>
          {showNewHabitForm ? (
            <>
              <X className="size-4 mr-1.5" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="size-4 mr-1.5" />
              Novo Habito
            </>
          )}
        </Button>
      </div>

      {/* New Habit Form */}
      {showNewHabitForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm">Criar Novo Habito</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateHabit();
              }}
              className="flex flex-wrap items-end gap-3"
            >
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs text-muted-foreground">Nome</Label>
                <Input
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Ex: Meditar 10 minutos"
                  className="mt-1"
                />
              </div>
              <div className="w-20">
                <Label className="text-xs text-muted-foreground">Icone</Label>
                <Input
                  value={newHabitIcon}
                  onChange={(e) => setNewHabitIcon(e.target.value)}
                  placeholder=""
                  className="mt-1 text-center text-lg"
                  maxLength={4}
                />
              </div>
              <Button type="submit" disabled={!newHabitName.trim()}>
                <Check className="size-4 mr-1.5" />
                Criar
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Daily Check-in (prominent) */}
      <DailyCheckin />

      {/* Habit Cards Grid */}
      {habitDisplayData.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Seus Habitos
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {habitDisplayData.map((habit) => (
              <HabitCard key={habit.name} habit={habit} />
            ))}
          </div>
        </div>
      )}

      {habitDisplayData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Heart className="size-8 text-primary/60" />
          </div>
          <h3 className="font-semibold">Sem habitos cadastrados</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Crie seu primeiro habito para comecar a rastrear seu progresso
            diario.
          </p>
        </div>
      )}

      {/* Insights */}
      <HabitInsights />
    </div>
  );
}
