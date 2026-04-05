'use client';

import * as React from 'react';
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Calendar,
  Clock,
  Flame,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ExerciseCard } from '@/components/workout/exercise-card';
import { WorkoutTimer } from '@/components/workout/workout-timer';
import { cn } from '@/lib/utils';
import {
  getTodayWorkout,
  createWorkout,
  updateWorkout,
  completeWorkout as completeWorkoutStorage,
  getWorkoutHistory,
  type StoredWorkout,
  type StoredExercise,
} from '@/lib/storage/workout-storage';
import { addXP } from '@/lib/storage/xp-storage';
import type { ExerciseSet } from '@/types';

// ─── Default exercises (used when no workout exists for today) ────────────

const DEFAULT_EXERCISES: StoredExercise[] = [
  {
    name: 'Supino Reto com Barra',
    muscleGroup: 'Peito',
    equipment: 'Barra + Banco',
    sets: 4,
    reps: '10-12',
    weight: 60,
    restSeconds: 90,
    instructions:
      'Deite no banco, pegada na largura dos ombros. Desca a barra ate o peito, empurre ate extensao completa.',
    completed: false,
  },
  {
    name: 'Supino Inclinado com Halteres',
    muscleGroup: 'Peito',
    equipment: 'Halteres + Banco inclinado',
    sets: 4,
    reps: '10-12',
    weight: 22,
    restSeconds: 90,
    instructions:
      'Banco a 30-45 graus. Desca os halteres ate a altura do peito, suba controlado.',
    completed: false,
  },
  {
    name: 'Crucifixo na Polia',
    muscleGroup: 'Peito',
    equipment: 'Estacao de cabos',
    sets: 3,
    reps: '12-15',
    weight: 15,
    restSeconds: 60,
    instructions:
      'Polias na altura do peito. Traga as maos juntas na frente do corpo, controlando a volta.',
    completed: false,
  },
  {
    name: 'Flexao de Braco',
    muscleGroup: 'Peito',
    equipment: 'Peso corporal',
    sets: 3,
    reps: 'ate a falha',
    weight: 0,
    restSeconds: 60,
    instructions:
      'Maos na largura dos ombros. Corpo reto, desca ate o peito quase tocar o chao.',
    completed: false,
  },
  {
    name: 'Triceps Pulley',
    muscleGroup: 'Triceps',
    equipment: 'Estacao de cabos',
    sets: 4,
    reps: '12-15',
    weight: 25,
    restSeconds: 60,
    instructions:
      'Cotovelos junto ao corpo. Estenda os bracos completamente, contracao no final.',
    completed: false,
  },
  {
    name: 'Triceps Frances com Halter',
    muscleGroup: 'Triceps',
    equipment: 'Halter',
    sets: 3,
    reps: '10-12',
    weight: 12,
    restSeconds: 60,
    instructions:
      'Halter atras da cabeca com as duas maos. Estenda acima, mantendo cotovelos apontados para cima.',
    completed: false,
  },
  {
    name: 'Mergulho no Banco',
    muscleGroup: 'Triceps',
    equipment: 'Banco',
    sets: 3,
    reps: '12-15',
    weight: 0,
    restSeconds: 60,
    instructions:
      'Maos no banco atras de voce. Desca flexionando os cotovelos, suba ate extensao completa.',
    completed: false,
  },
];

type WeeklySplit = {
  day: string;
  label: string;
  type: string;
  muscles: string;
  exercises: { name: string; sets: number; reps: string }[];
};

const weeklySplit: WeeklySplit[] = [
  {
    day: 'Segunda',
    label: 'Dia A',
    type: 'Peito + Triceps',
    muscles: 'Peito, Triceps',
    exercises: [
      { name: 'Supino Reto com Barra', sets: 4, reps: '10-12' },
      { name: 'Supino Inclinado com Halteres', sets: 4, reps: '10-12' },
      { name: 'Crucifixo na Polia', sets: 3, reps: '12-15' },
      { name: 'Flexao de Braco', sets: 3, reps: 'ate a falha' },
      { name: 'Triceps Pulley', sets: 4, reps: '12-15' },
      { name: 'Triceps Frances com Halter', sets: 3, reps: '10-12' },
      { name: 'Mergulho no Banco', sets: 3, reps: '12-15' },
    ],
  },
  {
    day: 'Terca',
    label: 'Dia B',
    type: 'Costas + Biceps',
    muscles: 'Costas, Biceps',
    exercises: [
      { name: 'Barra Fixa', sets: 4, reps: '8-10' },
      { name: 'Remada Curvada', sets: 4, reps: '10-12' },
      { name: 'Puxada Alta', sets: 3, reps: '12-15' },
      { name: 'Remada Unilateral', sets: 3, reps: '10-12' },
      { name: 'Rosca Direta', sets: 4, reps: '10-12' },
      { name: 'Rosca Martelo', sets: 3, reps: '12-15' },
    ],
  },
  {
    day: 'Quarta',
    label: 'Dia C',
    type: 'Pernas + Ombros',
    muscles: 'Quadriceps, Posterior, Ombros',
    exercises: [
      { name: 'Agachamento Livre', sets: 4, reps: '8-10' },
      { name: 'Leg Press', sets: 4, reps: '10-12' },
      { name: 'Cadeira Extensora', sets: 3, reps: '12-15' },
      { name: 'Mesa Flexora', sets: 3, reps: '12-15' },
      { name: 'Desenvolvimento Militar', sets: 4, reps: '10-12' },
      { name: 'Elevacao Lateral', sets: 3, reps: '15-20' },
    ],
  },
  {
    day: 'Quinta',
    label: 'Dia D',
    type: 'Peito + Costas Composto',
    muscles: 'Peito, Costas',
    exercises: [
      { name: 'Supino Reto + Remada (superset)', sets: 4, reps: '10-12' },
      { name: 'Crucifixo + Puxada (superset)', sets: 3, reps: '12-15' },
      { name: 'Pullover', sets: 3, reps: '12-15' },
      { name: 'Flexao + Remada Renegade', sets: 3, reps: '10-12' },
    ],
  },
  {
    day: 'Sexta',
    label: 'Dia E',
    type: 'Bracos + Ombros + Core',
    muscles: 'Biceps, Triceps, Ombros, Core',
    exercises: [
      { name: 'Rosca Scott', sets: 3, reps: '10-12' },
      { name: 'Triceps Testa', sets: 3, reps: '10-12' },
      { name: 'Elevacao Frontal', sets: 3, reps: '12-15' },
      { name: 'Face Pull', sets: 3, reps: '15-20' },
      { name: 'Prancha', sets: 3, reps: '45-60s' },
      { name: 'Abdominal Infra', sets: 3, reps: '15-20' },
    ],
  },
  {
    day: 'Sabado',
    label: 'Descanso',
    type: 'Recuperacao',
    muscles: 'Alongamento, Mobilidade',
    exercises: [],
  },
  {
    day: 'Domingo',
    label: 'Descanso',
    type: 'Recuperacao',
    muscles: 'Alongamento, Mobilidade',
    exercises: [],
  },
];

// ─── Page Component ────────────────────────────────────────────────────────

export default function TreinoPage() {
  const [workout, setWorkout] = React.useState<StoredWorkout | null>(null);
  const [history, setHistory] = React.useState<StoredWorkout[]>([]);
  const [restSeconds, setRestSeconds] = React.useState(90);
  const [showTimer, setShowTimer] = React.useState(false);
  const [workoutStarted, setWorkoutStarted] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  // Load workout data on mount
  React.useEffect(() => {
    const todayWorkout = getTodayWorkout();
    if (todayWorkout) {
      setWorkout(todayWorkout);
      setWorkoutStarted(!todayWorkout.completed && todayWorkout.exercises.some((e) => e.completed));
    }
    setHistory(getWorkoutHistory(10));
    setLoaded(true);
  }, []);

  const exercises: StoredExercise[] = workout?.exercises ?? [];
  const completedCount = exercises.filter((e) => e.completed).length;
  const totalCount = exercises.length;
  const allDone = totalCount > 0 && completedCount === totalCount;
  const workoutCompleted = workout?.completed ?? false;

  const workoutType = workout?.type ?? 'Dia A — Peito + Triceps';

  function handleGenerateWorkout() {
    const today = new Date().toISOString().split('T')[0];
    const newWorkout = createWorkout({
      userId: 'local',
      date: today,
      type: 'Dia A — Peito + Triceps',
      exercises: DEFAULT_EXERCISES,
      completed: false,
      notes: '',
      duration: null,
    });
    setWorkout(newWorkout);
  }

  function handleToggleComplete(index: number) {
    if (!workout) return;
    const updatedExercises = [...workout.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      completed: !updatedExercises[index].completed,
    };
    const updated = updateWorkout(workout.id, { exercises: updatedExercises });
    if (updated) setWorkout(updated);
  }

  function handleWeightChange(index: number, weight: number) {
    if (!workout) return;
    const updatedExercises = [...workout.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      weight,
    };
    const updated = updateWorkout(workout.id, { exercises: updatedExercises });
    if (updated) setWorkout(updated);
  }

  function handleStartRest(seconds: number) {
    setRestSeconds(seconds);
    setShowTimer(true);
  }

  function handleStartWorkout() {
    setWorkoutStarted(true);
  }

  function handleCompleteWorkout() {
    if (!workout) return;
    const completed = completeWorkoutStorage(workout.id);
    if (completed) {
      setWorkout(completed);
      addXP(20, 'Treino completado');
      setHistory(getWorkoutHistory(10));
    }
  }

  // Convert StoredExercise to ExerciseSet for the ExerciseCard component
  function toExerciseSet(ex: StoredExercise): ExerciseSet {
    return {
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      restSeconds: ex.restSeconds,
      instructions: ex.instructions,
    };
  }

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/15">
            <Dumbbell className="size-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Treino</h1>
            <p className="text-sm text-muted-foreground">
              Divisao ABC+DE — Semana 12
            </p>
          </div>
        </div>
        {workoutStarted && !workoutCompleted && (
          <Badge variant="default" className="animate-pulse gap-1">
            <Flame className="size-3" />
            Em andamento
          </Badge>
        )}
        {workoutCompleted && (
          <Badge className="gap-1 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
            <Trophy className="size-3" />
            +20 XP
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="hoje">
        <TabsList>
          <TabsTrigger value="hoje">Hoje</TabsTrigger>
          <TabsTrigger value="programa">Programa</TabsTrigger>
          <TabsTrigger value="historico">Historico</TabsTrigger>
        </TabsList>

        {/* ── Tab: Hoje ──────────────────────────────────────── */}
        <TabsContent value="hoje">
          <div className="space-y-4">
            {!workout ? (
              /* No workout for today — show generate button */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
                  <Dumbbell className="size-8 text-destructive/60" />
                </div>
                <h3 className="font-semibold">Sem treino para hoje</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mb-4">
                  Gere seu treino do dia para comecar.
                </p>
                <Button
                  onClick={handleGenerateWorkout}
                  className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  <Play className="size-4" />
                  Gerar Treino
                </Button>
              </div>
            ) : (
              <>
                {/* Workout type header card */}
                <Card className="border-0 bg-gradient-to-r from-destructive/10 via-card/80 to-card/80 glow-card">
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <Badge variant="destructive" className="mb-1.5">
                        {workoutType.split(' — ')[0] ?? 'Dia A'}
                      </Badge>
                      <h2 className="text-lg font-bold">
                        {workoutType.split(' — ')[1] ?? workoutType}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {totalCount} exercicios &middot; ~55 min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold font-mono tabular-nums">
                        {completedCount}/{totalCount}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        concluidos
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Rest timer */}
                {showTimer && (
                  <WorkoutTimer
                    seconds={restSeconds}
                    onComplete={() => setShowTimer(false)}
                  />
                )}

                {/* Exercise list */}
                <div className="space-y-3">
                  {exercises.map((exercise, index) => (
                    <ExerciseCard
                      key={exercise.name}
                      exercise={toExerciseSet(exercise)}
                      index={index}
                      completed={exercise.completed}
                      currentWeight={exercise.weight}
                      onToggleComplete={() => handleToggleComplete(index)}
                      onWeightChange={(w) => handleWeightChange(index, w)}
                      onStartRest={handleStartRest}
                    />
                  ))}
                </div>

                {/* Action button */}
                <div className="sticky bottom-4 z-10">
                  {!workoutStarted ? (
                    <Button
                      onClick={handleStartWorkout}
                      className="w-full h-12 text-base font-bold gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg"
                    >
                      <Play className="size-5" />
                      Iniciar Treino
                    </Button>
                  ) : workoutCompleted ? (
                    <Card className="border-emerald-500/30 bg-emerald-500/10">
                      <CardContent className="flex items-center gap-3">
                        <CheckCircle2 className="size-8 text-emerald-500" />
                        <div>
                          <p className="font-bold text-emerald-500">
                            Treino Concluido!
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {completedCount} exercicios completados &middot; +20
                            XP
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button
                      onClick={handleCompleteWorkout}
                      disabled={!allDone}
                      className={cn(
                        'w-full h-12 text-base font-bold gap-2 shadow-lg',
                        allDone
                          ? 'bg-emerald-500 hover:bg-emerald-500/90 text-white'
                          : ''
                      )}
                    >
                      <CheckCircle2 className="size-5" />
                      {allDone
                        ? 'Concluir Treino'
                        : `Faltam ${totalCount - completedCount} exercicios`}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Programa ──────────────────────────────────── */}
        <TabsContent value="programa">
          <div className="space-y-3">
            {weeklySplit.map((day) => {
              const isRest = day.exercises.length === 0;
              return (
                <Card
                  key={day.day}
                  className={cn(
                    'border-0 bg-card/80 backdrop-blur-sm transition-all duration-300 glow-card',
                    isRest && 'opacity-50'
                  )}
                >
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isRest ? 'secondary' : 'default'}
                          className="text-[10px]"
                        >
                          {day.label}
                        </Badge>
                        <span className="text-sm font-bold">{day.day}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {day.type}
                      </span>
                    </div>

                    {!isRest && (
                      <>
                        <Separator />
                        <div className="grid gap-1">
                          {day.exercises.map((ex) => (
                            <div
                              key={ex.name}
                              className="flex items-center justify-between py-1"
                            >
                              <span className="text-xs text-muted-foreground truncate flex-1">
                                {ex.name}
                              </span>
                              <span className="text-xs font-mono tabular-nums text-muted-foreground ml-2">
                                {ex.sets}x{ex.reps}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {isRest && (
                      <p className="text-xs text-muted-foreground">
                        Dia de recuperacao. Alongamento e mobilidade
                        recomendados.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Tab: Historico ──────────────────────────────────── */}
        <TabsContent value="historico">
          <div className="space-y-3">
            {history.map((entry) => (
              <Card
                key={entry.id}
                className="border-0 bg-card/80 backdrop-blur-sm glow-card"
              >
                <CardContent className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                    <Dumbbell className="size-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {entry.type}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Calendar className="size-2.5" />
                        {new Date(entry.date + 'T00:00:00').toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Dumbbell className="size-2.5" />
                        {entry.exercises.length} exercicios
                      </span>
                      {entry.duration && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Clock className="size-2.5" />
                          {entry.duration}min
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-xp/10 text-xp border-xp/30 text-[10px]">
                    +20 XP
                  </Badge>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}

            {history.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
                  <Dumbbell className="size-8 text-destructive/60" />
                </div>
                <h3 className="font-semibold">Nenhum treino registrado</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Complete seu primeiro treino para comecar a construir seu
                  historico.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
