'use client';

import * as React from 'react';
import {
  Moon,
  Sun,
  Droplets,
  Plus,
  Minus,
  Cannabis,
  Clock,
  Brain,
  BookOpen,
  Dumbbell,
  Check,
  X,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface CheckinData {
  sleepTime: string;
  wakeTime: string;
  weed: boolean;
  weedBefore22: boolean;
  waterCups: number;
  meditation: boolean;
  meditationMinutes: number;
  reading: boolean;
  readingPages: number;
  exerciseDone: boolean;
}

function calculateSleepDuration(sleepTime: string, wakeTime: string): string {
  if (!sleepTime || !wakeTime) return '--h --min';
  const [sh, sm] = sleepTime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let sleepMinutes = sh * 60 + sm;
  let wakeMinutes = wh * 60 + wm;
  if (wakeMinutes <= sleepMinutes) wakeMinutes += 24 * 60;
  const diff = wakeMinutes - sleepMinutes;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}min`;
}

export function DailyCheckin() {
  const [data, setData] = React.useState<CheckinData>({
    sleepTime: '00:30',
    wakeTime: '07:15',
    weed: false,
    weedBefore22: false,
    waterCups: 3,
    meditation: false,
    meditationMinutes: 0,
    reading: false,
    readingPages: 0,
    exerciseDone: true,
  });

  const sleepDuration = calculateSleepDuration(data.sleepTime, data.wakeTime);
  const waterGoal = 8;

  const today = new Date();
  const dayName = today.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <Card className="border-primary/20 glow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
                <Check className="size-4 text-primary" />
              </div>
              Check-in de Hoje
            </CardTitle>
            <CardDescription className="capitalize mt-1">
              {dayName}, {dateStr}
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">
            Em andamento
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Sono */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Moon className="size-4 text-indigo-400" />
            <Label className="text-sm font-semibold">Sono</Label>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Dormiu</Label>
              <Input
                type="time"
                value={data.sleepTime}
                onChange={(e) =>
                  setData((d) => ({ ...d, sleepTime: e.target.value }))
                }
                className="font-mono text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Acordou</Label>
              <Input
                type="time"
                value={data.wakeTime}
                onChange={(e) =>
                  setData((d) => ({ ...d, wakeTime: e.target.value }))
                }
                className="font-mono text-sm h-9"
              />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground">Duração</Label>
              <div className="flex h-9 items-center rounded-lg bg-secondary px-3">
                <Sun className="size-3.5 text-amber-400 mr-1.5" />
                <span className="font-mono text-sm font-medium">
                  {sleepDuration}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Maconha */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Cannabis className="size-4 text-green-400" />
            <Label className="text-sm font-semibold">Maconha</Label>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant={!data.weed ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    weed: false,
                    weedBefore22: false,
                  }))
                }
                className="gap-1.5"
              >
                <X className="size-3.5" />
                Não fumei
              </Button>
              <Button
                variant={data.weed ? 'default' : 'outline'}
                size="sm"
                onClick={() => setData((d) => ({ ...d, weed: true }))}
                className="gap-1.5"
              >
                <Check className="size-3.5" />
                Fumei
              </Button>
            </div>
            {data.weed && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary/80 px-3 py-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                <Label className="text-xs text-muted-foreground">
                  Antes das 22h?
                </Label>
                <Switch
                  checked={data.weedBefore22}
                  onCheckedChange={(val) =>
                    setData((d) => ({ ...d, weedBefore22: val }))
                  }
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Água */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="size-4 text-sky-400" />
              <Label className="text-sm font-semibold">Água</Label>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {data.waterCups}/{waterGoal} copos
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg"
              onClick={() =>
                setData((d) => ({
                  ...d,
                  waterCups: Math.max(0, d.waterCups - 1),
                }))
              }
            >
              <Minus className="size-3.5" />
            </Button>
            <div className="flex-1">
              <div className="flex gap-1">
                {Array.from({ length: waterGoal }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-6 flex-1 rounded-sm transition-all duration-300',
                      i < data.waterCups
                        ? 'bg-sky-500/80'
                        : 'bg-secondary'
                    )}
                  />
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg"
              onClick={() =>
                setData((d) => ({
                  ...d,
                  waterCups: Math.min(waterGoal + 4, d.waterCups + 1),
                }))
              }
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
          {data.waterCups >= waterGoal && (
            <Badge className="bg-sky-500/15 text-sky-400 border-sky-500/30">
              Meta atingida!
            </Badge>
          )}
        </div>

        <Separator />

        {/* Meditação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="size-4 text-violet-400" />
            <div className="flex items-center gap-2">
              <Checkbox
                checked={data.meditation}
                onCheckedChange={(val) =>
                  setData((d) => ({ ...d, meditation: !!val }))
                }
              />
              <Label className="text-sm font-semibold">Meditação</Label>
            </div>
          </div>
          {data.meditation && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={120}
                value={data.meditationMinutes || ''}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    meditationMinutes: Number(e.target.value),
                  }))
                }
                className="w-16 h-8 font-mono text-sm text-center"
                placeholder="min"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Leitura */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="size-4 text-amber-400" />
            <div className="flex items-center gap-2">
              <Checkbox
                checked={data.reading}
                onCheckedChange={(val) =>
                  setData((d) => ({ ...d, reading: !!val }))
                }
              />
              <Label className="text-sm font-semibold">Leitura</Label>
            </div>
          </div>
          {data.reading && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={500}
                value={data.readingPages || ''}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    readingPages: Number(e.target.value),
                  }))
                }
                className="w-16 h-8 font-mono text-sm text-center"
                placeholder="pgs"
              />
              <span className="text-xs text-muted-foreground">pgs</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Exercício */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dumbbell className="size-4 text-red-400" />
            <Label className="text-sm font-semibold">Exercício</Label>
          </div>
          <Badge
            variant={data.exerciseDone ? 'default' : 'outline'}
            className={cn(
              data.exerciseDone
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'text-muted-foreground'
            )}
          >
            {data.exerciseDone ? 'Treino registrado' : 'Sem treino hoje'}
          </Badge>
        </div>

        {/* Save button */}
        <div className="pt-2">
          <Button className="w-full gap-2">
            <Check className="size-4" />
            Salvar Check-in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
