/**
 * Seed Data for Local Development
 *
 * Populates localStorage with realistic mock data for Hugo's profile.
 * Only seeds if the data doesn't already exist (safe to call multiple times).
 */
import { v4 as uuidv4 } from 'uuid';
import { getValue, setValue, setCollection, getCollection, STORAGE_KEYS } from './index';
import type { UserProfile } from './user-storage';
import type { StoredRoutineBlock } from './routine-storage';
import type { StoredTask } from './task-storage';
import type { StoredDayPlan, StoredDayPlanItem } from './day-plan-storage';
import type { StoredWorkout } from './workout-storage';
import type { StoredTransaction, StoredDebt } from './finance-storage';
import type { StoredHabit, StoredHabitLog } from './habit-storage';
import type { StoredGoal, StoredMilestone } from './goal-storage';
import type { XPState } from './xp-storage';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function isoNow(): string {
  return new Date().toISOString();
}

function entity(overrides?: { createdAt?: string }): { id: string; createdAt: string } {
  return { id: uuidv4(), createdAt: overrides?.createdAt ?? isoNow() };
}

export function seedInitialData(): void {
  // Only seed if no user exists
  if (getValue(STORAGE_KEYS.USER)) return;

  // ─── User Profile ────────────────────────────────────
  const userId = uuidv4();
  const user: UserProfile = {
    id: userId,
    name: 'Hugo',
    email: 'hugo@mentorapp.dev',
    password: '$2b$10$placeholder_hash',
    birthDate: '1997-03-15',
    timezone: 'America/Sao_Paulo',
    objective: 'Construir meu negocio digital, quitar dividas e manter saude em dia',
    fitnessLevel: 'intermediario',
    fitnessGoal: 'hipertrofia',
    workoutDaysPerWeek: 5,
    workoutMinutesPerSession: 60,
    availableEquipment: ['academia_completa'],
    monthlyIncome: 5000,
    fixedCosts: [
      { name: 'Aluguel', amount: 1200 },
      { name: 'Internet', amount: 120 },
      { name: 'Celular', amount: 55 },
      { name: 'Streaming', amount: 45 },
    ],
    createdAt: isoNow(),
  };
  setValue(STORAGE_KEYS.USER, user);
  setValue(STORAGE_KEYS.ONBOARDING_DONE, true);

  // ─── Routine Blocks ──────────────────────────────────
  const weekdays = [1, 2, 3, 4, 5];
  const allDays = [0, 1, 2, 3, 4, 5, 6];

  const routineBlocks: StoredRoutineBlock[] = [
    {
      ...entity(),
      userId,
      name: 'Acordar',
      startTime: '06:00',
      endTime: '07:00',
      daysOfWeek: allDays,
      color: '#F59E0B',
      icon: '☀️',
      subItems: [
        { id: uuidv4(), label: 'Levantar sem snooze', checked: false },
        { id: uuidv4(), label: 'Agua com limao', checked: false },
        { id: uuidv4(), label: 'Meditacao 10min', checked: false },
      ],
    },
    {
      ...entity(),
      userId,
      name: 'Estudo Matinal',
      startTime: '07:00',
      endTime: '09:00',
      daysOfWeek: weekdays,
      color: '#3B82F6',
      icon: '📚',
      subItems: [
        { id: uuidv4(), label: 'Revisar metas do dia', checked: false },
        { id: uuidv4(), label: 'Estudar programacao', checked: false },
        { id: uuidv4(), label: 'Praticar ingles', checked: false },
      ],
    },
    {
      ...entity(),
      userId,
      name: 'Trabalho',
      startTime: '09:00',
      endTime: '18:00',
      daysOfWeek: weekdays,
      color: '#10B981',
      icon: '💻',
      subItems: [
        { id: uuidv4(), label: 'Revisar PRs pendentes', checked: false },
        { id: uuidv4(), label: 'Bloco foco 2h', checked: false },
        { id: uuidv4(), label: 'Reuniao daily', checked: false },
        { id: uuidv4(), label: 'Bloco foco 2h (tarde)', checked: false },
      ],
    },
    {
      ...entity(),
      userId,
      name: 'Academia',
      startTime: '18:30',
      endTime: '19:30',
      daysOfWeek: [1, 2, 3, 4, 5],
      color: '#EF4444',
      icon: '🏋️',
      subItems: [
        { id: uuidv4(), label: 'Aquecimento 5min', checked: false },
        { id: uuidv4(), label: 'Treino do dia', checked: false },
        { id: uuidv4(), label: 'Alongamento', checked: false },
      ],
    },
    {
      ...entity(),
      userId,
      name: 'Bloco de Construcao',
      startTime: '20:00',
      endTime: '22:00',
      daysOfWeek: weekdays,
      color: '#8B5CF6',
      icon: '🚀',
      subItems: [
        { id: uuidv4(), label: 'Trabalhar no 4LeafTech', checked: false },
        { id: uuidv4(), label: 'Trabalhar no LuckBet', checked: false },
      ],
    },
    {
      ...entity(),
      userId,
      name: 'Dormir',
      startTime: '23:00',
      endTime: '23:30',
      daysOfWeek: allDays,
      color: '#6366F1',
      icon: '🌙',
      subItems: [
        { id: uuidv4(), label: 'Desligar telas', checked: false },
        { id: uuidv4(), label: 'Leitura 20min', checked: false },
        { id: uuidv4(), label: 'Revisar dia no app', checked: false },
      ],
    },
  ];
  setCollection(STORAGE_KEYS.ROUTINE_BLOCKS, routineBlocks);

  // ─── Goals & Milestones ──────────────────────────────
  const goal4Leaf = { ...entity(), userId, title: '4LeafTech — Lancar MVP', description: 'Lancar a primeira versao da plataforma 4LeafTech', deadline: '2026-06-30', area: 'negocios' as const };
  const goalLuckBet = { ...entity(), userId, title: 'LuckBet — Validar produto', description: 'Construir e validar o produto LuckBet com usuarios reais', deadline: '2026-09-01', area: 'negocios' as const };
  const goalDividas = { ...entity(), userId, title: 'Quitar Dividas', description: 'Eliminar todas as dividas pendentes', deadline: '2026-12-31', area: 'financeiro' as const };
  const goalSaude = { ...entity(), userId, title: 'Saude em Dia', description: 'Manter rotina de treino e alimentacao consistente', deadline: null, area: 'saude' as const };

  const goals: StoredGoal[] = [goal4Leaf, goalLuckBet, goalDividas, goalSaude];
  setCollection(STORAGE_KEYS.GOALS, goals);

  const milestones: StoredMilestone[] = [
    { ...entity(), goalId: goal4Leaf.id, title: 'Definir stack e arquitetura', deadline: '2026-04-15', progress: 80 },
    { ...entity(), goalId: goal4Leaf.id, title: 'Backend API pronto', deadline: '2026-05-15', progress: 30 },
    { ...entity(), goalId: goal4Leaf.id, title: 'Frontend MVP pronto', deadline: '2026-06-15', progress: 10 },
    { ...entity(), goalId: goalLuckBet.id, title: 'Pesquisa de mercado', deadline: '2026-05-01', progress: 60 },
    { ...entity(), goalId: goalLuckBet.id, title: 'Prototipo funcional', deadline: '2026-07-01', progress: 15 },
    { ...entity(), goalId: goalLuckBet.id, title: 'Beta com 50 usuarios', deadline: '2026-09-01', progress: 0 },
    { ...entity(), goalId: goalDividas.id, title: 'Quitar Mercado Pago', deadline: '2026-06-30', progress: 20 },
    { ...entity(), goalId: goalDividas.id, title: 'Quitar Inter', deadline: '2026-09-30', progress: 10 },
    { ...entity(), goalId: goalDividas.id, title: 'Quitar amigo', deadline: '2026-12-31', progress: 0 },
    { ...entity(), goalId: goalSaude.id, title: 'Treinar 5x/semana por 3 meses', deadline: '2026-07-01', progress: 45 },
    { ...entity(), goalId: goalSaude.id, title: 'Atingir 75kg massa magra', deadline: '2026-12-31', progress: 20 },
  ];
  setCollection(STORAGE_KEYS.MILESTONES, milestones);

  // ─── Tasks ───────────────────────────────────────────
  const tasks: StoredTask[] = [
    {
      ...entity(),
      userId,
      title: 'Configurar CI/CD do 4LeafTech',
      description: 'Configurar pipeline de deploy automatico no GitHub Actions',
      estimatedMinutes: 120,
      priority: 'alta',
      category: 'Desenvolvimento',
      deadline: daysAgo(-3),
      goalId: goal4Leaf.id,
      milestoneId: milestones[0].id,
      status: 'in_progress',
      recurrence: null,
      recurrenceDays: null,
      parentTaskId: null,
      xpValue: 50,
      completedAt: null,
    },
    {
      ...entity(),
      userId,
      title: 'Modelar banco de dados LuckBet',
      description: 'Criar schema do PostgreSQL para o LuckBet',
      estimatedMinutes: 180,
      priority: 'alta',
      category: 'Desenvolvimento',
      deadline: daysAgo(-7),
      goalId: goalLuckBet.id,
      milestoneId: milestones[4].id,
      status: 'backlog',
      recurrence: null,
      recurrenceDays: null,
      parentTaskId: null,
      xpValue: 60,
      completedAt: null,
    },
    {
      ...entity(),
      userId,
      title: 'Pagar parcela Mercado Pago',
      description: 'Pagar parcela mensal da divida do Mercado Pago',
      estimatedMinutes: 10,
      priority: 'alta',
      category: 'Financeiro',
      deadline: daysAgo(-5),
      goalId: goalDividas.id,
      milestoneId: milestones[6].id,
      status: 'planned',
      recurrence: 'monthly',
      recurrenceDays: null,
      parentTaskId: null,
      xpValue: 20,
      completedAt: null,
    },
    {
      ...entity(),
      userId,
      title: 'Estudar Next.js Server Actions',
      description: 'Assistir video e praticar server actions do Next.js',
      estimatedMinutes: 90,
      priority: 'media',
      category: 'Estudo',
      deadline: null,
      goalId: goal4Leaf.id,
      milestoneId: null,
      status: 'backlog',
      recurrence: null,
      recurrenceDays: null,
      parentTaskId: null,
      xpValue: 40,
      completedAt: null,
    },
    {
      ...entity(),
      userId,
      title: 'Revisar orcamento do mes',
      description: 'Analisar gastos do mes e ajustar orcamento',
      estimatedMinutes: 30,
      priority: 'media',
      category: 'Financeiro',
      deadline: daysAgo(-2),
      goalId: goalDividas.id,
      milestoneId: null,
      status: 'backlog',
      recurrence: 'monthly',
      recurrenceDays: null,
      parentTaskId: null,
      xpValue: 25,
      completedAt: null,
    },
    {
      ...entity(),
      userId,
      title: 'Preparar apresentacao 4LeafTech',
      description: 'Montar pitch deck para potenciais investidores',
      estimatedMinutes: 240,
      priority: 'media',
      category: 'Negocios',
      deadline: daysAgo(-14),
      goalId: goal4Leaf.id,
      milestoneId: null,
      status: 'backlog',
      recurrence: null,
      recurrenceDays: null,
      parentTaskId: null,
      xpValue: 80,
      completedAt: null,
    },
    {
      ...entity(),
      userId,
      title: 'Comprar suplementos',
      description: 'Whey, creatina e multivitaminico',
      estimatedMinutes: 30,
      priority: 'baixa',
      category: 'Saude',
      deadline: daysAgo(-1),
      goalId: goalSaude.id,
      milestoneId: null,
      status: 'planned',
      recurrence: null,
      recurrenceDays: null,
      parentTaskId: null,
      xpValue: 10,
      completedAt: null,
    },
  ];
  setCollection(STORAGE_KEYS.TASKS, tasks);

  // ─── Categories ──────────────────────────────────────
  setValue(STORAGE_KEYS.CATEGORIES, [
    'Desenvolvimento',
    'Financeiro',
    'Estudo',
    'Negocios',
    'Saude',
    'Pessoal',
  ]);

  // ─── Habits ──────────────────────────────────────────
  const habits: StoredHabit[] = [
    { ...entity(), userId, name: 'Sono 7h+', type: 'boolean', dailyGoal: null, icon: '😴', active: true },
    { ...entity(), userId, name: 'Sem Maconha', type: 'boolean', dailyGoal: null, icon: '🚫', active: true },
    { ...entity(), userId, name: 'Agua 2L+', type: 'number', dailyGoal: '2000', icon: '💧', active: true },
    { ...entity(), userId, name: 'Meditacao', type: 'boolean', dailyGoal: null, icon: '🧘', active: true },
    { ...entity(), userId, name: 'Leitura', type: 'time', dailyGoal: '00:20', icon: '📖', active: true },
    { ...entity(), userId, name: 'Exercicio', type: 'boolean', dailyGoal: null, icon: '💪', active: true },
  ];
  setCollection(STORAGE_KEYS.HABITS, habits);

  // Habit logs for last 7 days
  const habitLogs: StoredHabitLog[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = daysAgo(i);
    // Sono — mostly good
    habitLogs.push({ ...entity({ createdAt: date + 'T08:00:00Z' }), habitId: habits[0].id, date, value: i === 3 ? 'false' : 'true', notes: '' });
    // Sem Maconha — good streak
    habitLogs.push({ ...entity({ createdAt: date + 'T23:00:00Z' }), habitId: habits[1].id, date, value: 'true', notes: '' });
    // Agua — varies
    const waterValues = [2200, 1800, 2500, 1500, 2100, 2000, 1900];
    habitLogs.push({ ...entity({ createdAt: date + 'T20:00:00Z' }), habitId: habits[2].id, date, value: String(waterValues[6 - i]), notes: '' });
    // Meditacao — some misses
    habitLogs.push({ ...entity({ createdAt: date + 'T07:00:00Z' }), habitId: habits[3].id, date, value: i === 2 || i === 5 ? 'false' : 'true', notes: '' });
    // Leitura — varies
    const readingTimes = ['00:25', '00:15', '00:30', '00:00', '00:20', '00:35', '00:20'];
    habitLogs.push({ ...entity({ createdAt: date + 'T23:00:00Z' }), habitId: habits[4].id, date, value: readingTimes[6 - i], notes: '' });
    // Exercicio — weekdays
    const dayOfWeek = new Date(date).getDay();
    const didExercise = dayOfWeek >= 1 && dayOfWeek <= 5;
    habitLogs.push({ ...entity({ createdAt: date + 'T19:30:00Z' }), habitId: habits[5].id, date, value: didExercise ? 'true' : 'false', notes: '' });
  }
  setCollection(STORAGE_KEYS.HABIT_LOGS, habitLogs);

  // ─── Debts ───────────────────────────────────────────
  const debts: StoredDebt[] = [
    { ...entity(), userId, creditor: 'Mercado Pago', totalAmount: 4500, paidAmount: 900, interestRate: 1.99, deadline: '2026-12-31' },
    { ...entity(), userId, creditor: 'Inter', totalAmount: 3200, paidAmount: 320, interestRate: 2.49, deadline: '2027-06-30' },
    { ...entity(), userId, creditor: 'Amigo (Pedro)', totalAmount: 1500, paidAmount: 0, interestRate: null, deadline: '2026-12-31' },
  ];
  setCollection(STORAGE_KEYS.DEBTS, debts);

  // ─── Transactions ────────────────────────────────────
  const currentMonth = today().substring(0, 7); // YYYY-MM
  const transactions: StoredTransaction[] = [
    { ...entity(), userId, amount: 5000, type: 'receita', category: 'Salario', description: 'Salario mensal', date: `${currentMonth}-05`, recurring: true },
    { ...entity(), userId, amount: 1200, type: 'despesa', category: 'Moradia', description: 'Aluguel', date: `${currentMonth}-05`, recurring: true },
    { ...entity(), userId, amount: 120, type: 'despesa', category: 'Internet', description: 'Internet fibra', date: `${currentMonth}-10`, recurring: true },
    { ...entity(), userId, amount: 55, type: 'despesa', category: 'Celular', description: 'Plano celular', date: `${currentMonth}-10`, recurring: true },
    { ...entity(), userId, amount: 45, type: 'despesa', category: 'Streaming', description: 'Netflix + Spotify', date: `${currentMonth}-10`, recurring: true },
    { ...entity(), userId, amount: 450, type: 'despesa', category: 'Dividas', description: 'Parcela Mercado Pago', date: `${currentMonth}-15`, recurring: true },
    { ...entity(), userId, amount: 320, type: 'despesa', category: 'Dividas', description: 'Parcela Inter', date: `${currentMonth}-15`, recurring: true },
    { ...entity(), userId, amount: 800, type: 'despesa', category: 'Alimentacao', description: 'Supermercado + ifood', date: `${currentMonth}-01`, recurring: false },
    { ...entity(), userId, amount: 200, type: 'despesa', category: 'Saude', description: 'Suplementos', date: `${currentMonth}-03`, recurring: false },
    { ...entity(), userId, amount: 350, type: 'receita', category: 'Freelance', description: 'Projeto freelance React', date: `${currentMonth}-20`, recurring: false },
  ];
  setCollection(STORAGE_KEYS.TRANSACTIONS, transactions);

  // ─── Workout (today) ─────────────────────────────────
  const workouts: StoredWorkout[] = [
    {
      ...entity(),
      userId,
      date: today(),
      type: 'Dia A — Peito + Triceps',
      exercises: [
        { name: 'Supino Reto', muscleGroup: 'Peito', equipment: 'Barra', sets: 4, reps: '8-10', weight: 70, restSeconds: 90, instructions: 'Controlar descida, explodir subida', completed: false },
        { name: 'Supino Inclinado Halteres', muscleGroup: 'Peito', equipment: 'Halteres', sets: 3, reps: '10-12', weight: 24, restSeconds: 75, instructions: 'Amplitude total, squeeze no topo', completed: false },
        { name: 'Crossover', muscleGroup: 'Peito', equipment: 'Cabo', sets: 3, reps: '12-15', weight: 15, restSeconds: 60, instructions: 'Foco na contracao', completed: false },
        { name: 'Triceps Pulley', muscleGroup: 'Triceps', equipment: 'Cabo', sets: 3, reps: '12-15', weight: 25, restSeconds: 60, instructions: 'Cotovelos fixos', completed: false },
        { name: 'Triceps Testa', muscleGroup: 'Triceps', equipment: 'Barra EZ', sets: 3, reps: '10-12', weight: 20, restSeconds: 75, instructions: 'Descer atras da cabeca', completed: false },
        { name: 'Mergulho', muscleGroup: 'Triceps', equipment: 'Paralelas', sets: 3, reps: '8-12', weight: 0, restSeconds: 90, instructions: 'Corpo reto, cotovelos proximos', completed: false },
      ],
      completed: false,
      notes: '',
      duration: null,
    },
  ];
  setCollection(STORAGE_KEYS.WORKOUTS, workouts);

  // ─── Day Plan (today) ────────────────────────────────
  const dayPlan: StoredDayPlan = {
    ...entity(),
    userId,
    date: today(),
    status: 'in_progress',
    xpEarned: 0,
    mentorMorningMessage: 'Bom dia, Hugo! Hoje e dia de peito e triceps. Voce tem 7 itens no plano — foco na execucao. Lembre-se: consistencia > intensidade. Bora!',
    mentorNightMessage: null,
  };
  setCollection(STORAGE_KEYS.DAY_PLANS, [dayPlan]);

  const dayPlanItems: StoredDayPlanItem[] = [
    { ...entity(), dayPlanId: dayPlan.id, taskId: null, routineBlockId: routineBlocks[0].id, workoutId: null, title: 'Acordar', startTime: '06:00', endTime: '07:00', status: 'done', type: 'routine', color: '#F59E0B', icon: '☀️', order: 0 },
    { ...entity(), dayPlanId: dayPlan.id, taskId: null, routineBlockId: routineBlocks[1].id, workoutId: null, title: 'Estudo Matinal', startTime: '07:00', endTime: '09:00', status: 'done', type: 'routine', color: '#3B82F6', icon: '📚', order: 1 },
    { ...entity(), dayPlanId: dayPlan.id, taskId: null, routineBlockId: routineBlocks[2].id, workoutId: null, title: 'Trabalho', startTime: '09:00', endTime: '18:00', status: 'pending', type: 'routine', color: '#10B981', icon: '💻', order: 2 },
    { ...entity(), dayPlanId: dayPlan.id, taskId: tasks[0].id, routineBlockId: null, workoutId: null, title: 'Configurar CI/CD do 4LeafTech', startTime: '10:00', endTime: '12:00', status: 'pending', type: 'task', color: '#F97316', icon: '📋', order: 3 },
    { ...entity(), dayPlanId: dayPlan.id, taskId: null, routineBlockId: routineBlocks[3].id, workoutId: workouts[0].id, title: 'Academia — Peito + Triceps', startTime: '18:30', endTime: '19:30', status: 'pending', type: 'workout', color: '#EF4444', icon: '🏋️', order: 4 },
    { ...entity(), dayPlanId: dayPlan.id, taskId: null, routineBlockId: routineBlocks[4].id, workoutId: null, title: 'Bloco de Construcao', startTime: '20:00', endTime: '22:00', status: 'pending', type: 'routine', color: '#8B5CF6', icon: '🚀', order: 5 },
    { ...entity(), dayPlanId: dayPlan.id, taskId: null, routineBlockId: routineBlocks[5].id, workoutId: null, title: 'Dormir', startTime: '23:00', endTime: '23:30', status: 'pending', type: 'routine', color: '#6366F1', icon: '🌙', order: 6 },
  ];
  setCollection(STORAGE_KEYS.DAY_PLAN_ITEMS, dayPlanItems);

  // ─── XP State ────────────────────────────────────────
  const xpHistory: { date: string; amount: number; reason: string }[] = [];
  // Simulate some XP history over last 14 days
  for (let i = 13; i >= 0; i--) {
    const date = daysAgo(i);
    xpHistory.push({ date, amount: 100 + Math.floor(Math.random() * 80), reason: 'Dia completo' });
    if (i % 2 === 0) {
      xpHistory.push({ date, amount: 30, reason: 'Treino concluido' });
    }
    if (i % 3 === 0) {
      xpHistory.push({ date, amount: 20, reason: 'Habitos cumpridos' });
    }
  }

  const xpState: XPState = {
    totalXP: 2450,
    level: Math.floor(2450 / 1000) + 1, // 3
    currentStreak: 12,
    longestStreak: 12,
    lastActiveDate: daysAgo(0),
    xpHistory,
  };
  setValue(STORAGE_KEYS.XP_STATE, xpState);

  // ─── Chat Messages (sample) ──────────────────────────
  setCollection(STORAGE_KEYS.CHAT_MESSAGES, [
    {
      ...entity({ createdAt: today() + 'T06:30:00Z' }),
      userId,
      role: 'assistant' as const,
      content: 'Bom dia, Hugo! Ontem voce completou 85% do plano — otimo trabalho. Hoje tem treino de peito e triceps e o CI/CD do 4LeafTech pra terminar. Bora com tudo!',
      mode: 'planner' as const,
    },
    {
      ...entity({ createdAt: today() + 'T06:31:00Z' }),
      userId,
      role: 'user' as const,
      content: 'Bora! Vou focar no CI/CD de manha e academia a tarde.',
      mode: 'planner' as const,
    },
  ]);

  // eslint-disable-next-line no-console
  console.log('[MentorApp] Seed data loaded successfully');
}
