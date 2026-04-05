'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Clock,
  Dumbbell,
  Target,
  Wallet,
  CreditCard,
  Flag,
  Heart,
  CalendarCheck,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Brain,
} from 'lucide-react';

import { getSession } from '@/lib/auth';
import { setValue, getValue, STORAGE_KEYS } from '@/lib/storage';
import { setUser, type UserProfile } from '@/lib/storage/user-storage';
import { setOnboardingDone } from '@/lib/storage/user-storage';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

type RoutineBlockDraft = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
};

type FixedCost = {
  id: string;
  name: string;
  amount: string;
};

type DebtDraft = {
  id: string;
  creditor: string;
  totalAmount: string;
  paidAmount: string;
  interestRate: string;
  deadline: string;
};

type GoalDraft = {
  id: string;
  title: string;
  area: string;
  deadline: string;
  milestone: string;
};

type HabitDraft = {
  id: string;
  name: string;
  emoji: string;
  enabled: boolean;
  custom: boolean;
};

// ─── Step config ────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Perfil', icon: User },
  { label: 'Rotina', icon: Clock },
  { label: 'Equipamento', icon: Dumbbell },
  { label: 'Treino', icon: Target },
  { label: 'Renda', icon: Wallet },
  { label: 'Dividas', icon: CreditCard },
  { label: 'Metas', icon: Flag },
  { label: 'Habitos', icon: Heart },
  { label: 'Preview', icon: CalendarCheck },
  { label: 'Pronto!', icon: Rocket },
] as const;

let counter = 0;
function uid() {
  return `ob_${Date.now()}_${++counter}`;
}

// ─── Default data ───────────────────────────────────────────────────────────

const DEFAULT_ROUTINE: RoutineBlockDraft[] = [
  { id: uid(), name: 'Acordar', startTime: '06:00', endTime: '06:30' },
  { id: uid(), name: 'Trabalho', startTime: '08:00', endTime: '17:00' },
  { id: uid(), name: 'Academia', startTime: '17:30', endTime: '18:30' },
  { id: uid(), name: 'Bloco de Construcao', startTime: '19:00', endTime: '23:00' },
  { id: uid(), name: 'Dormir', startTime: '23:30', endTime: '06:00' },
];

const EQUIPMENT_OPTIONS = [
  'Halteres',
  'Banco ajustavel',
  'Barra de supino',
  'Estacao de cabos/polia',
  'Corda',
  'Elasticos',
  'Barra fixa',
  'Apenas peso corporal',
];

const DEFAULT_COSTS: FixedCost[] = [
  { id: uid(), name: 'Aluguel', amount: '' },
  { id: uid(), name: 'Internet', amount: '' },
  { id: uid(), name: 'Energia', amount: '' },
  { id: uid(), name: 'Plano de Saude', amount: '' },
  { id: uid(), name: 'Celular', amount: '' },
];

const DEFAULT_HABITS: HabitDraft[] = [
  { id: uid(), name: 'Sono', emoji: '\uD83C\uDF19', enabled: true, custom: false },
  { id: uid(), name: 'Maconha', emoji: '\uD83D\uDEAD', enabled: false, custom: false },
  { id: uid(), name: 'Agua', emoji: '\uD83D\uDCA7', enabled: true, custom: false },
  { id: uid(), name: 'Meditacao', emoji: '\uD83E\uDDD8', enabled: false, custom: false },
  { id: uid(), name: 'Leitura', emoji: '\uD83D\uDCD6', enabled: false, custom: false },
];

const GOAL_AREAS = [
  { value: 'negocios', label: 'Negocios' },
  { value: 'carreira', label: 'Carreira' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'saude', label: 'Saude' },
  { value: 'pessoal', label: 'Pessoal' },
];

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1 — Perfil
  const [profileName, setProfileName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [objective, setObjective] = useState('');

  // Step 2 — Rotina
  const [routineBlocks, setRoutineBlocks] = useState<RoutineBlockDraft[]>(DEFAULT_ROUTINE);

  // Step 3 — Equipamento
  const [equipment, setEquipment] = useState<string[]>([]);
  const [maxDumbbellWeight, setMaxDumbbellWeight] = useState('');

  // Step 4 — Treino config
  const [fitnessLevel, setFitnessLevel] = useState<string>('intermediario');
  const [fitnessGoal, setFitnessGoal] = useState<string>('hipertrofia');
  const [workoutDays, setWorkoutDays] = useState(5);
  const [workoutMinutes, setWorkoutMinutes] = useState(60);

  // Step 5 — Renda
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(DEFAULT_COSTS);

  // Step 6 — Dividas
  const [debts, setDebts] = useState<DebtDraft[]>([]);
  const [noDebts, setNoDebts] = useState(false);

  // Step 7 — Metas
  const [goals, setGoals] = useState<GoalDraft[]>([
    { id: uid(), title: '', area: 'negocios', deadline: '', milestone: '' },
  ]);

  // Step 8 — Habitos
  const [habits, setHabits] = useState<HabitDraft[]>(DEFAULT_HABITS);

  // Load name from session on mount
  useEffect(() => {
    const session = getSession();
    if (session?.name) {
      setProfileName(session.name);
    }
  }, []);

  // ─── Navigation ─────────────────────────────────────────────────────────

  function next() {
    saveCurrentStep();
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  function finish() {
    saveAllData();
    setOnboardingDone();
    router.replace('/dashboard');
  }

  // ─── Save helpers ───────────────────────────────────────────────────────

  const saveCurrentStep = useCallback(() => {
    const session = getSession();
    const userId = session?.id ?? 'anonymous';

    switch (step) {
      case 0: // Perfil
        setValue('mentor_onboarding_profile', {
          name: profileName,
          birthDate,
          objective,
        });
        break;
      case 1: // Rotina
        setValue('mentor_onboarding_routine', routineBlocks);
        break;
      case 2: // Equipamento
        setValue('mentor_onboarding_equipment', {
          equipment,
          maxDumbbellWeight: parseFloat(maxDumbbellWeight) || 0,
        });
        break;
      case 3: // Treino
        setValue('mentor_onboarding_workout', {
          fitnessLevel,
          fitnessGoal,
          workoutDays,
          workoutMinutes,
        });
        break;
      case 4: // Renda
        setValue('mentor_onboarding_finance', {
          monthlyIncome: parseFloat(monthlyIncome) || 0,
          fixedCosts: fixedCosts.filter((c) => c.name && c.amount),
        });
        break;
      case 5: // Dividas
        setValue('mentor_onboarding_debts', { noDebts, debts });
        break;
      case 6: // Metas
        setValue('mentor_onboarding_goals', goals.filter((g) => g.title));
        break;
      case 7: // Habitos
        setValue('mentor_onboarding_habits', habits.filter((h) => h.enabled));
        break;
    }
  }, [step, profileName, birthDate, objective, routineBlocks, equipment, maxDumbbellWeight, fitnessLevel, fitnessGoal, workoutDays, workoutMinutes, monthlyIncome, fixedCosts, noDebts, debts, goals, habits]);

  function saveAllData() {
    saveCurrentStep();

    const session = getSession();
    const userId = session?.id ?? 'anonymous';

    // Build full user profile
    const userProfile: UserProfile = {
      id: userId,
      name: profileName || session?.name || 'Usuario',
      email: session?.email || '',
      password: '', // already stored in auth
      birthDate,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      objective,
      fitnessLevel: fitnessLevel as UserProfile['fitnessLevel'],
      fitnessGoal: fitnessGoal as UserProfile['fitnessGoal'],
      workoutDaysPerWeek: workoutDays,
      workoutMinutesPerSession: workoutMinutes,
      availableEquipment: equipment,
      monthlyIncome: parseFloat(monthlyIncome) || 0,
      fixedCosts: fixedCosts
        .filter((c) => c.name && c.amount)
        .map((c) => ({ name: c.name, amount: parseFloat(c.amount) || 0 })),
      createdAt: new Date().toISOString(),
    };
    setUser(userProfile);

    // Save routine blocks
    const routineData = routineBlocks
      .filter((b) => b.name && b.startTime && b.endTime)
      .map((b) => ({
        userId,
        name: b.name,
        startTime: b.startTime,
        endTime: b.endTime,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        color: '#6366f1',
        icon: 'clock',
        subItems: [],
      }));
    setValue(STORAGE_KEYS.ROUTINE_BLOCKS, routineData.map((r, i) => ({
      ...r,
      id: `routine-${i}`,
      createdAt: new Date().toISOString(),
    })));

    // Save debts
    if (!noDebts && debts.length > 0) {
      const debtData = debts
        .filter((d) => d.creditor && d.totalAmount)
        .map((d, i) => ({
          id: `debt-${i}`,
          userId,
          creditor: d.creditor,
          totalAmount: parseFloat(d.totalAmount) || 0,
          paidAmount: parseFloat(d.paidAmount) || 0,
          interestRate: parseFloat(d.interestRate) || null,
          deadline: d.deadline || null,
          createdAt: new Date().toISOString(),
        }));
      setValue(STORAGE_KEYS.DEBTS, debtData);
    }

    // Save goals
    const goalData = goals
      .filter((g) => g.title)
      .map((g, i) => ({
        id: `goal-${i}`,
        userId,
        title: g.title,
        area: g.area,
        deadline: g.deadline || null,
        status: 'active' as const,
        progress: 0,
        createdAt: new Date().toISOString(),
      }));
    setValue(STORAGE_KEYS.GOALS, goalData);

    // Save milestones
    const milestoneData = goals
      .filter((g) => g.title && g.milestone)
      .map((g, i) => ({
        id: `milestone-${i}`,
        goalId: `goal-${i}`,
        title: g.milestone,
        done: false,
        createdAt: new Date().toISOString(),
      }));
    setValue(STORAGE_KEYS.MILESTONES, milestoneData);

    // Save habits
    const habitData = habits
      .filter((h) => h.enabled)
      .map((h, i) => ({
        id: `habit-${i}`,
        userId,
        name: h.name,
        emoji: h.emoji,
        active: true,
        createdAt: new Date().toISOString(),
      }));
    setValue(STORAGE_KEYS.HABITS, habitData);
  }

  // ─── Render step content ───────────────────────────────────────────────

  const progressPercent = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Brain className="size-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Configuracao Inicial</h1>
            <p className="text-xs text-muted-foreground">
              Passo {step + 1} de {STEPS.length} — {STEPS[step].label}
            </p>
          </div>
          <Badge variant="outline" className="text-xs tabular-nums">
            {progressPercent}%
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6 px-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < step;
            const isCurrent = i === step;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                    isDone && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary/20 text-primary ring-2 ring-primary',
                    !isDone && !isCurrent && 'bg-secondary text-muted-foreground'
                  )}
                >
                  {isDone ? <Check className="size-4" /> : <Icon className="size-3.5" />}
                </div>
                <span className="text-[9px] text-muted-foreground hidden md:block">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Content card */}
        <Card className="border-border/50 mb-6">
          <CardContent className="pt-2 min-h-[320px]">
            {step === 0 && (
              <StepPerfil
                name={profileName} setName={setProfileName}
                birthDate={birthDate} setBirthDate={setBirthDate}
                objective={objective} setObjective={setObjective}
              />
            )}
            {step === 1 && (
              <StepRotina blocks={routineBlocks} setBlocks={setRoutineBlocks} />
            )}
            {step === 2 && (
              <StepEquipamento
                equipment={equipment} setEquipment={setEquipment}
                maxWeight={maxDumbbellWeight} setMaxWeight={setMaxDumbbellWeight}
              />
            )}
            {step === 3 && (
              <StepTreino
                level={fitnessLevel} setLevel={setFitnessLevel}
                goal={fitnessGoal} setGoal={setFitnessGoal}
                days={workoutDays} setDays={setWorkoutDays}
                minutes={workoutMinutes} setMinutes={setWorkoutMinutes}
              />
            )}
            {step === 4 && (
              <StepRenda
                income={monthlyIncome} setIncome={setMonthlyIncome}
                costs={fixedCosts} setCosts={setFixedCosts}
              />
            )}
            {step === 5 && (
              <StepDividas
                debts={debts} setDebts={setDebts}
                noDebts={noDebts} setNoDebts={setNoDebts}
              />
            )}
            {step === 6 && (
              <StepMetas goals={goals} setGoals={setGoals} />
            )}
            {step === 7 && (
              <StepHabitos habits={habits} setHabits={setHabits} />
            )}
            {step === 8 && (
              <StepPreview
                routineBlocks={routineBlocks}
                profileName={profileName}
              />
            )}
            {step === 9 && (
              <StepPronto name={profileName} />
            )}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prev}
            disabled={step === 0}
            className="gap-1"
          >
            <ChevronLeft className="size-4" />
            Voltar
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={next}
              className="gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
            >
              Proximo
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={finish}
              className="gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
            >
              <Rocket className="size-4" />
              Comecar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Step Components
// ═══════════════════════════════════════════════════════════════════════════

// ─── Step 1: Perfil ─────────────────────────────────────────────────────

function StepPerfil({
  name, setName,
  birthDate, setBirthDate,
  objective, setObjective,
}: {
  name: string; setName: (v: string) => void;
  birthDate: string; setBirthDate: (v: string) => void;
  objective: string; setObjective: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-1">Sobre voce</h2>
        <p className="text-sm text-muted-foreground">
          Vamos comecar com o basico para personalizar sua experiencia.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ob-name">Nome</Label>
        <Input
          id="ob-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ob-birth">Data de nascimento</Label>
        <Input
          id="ob-birth"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ob-objective">
          O que voce quer conquistar nos proximos 12 meses?
        </Label>
        <Input
          id="ob-objective"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Ex: Lancar meu SaaS e atingir 100 clientes"
          className="h-10"
        />
      </div>
    </div>
  );
}

// ─── Step 2: Rotina ─────────────────────────────────────────────────────

function StepRotina({
  blocks,
  setBlocks,
}: {
  blocks: RoutineBlockDraft[];
  setBlocks: (v: RoutineBlockDraft[]) => void;
}) {
  function updateBlock(id: string, field: keyof RoutineBlockDraft, value: string) {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  }

  function addBlock() {
    setBlocks([...blocks, { id: uid(), name: '', startTime: '', endTime: '' }]);
  }

  function removeBlock(id: string) {
    setBlocks(blocks.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold mb-1">Rotina Fixa</h2>
        <p className="text-sm text-muted-foreground">
          Configure os blocos principais do seu dia. Voce pode editar depois.
        </p>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {blocks.map((block) => (
          <div key={block.id} className="flex items-center gap-2">
            <Input
              value={block.name}
              onChange={(e) => updateBlock(block.id, 'name', e.target.value)}
              placeholder="Nome do bloco"
              className="flex-1 h-9"
            />
            <Input
              type="time"
              value={block.startTime}
              onChange={(e) => updateBlock(block.id, 'startTime', e.target.value)}
              className="w-28 h-9"
            />
            <span className="text-xs text-muted-foreground">ate</span>
            <Input
              type="time"
              value={block.endTime}
              onChange={(e) => updateBlock(block.id, 'endTime', e.target.value)}
              className="w-28 h-9"
            />
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => removeBlock(block.id)}
              className="shrink-0"
            >
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addBlock} className="gap-1">
        <Plus className="size-3.5" />
        Adicionar bloco
      </Button>
    </div>
  );
}

// ─── Step 3: Equipamento ────────────────────────────────────────────────

function StepEquipamento({
  equipment, setEquipment,
  maxWeight, setMaxWeight,
}: {
  equipment: string[]; setEquipment: (v: string[]) => void;
  maxWeight: string; setMaxWeight: (v: string) => void;
}) {
  function toggle(item: string) {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter((e) => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-1">Equipamento de Treino</h2>
        <p className="text-sm text-muted-foreground">
          Selecione o equipamento que voce tem disponivel.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {EQUIPMENT_OPTIONS.map((item) => {
          const selected = equipment.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-all',
                selected
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
              )}
            >
              <div
                className={cn(
                  'flex size-5 items-center justify-center rounded border transition-colors',
                  selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
                )}
              >
                {selected && <Check className="size-3" />}
              </div>
              {item}
            </button>
          );
        })}
      </div>

      {equipment.includes('Halteres') && (
        <div className="space-y-2">
          <Label htmlFor="ob-max-weight">Peso maximo dos halteres (kg)</Label>
          <Input
            id="ob-max-weight"
            type="number"
            value={maxWeight}
            onChange={(e) => setMaxWeight(e.target.value)}
            placeholder="Ex: 30"
            className="h-10 w-32"
          />
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Treino config ──────────────────────────────────────────────

function StepTreino({
  level, setLevel,
  goal, setGoal,
  days, setDays,
  minutes, setMinutes,
}: {
  level: string; setLevel: (v: string) => void;
  goal: string; setGoal: (v: string) => void;
  days: number; setDays: (v: number) => void;
  minutes: number; setMinutes: (v: number) => void;
}) {
  const levels = [
    { value: 'iniciante', label: 'Iniciante', desc: 'Menos de 6 meses' },
    { value: 'intermediario', label: 'Intermediario', desc: '6 meses a 2 anos' },
    { value: 'avancado', label: 'Avancado', desc: 'Mais de 2 anos' },
  ];

  const goals = [
    { value: 'hipertrofia', label: 'Hipertrofia', desc: 'Ganho muscular' },
    { value: 'forca', label: 'Forca', desc: 'Carga maxima' },
    { value: 'resistencia', label: 'Resistencia', desc: 'Cardio + muscular' },
    { value: 'perda_gordura', label: 'Perda de Gordura', desc: 'Definicao' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-1">Configuracao de Treino</h2>
        <p className="text-sm text-muted-foreground">
          Ajuste seu programa de treino ideal.
        </p>
      </div>

      {/* Level */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nivel</Label>
        <div className="grid grid-cols-3 gap-2">
          {levels.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLevel(l.value)}
              className={cn(
                'rounded-lg border p-3 text-center transition-all',
                level === l.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/30 hover:bg-secondary/60'
              )}
            >
              <p className="text-sm font-semibold">{l.label}</p>
              <p className="text-[10px] text-muted-foreground">{l.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Goal */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Objetivo</Label>
        <div className="grid grid-cols-2 gap-2">
          {goals.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setGoal(g.value)}
              className={cn(
                'rounded-lg border p-3 text-left transition-all',
                goal === g.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/30 hover:bg-secondary/60'
              )}
            >
              <p className="text-sm font-semibold">{g.label}</p>
              <p className="text-[10px] text-muted-foreground">{g.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Days per week */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Dias por semana
          </Label>
          <Badge variant="outline" className="tabular-nums">{days}x</Badge>
        </div>
        <Slider
          min={3}
          max={6}
          value={[days]}
          onValueChange={(val) => {
            if (Array.isArray(val) && val.length > 0) setDays(val[0]);
          }}
        />
      </div>

      {/* Minutes per session */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Tempo por treino
          </Label>
          <Badge variant="outline" className="tabular-nums">{minutes} min</Badge>
        </div>
        <Slider
          min={30}
          max={90}
          value={[minutes]}
          onValueChange={(val) => {
            if (Array.isArray(val) && val.length > 0) setMinutes(val[0]);
          }}
        />
      </div>
    </div>
  );
}

// ─── Step 5: Renda ──────────────────────────────────────────────────────

function StepRenda({
  income, setIncome,
  costs, setCosts,
}: {
  income: string; setIncome: (v: string) => void;
  costs: FixedCost[]; setCosts: (v: FixedCost[]) => void;
}) {
  function updateCost(id: string, field: 'name' | 'amount', value: string) {
    setCosts(costs.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  function addCost() {
    setCosts([...costs, { id: uid(), name: '', amount: '' }]);
  }

  function removeCost(id: string) {
    setCosts(costs.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-1">Renda e Custos Fixos</h2>
        <p className="text-sm text-muted-foreground">
          Para o modulo financeiro calcular seu saldo livre.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ob-income">Renda mensal (R$)</Label>
        <Input
          id="ob-income"
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="Ex: 8000"
          className="h-10 w-48"
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Custos fixos mensais
        </Label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {costs.map((cost) => (
            <div key={cost.id} className="flex items-center gap-2">
              <Input
                value={cost.name}
                onChange={(e) => updateCost(cost.id, 'name', e.target.value)}
                placeholder="Nome"
                className="flex-1 h-9"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">R$</span>
                <Input
                  type="number"
                  value={cost.amount}
                  onChange={(e) => updateCost(cost.id, 'amount', e.target.value)}
                  placeholder="0"
                  className="w-24 h-9"
                />
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeCost(cost.id)}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addCost} className="gap-1">
          <Plus className="size-3.5" />
          Adicionar custo
        </Button>
      </div>
    </div>
  );
}

// ─── Step 6: Dividas ────────────────────────────────────────────────────

function StepDividas({
  debts, setDebts,
  noDebts, setNoDebts,
}: {
  debts: DebtDraft[]; setDebts: (v: DebtDraft[]) => void;
  noDebts: boolean; setNoDebts: (v: boolean) => void;
}) {
  function addDebt() {
    setDebts([
      ...debts,
      { id: uid(), creditor: '', totalAmount: '', paidAmount: '', interestRate: '', deadline: '' },
    ]);
  }

  function updateDebt(id: string, field: keyof DebtDraft, value: string) {
    setDebts(debts.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  }

  function removeDebt(id: string) {
    setDebts(debts.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-1">Dividas</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre suas dividas para acompanhar a quitacao.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setNoDebts(!noDebts);
          if (!noDebts) setDebts([]);
        }}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-all w-full',
          noDebts
            ? 'border-primary bg-primary/10 text-foreground'
            : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
        )}
      >
        <div
          className={cn(
            'flex size-5 items-center justify-center rounded border transition-colors',
            noDebts ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
          )}
        >
          {noDebts && <Check className="size-3" />}
        </div>
        Nao tenho dividas
      </button>

      {!noDebts && (
        <>
          <div className="space-y-4 max-h-52 overflow-y-auto pr-1">
            {debts.map((debt) => (
              <div key={debt.id} className="space-y-2 rounded-lg border border-border/50 p-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={debt.creditor}
                    onChange={(e) => updateDebt(debt.id, 'creditor', e.target.value)}
                    placeholder="Credor (ex: Nubank)"
                    className="flex-1 h-9"
                  />
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeDebt(debt.id)}
                    className="ml-2"
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Valor total (R$)</Label>
                    <Input
                      type="number"
                      value={debt.totalAmount}
                      onChange={(e) => updateDebt(debt.id, 'totalAmount', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Ja pago (R$)</Label>
                    <Input
                      type="number"
                      value={debt.paidAmount}
                      onChange={(e) => updateDebt(debt.id, 'paidAmount', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Juros % (mensal)</Label>
                    <Input
                      type="number"
                      value={debt.interestRate}
                      onChange={(e) => updateDebt(debt.id, 'interestRate', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Prazo</Label>
                    <Input
                      type="date"
                      value={debt.deadline}
                      onChange={(e) => updateDebt(debt.id, 'deadline', e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={addDebt} className="gap-1">
            <Plus className="size-3.5" />
            Adicionar divida
          </Button>
        </>
      )}
    </div>
  );
}

// ─── Step 7: Metas ──────────────────────────────────────────────────────

function StepMetas({
  goals,
  setGoals,
}: {
  goals: GoalDraft[];
  setGoals: (v: GoalDraft[]) => void;
}) {
  function updateGoal(id: string, field: keyof GoalDraft, value: string) {
    setGoals(goals.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  }

  function addGoal() {
    if (goals.length >= 3) return;
    setGoals([
      ...goals,
      { id: uid(), title: '', area: 'negocios', deadline: '', milestone: '' },
    ]);
  }

  function removeGoal(id: string) {
    setGoals(goals.filter((g) => g.id !== id));
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-1">Metas de Longo Prazo</h2>
        <p className="text-sm text-muted-foreground">
          Defina 1 a 3 metas para os proximos meses.
        </p>
      </div>

      <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
        {goals.map((goal, index) => (
          <div key={goal.id} className="space-y-2 rounded-lg border border-border/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Meta {index + 1}</span>
              {goals.length > 1 && (
                <Button variant="ghost" size="icon-xs" onClick={() => removeGoal(goal.id)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              )}
            </div>
            <Input
              value={goal.title}
              onChange={(e) => updateGoal(goal.id, 'title', e.target.value)}
              placeholder="Titulo da meta"
              className="h-9"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">Area</Label>
                <select
                  value={goal.area}
                  onChange={(e) => updateGoal(goal.id, 'area', e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                >
                  {GOAL_AREAS.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Prazo</Label>
                <Input
                  type="date"
                  value={goal.deadline}
                  onChange={(e) => updateGoal(goal.id, 'deadline', e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Marco principal</Label>
              <Input
                value={goal.milestone}
                onChange={(e) => updateGoal(goal.id, 'milestone', e.target.value)}
                placeholder="Ex: Primeiro cliente pagante"
                className="h-9"
              />
            </div>
          </div>
        ))}
      </div>

      {goals.length < 3 && (
        <Button variant="outline" size="sm" onClick={addGoal} className="gap-1">
          <Plus className="size-3.5" />
          Adicionar meta
        </Button>
      )}
    </div>
  );
}

// ─── Step 8: Habitos ────────────────────────────────────────────────────

function StepHabitos({
  habits,
  setHabits,
}: {
  habits: HabitDraft[];
  setHabits: (v: HabitDraft[]) => void;
}) {
  function toggleHabit(id: string) {
    setHabits(
      habits.map((h) => (h.id === id ? { ...h, enabled: !h.enabled } : h))
    );
  }

  function addCustomHabit() {
    setHabits([
      ...habits,
      { id: uid(), name: '', emoji: '\u2B50', enabled: true, custom: true },
    ]);
  }

  function updateCustomName(id: string, name: string) {
    setHabits(habits.map((h) => (h.id === id ? { ...h, name } : h)));
  }

  function removeHabit(id: string) {
    setHabits(habits.filter((h) => h.id !== id));
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-1">Habitos</h2>
        <p className="text-sm text-muted-foreground">
          Escolha os habitos que quer acompanhar diariamente.
        </p>
      </div>

      <div className="space-y-2">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleHabit(habit.id)}
              className={cn(
                'flex flex-1 items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-all text-left',
                habit.enabled
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
              )}
            >
              <div
                className={cn(
                  'flex size-5 items-center justify-center rounded border transition-colors shrink-0',
                  habit.enabled ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
                )}
              >
                {habit.enabled && <Check className="size-3" />}
              </div>
              <span className="text-base">{habit.emoji}</span>
              {habit.custom ? (
                <Input
                  value={habit.name}
                  onChange={(e) => updateCustomName(habit.id, e.target.value)}
                  placeholder="Nome do habito"
                  className="h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span>{habit.name}</span>
              )}
            </button>
            {habit.custom && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeHabit(habit.id)}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addCustomHabit} className="gap-1">
        <Plus className="size-3.5" />
        Adicionar habito personalizado
      </Button>
    </div>
  );
}

// ─── Step 9: Preview ────────────────────────────────────────────────────

function StepPreview({
  routineBlocks,
  profileName,
}: {
  routineBlocks: RoutineBlockDraft[];
  profileName: string;
}) {
  const validBlocks = routineBlocks
    .filter((b) => b.name && b.startTime && b.endTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-1">Preview do seu dia</h2>
        <p className="text-sm text-muted-foreground">
          Esse e o esqueleto do seu primeiro dia. O mentor vai montar isso automaticamente toda manha.
        </p>
      </div>

      <div className="space-y-1">
        {validBlocks.map((block) => (
          <div
            key={block.id}
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2"
          >
            <div className="flex items-center gap-1.5 w-28 shrink-0">
              <Clock className="size-3.5 text-primary" />
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {block.startTime} - {block.endTime}
              </span>
            </div>
            <span className="text-sm font-medium">{block.name}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
        <p className="text-xs text-muted-foreground">
          <Sparkles className="inline size-3.5 text-primary mr-1" />
          Tarefas e treinos serao inseridos automaticamente nos espacos livres entre seus blocos de rotina.
        </p>
      </div>
    </div>
  );
}

// ─── Step 10: Pronto! ───────────────────────────────────────────────────

function StepPronto({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 space-y-6">
      {/* Sparkle animation */}
      <div className="relative">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent glow-card">
          <Rocket className="size-10 text-white" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 size-6 text-xp animate-pulse" />
        <Sparkles className="absolute -bottom-1 -left-3 size-5 text-streak animate-pulse delay-300" />
        <Sparkles className="absolute top-0 -left-4 size-4 text-primary animate-pulse delay-700" />
      </div>

      <div>
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Bem-vindo ao Mentor App{name ? `, ${name}` : ''}!
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          Seu mentor pessoal esta pronto. Vamos construir algo extraordinario.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge className="bg-primary/10 text-primary border-primary/30">
          <Target className="size-3 mr-1" />
          Metas definidas
        </Badge>
        <Badge className="bg-xp/10 text-xp border-xp/30">
          <Dumbbell className="size-3 mr-1" />
          Treino configurado
        </Badge>
        <Badge className="bg-streak/10 text-streak border-streak/30">
          <Heart className="size-3 mr-1" />
          Habitos escolhidos
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Clique em <strong>Comecar</strong> para ir ao seu dashboard.
      </p>
    </div>
  );
}
