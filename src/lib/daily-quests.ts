/**
 * Daily Quests System
 */
import { getValue, setValue } from '@/lib/storage/index';
import { getCompletionForDate, getItemsForDate } from '@/lib/storage/day-plan-storage';
import { getLogsForDate, getActiveHabits } from '@/lib/storage/habit-storage';
import { getTodayWorkout } from '@/lib/storage/workout-storage';
import { getTransactions } from '@/lib/storage/finance-storage';
import { addXP } from '@/lib/storage/xp-storage';

export type DailyQuest = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  completed: boolean;
  checkFn: () => boolean;
};

const QUEST_POOL: Omit<DailyQuest, 'completed' | 'checkFn'>[] = [
  {
    id: 'quest_3_tasks_morning',
    title: 'Complete 3 tarefas antes das 12h',
    description: 'Finalize 3 itens do plano pela manha',
    icon: '\u2600\uFE0F',
    xpReward: 15,
  },
  {
    id: 'quest_all_habits',
    title: 'Registre todos os habitos',
    description: 'Faca o checkin de todos os seus habitos hoje',
    icon: '\u{1F4CA}',
    xpReward: 10,
  },
  {
    id: 'quest_workout',
    title: 'Faca o treino do dia',
    description: 'Complete seu treino programado',
    icon: '\u{1F4AA}',
    xpReward: 15,
  },
  {
    id: 'quest_100_percent',
    title: 'Complete 100% do plano',
    description: 'Finalize todos os itens da agenda',
    icon: '\u{1F3C6}',
    xpReward: 30,
  },
  {
    id: 'quest_spend_limit',
    title: 'Nao gaste mais de R$50 hoje',
    description: 'Mantenha seus gastos sob controle',
    icon: '\u{1F4B0}',
    xpReward: 10,
  },
  {
    id: 'quest_5_tasks',
    title: 'Complete 5 itens do plano',
    description: 'Conclua pelo menos 5 itens hoje',
    icon: '\u{1F680}',
    xpReward: 20,
  },
  {
    id: 'quest_early_start',
    title: 'Comece antes das 8h',
    description: 'Conclua o primeiro item ate as 8h',
    icon: '\u{1F305}',
    xpReward: 10,
  },
  {
    id: 'quest_no_skip',
    title: 'Zero itens pulados',
    description: 'Nao pule nenhum item da agenda',
    icon: '\u{1F3AF}',
    xpReward: 15,
  },
];

function getCheckFn(questId: string): () => boolean {
  const today = new Date().toISOString().split('T')[0];

  switch (questId) {
    case 'quest_3_tasks_morning': {
      return () => {
        const items = getItemsForDate(today);
        const doneBeforeNoon = items.filter((i) => {
          if (i.status !== 'done') return false;
          const hour = parseInt(i.endTime?.split(':')[0] ?? '23', 10);
          return hour < 12;
        });
        return doneBeforeNoon.length >= 3;
      };
    }
    case 'quest_all_habits': {
      return () => {
        const habits = getActiveHabits();
        if (habits.length === 0) return false;
        const logs = getLogsForDate(today);
        const loggedHabitIds = new Set(logs.map((l) => l.habitId));
        return habits.every((h) => loggedHabitIds.has(h.id));
      };
    }
    case 'quest_workout': {
      return () => {
        const workout = getTodayWorkout();
        return workout?.completed === true;
      };
    }
    case 'quest_100_percent': {
      return () => {
        const completion = getCompletionForDate(today);
        return completion.percentage === 100 && completion.total > 0;
      };
    }
    case 'quest_spend_limit': {
      return () => {
        const txs = getTransactions().filter(
          (t) => t.date === today && t.type === 'despesa'
        );
        const totalSpent = txs.reduce((sum, t) => sum + t.amount, 0);
        return totalSpent <= 50;
      };
    }
    case 'quest_5_tasks': {
      return () => {
        const items = getItemsForDate(today);
        return items.filter((i) => i.status === 'done').length >= 5;
      };
    }
    case 'quest_early_start': {
      return () => {
        const items = getItemsForDate(today);
        return items.some((i) => {
          if (i.status !== 'done') return false;
          const hour = parseInt(i.endTime?.split(':')[0] ?? '23', 10);
          return hour < 8;
        });
      };
    }
    case 'quest_no_skip': {
      return () => {
        const items = getItemsForDate(today);
        if (items.length === 0) return false;
        return items.every((i) => i.status !== 'skipped');
      };
    }
    default:
      return () => false;
  }
}

const DAILY_QUEST_KEY = 'mentor_daily_quests';

type StoredDailyQuests = {
  date: string;
  questIds: string[];
  completedIds: string[];
};

function getStoredQuests(): StoredDailyQuests | null {
  return getValue<StoredDailyQuests>(DAILY_QUEST_KEY);
}

function pickQuestsForToday(): string[] {
  // Deterministic based on date to always get same quests for the same day
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((sum, n) => sum + parseInt(n, 10), 0);

  const shuffled = [...QUEST_POOL].sort((a, b) => {
    const hashA = (seed * 31 + a.id.length) % 100;
    const hashB = (seed * 31 + b.id.length) % 100;
    return hashA - hashB;
  });

  return shuffled.slice(0, 3).map((q) => q.id);
}

export function getDailyQuests(): DailyQuest[] {
  const today = new Date().toISOString().split('T')[0];
  let stored = getStoredQuests();

  // Generate new quests if day changed
  if (!stored || stored.date !== today) {
    stored = {
      date: today,
      questIds: pickQuestsForToday(),
      completedIds: [],
    };
    setValue(DAILY_QUEST_KEY, stored);
  }

  return stored.questIds.map((qId) => {
    const def = QUEST_POOL.find((q) => q.id === qId);
    if (!def) {
      return {
        id: qId,
        title: 'Quest desconhecida',
        description: '',
        icon: '\u2753',
        xpReward: 0,
        completed: false,
        checkFn: () => false,
      };
    }
    return {
      ...def,
      completed: stored!.completedIds.includes(qId),
      checkFn: getCheckFn(qId),
    };
  });
}

export function checkQuestCompletion(): DailyQuest[] {
  const today = new Date().toISOString().split('T')[0];
  const stored = getStoredQuests();
  if (!stored || stored.date !== today) return [];

  const quests = getDailyQuests();
  const newlyCompleted: DailyQuest[] = [];

  for (const quest of quests) {
    if (quest.completed) continue;
    if (quest.checkFn()) {
      stored.completedIds.push(quest.id);
      addXP(quest.xpReward, `Quest: ${quest.title}`);
      newlyCompleted.push({ ...quest, completed: true });
    }
  }

  if (newlyCompleted.length > 0) {
    setValue(DAILY_QUEST_KEY, stored);
  }

  return newlyCompleted;
}
