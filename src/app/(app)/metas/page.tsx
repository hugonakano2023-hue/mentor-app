'use client';

import * as React from 'react';
import { Target, Plus, X, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { GoalCard, type GoalData } from '@/components/goals/goal-card';
import type { MilestoneData } from '@/components/goals/milestone-item';
import {
  getGoals,
  createGoal,
  deleteGoal,
  getMilestones,
  createMilestone,
  calculateGoalProgress,
  type StoredGoal,
} from '@/lib/storage/goal-storage';
import { getTasksForGoal } from '@/lib/storage/task-storage';

const AREAS: {
  value: StoredGoal['area'];
  label: string;
}[] = [
  { value: 'negocios', label: 'Negocios' },
  { value: 'carreira', label: 'Carreira' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'saude', label: 'Saude' },
  { value: 'pessoal', label: 'Pessoal' },
];

export default function MetasPage() {
  const [goals, setGoals] = React.useState<GoalData[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');
  const [newArea, setNewArea] = React.useState<StoredGoal['area']>('negocios');
  const [newDeadline, setNewDeadline] = React.useState('');
  const [newMilestoneTitle, setNewMilestoneTitle] = React.useState('');
  const [loaded, setLoaded] = React.useState(false);

  function loadData() {
    const storedGoals = getGoals();
    const goalDataList: GoalData[] = storedGoals.map((g) => {
      const milestones = getMilestones(g.id);
      const tasks = getTasksForGoal(g.id);

      const milestoneData: MilestoneData[] = milestones.map((m) => ({
        id: m.id,
        title: m.title,
        deadline: m.deadline ?? g.deadline ?? '',
        progress: m.progress,
        tasksCount: tasks.filter((t) => t.milestoneId === m.id).length,
      }));

      return {
        id: g.id,
        title: g.title,
        area: g.area,
        deadline: g.deadline ?? '',
        description: g.description,
        milestones: milestoneData,
      };
    });
    setGoals(goalDataList);
  }

  React.useEffect(() => {
    loadData();
    setLoaded(true);
  }, []);

  function handleCreateGoal() {
    if (!newTitle.trim()) return;

    const goal = createGoal({
      userId: 'local',
      title: newTitle.trim(),
      description: newDescription.trim(),
      deadline: newDeadline || null,
      area: newArea,
    });

    // Create initial milestone if provided
    if (newMilestoneTitle.trim()) {
      createMilestone({
        goalId: goal.id,
        title: newMilestoneTitle.trim(),
        deadline: newDeadline || null,
        progress: 0,
      });
    }

    setNewTitle('');
    setNewDescription('');
    setNewArea('negocios');
    setNewDeadline('');
    setNewMilestoneTitle('');
    setShowForm(false);
    loadData();
  }

  function handleDeleteGoal(id: string) {
    deleteGoal(id);
    loadData();
  }

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <Target className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Metas de Longo Prazo
            </h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe seus objetivos e milestones
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="size-4 mr-1.5" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="size-4 mr-1.5" />
              Nova Meta
            </>
          )}
        </Button>
      </div>

      {/* New Goal Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm">Criar Nova Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateGoal();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Titulo
                  </Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Faturar R$50k/mes"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Area</Label>
                  <Select
                    value={newArea}
                    onValueChange={(v) =>
                      setNewArea(v as StoredGoal['area'])
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AREAS.map((a) => (
                        <SelectItem key={a.value} value={a.value}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">
                  Descricao
                </Label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descreva sua meta..."
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Prazo
                  </Label>
                  <Input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Primeiro Milestone (opcional)
                  </Label>
                  <Input
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="Ex: MVP lancado"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button type="submit" disabled={!newTitle.trim()}>
                <Check className="size-4 mr-1.5" />
                Criar Meta
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals list */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {goals.map((goal) => (
            <div key={goal.id} className="relative group">
              <GoalCard goal={goal} />
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                onClick={() => handleDeleteGoal(goal.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Target className="size-8 text-primary/60" />
          </div>
          <h3 className="font-semibold">Sem metas cadastradas</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Crie sua primeira meta para comecar a acompanhar seus objetivos de
            longo prazo.
          </p>
        </div>
      )}
    </div>
  );
}
