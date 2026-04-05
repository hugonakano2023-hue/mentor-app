/**
 * Motor de Agenda — Core Engine
 *
 * Monta o plano do dia automaticamente:
 * 1. Coloca blocos fixos do dia
 * 2. Identifica espaços livres
 * 3. Puxa tarefas do backlog e encaixa nos espaços
 * 4. Adiciona treino do dia
 */

import type { SubItem } from '@/types';

export type TimeSlot = {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  minutes: number;
};

export type PlanItem = {
  id: string;
  type: 'routine' | 'task' | 'workout';
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  icon: string;
  status: 'pending' | 'done' | 'skipped';
  sourceId: string;
  subItems?: SubItem[];
};

type RoutineBlock = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  color: string;
  icon: string;
  subItems: SubItem[];
};

type BacklogTask = {
  id: string;
  title: string;
  estimatedMinutes: number;
  priority: 'alta' | 'media' | 'baixa';
  category: string;
  deadline: string | null;
  goalId: string | null;
};

const PRIORITY_WEIGHT = { alta: 3, media: 2, baixa: 1 } as const;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function findFreeSlots(routineBlocks: RoutineBlock[], dayStart = '06:00', dayEnd = '23:30'): TimeSlot[] {
  const sorted = [...routineBlocks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const slots: TimeSlot[] = [];
  let cursor = timeToMinutes(dayStart);
  const end = timeToMinutes(dayEnd);

  for (const block of sorted) {
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = timeToMinutes(block.endTime);

    if (blockStart > cursor) {
      const gap = blockStart - cursor;
      if (gap >= 15) {
        slots.push({
          startTime: minutesToTime(cursor),
          endTime: minutesToTime(blockStart),
          minutes: gap,
        });
      }
    }
    cursor = Math.max(cursor, blockEnd);
  }

  if (cursor < end) {
    const gap = end - cursor;
    if (gap >= 15) {
      slots.push({
        startTime: minutesToTime(cursor),
        endTime: minutesToTime(end),
        minutes: gap,
      });
    }
  }

  return slots;
}

function scoreTasks(tasks: BacklogTask[]): BacklogTask[] {
  return [...tasks].sort((a, b) => {
    // Priority 1: deadline proximity
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    if (a.deadline && b.deadline) {
      const diff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (diff !== 0) return diff;
    }

    // Priority 2: priority weight
    const weightDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (weightDiff !== 0) return weightDiff;

    // Priority 3: linked to goal
    if (a.goalId && !b.goalId) return -1;
    if (!a.goalId && b.goalId) return 1;

    return 0;
  });
}

export function generateDayPlan(
  dayOfWeek: number,
  routineBlocks: RoutineBlock[],
  backlogTasks: BacklogTask[],
  workoutTitle?: string
): PlanItem[] {
  const plan: PlanItem[] = [];

  // Step 1: Filter routine blocks for today
  const todaysBlocks = routineBlocks.filter(b => b.daysOfWeek.includes(dayOfWeek));

  // Step 2: Add routine blocks to plan
  for (const block of todaysBlocks) {
    plan.push({
      id: `routine-${block.id}`,
      type: 'routine',
      title: block.name,
      startTime: block.startTime,
      endTime: block.endTime,
      color: block.color,
      icon: block.icon,
      status: 'pending',
      sourceId: block.id,
      subItems: block.subItems,
    });
  }

  // Step 3: Find free slots
  const freeSlots = findFreeSlots(todaysBlocks);

  // Step 4: Score and fit tasks into free slots
  const rankedTasks = scoreTasks(backlogTasks);
  let taskIndex = 0;

  for (const slot of freeSlots) {
    let remainingMinutes = slot.minutes;
    let slotCursor = timeToMinutes(slot.startTime);

    while (taskIndex < rankedTasks.length && remainingMinutes >= 15) {
      const task = rankedTasks[taskIndex];

      if (task.estimatedMinutes <= remainingMinutes) {
        const taskStart = minutesToTime(slotCursor);
        const taskEnd = minutesToTime(slotCursor + task.estimatedMinutes);

        plan.push({
          id: `task-${task.id}`,
          type: 'task',
          title: task.title,
          startTime: taskStart,
          endTime: taskEnd,
          color: getCategoryColor(task.category),
          icon: '📋',
          status: 'pending',
          sourceId: task.id,
        });

        slotCursor += task.estimatedMinutes;
        remainingMinutes -= task.estimatedMinutes;
        taskIndex++;
      } else {
        break;
      }
    }
  }

  // Step 5: Add workout if exists (typically in the gym slot, but as separate item)
  if (workoutTitle) {
    plan.push({
      id: 'workout-today',
      type: 'workout',
      title: workoutTitle,
      startTime: '17:30',
      endTime: '18:30',
      color: '#ef4444',
      icon: '🏋️',
      status: 'pending',
      sourceId: 'workout-today',
    });
  }

  // Sort by start time
  return plan.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    '4LeafTech': '#10b981',
    'LuckBet': '#3b82f6',
    'Pessoal': '#a855f7',
    'Financeiro': '#f59e0b',
    'Saúde': '#ef4444',
    'Estudo': '#06b6d4',
    'Casa': '#64748b',
  };
  return colors[category] || '#64748b';
}
