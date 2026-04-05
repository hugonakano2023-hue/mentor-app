/**
 * Goal & Milestone Storage
 */
import {
  type StoredEntity,
  getCollection,
  create,
  update,
  remove,
  STORAGE_KEYS,
} from './index';

export type StoredGoal = StoredEntity & {
  userId: string;
  title: string;
  description: string;
  deadline: string | null;
  area: 'negocios' | 'carreira' | 'financeiro' | 'saude' | 'pessoal';
};

export type StoredMilestone = StoredEntity & {
  goalId: string;
  title: string;
  deadline: string | null;
  progress: number; // 0-100
};

const GOAL_KEY = STORAGE_KEYS.GOALS;
const MILESTONE_KEY = STORAGE_KEYS.MILESTONES;

// --- Goals ---

export function getGoals(): StoredGoal[] {
  return getCollection<StoredGoal>(GOAL_KEY);
}

export function getGoalsByArea(area: StoredGoal['area']): StoredGoal[] {
  return getGoals().filter((g) => g.area === area);
}

export function createGoal(
  data: Omit<StoredGoal, 'id' | 'createdAt'>
): StoredGoal {
  return create<StoredGoal>(GOAL_KEY, data);
}

export function updateGoal(
  id: string,
  data: Partial<StoredGoal>
): StoredGoal | null {
  return update<StoredGoal>(GOAL_KEY, id, data);
}

export function deleteGoal(id: string): boolean {
  // Also delete associated milestones
  const milestones = getMilestones(id);
  for (const m of milestones) {
    remove<StoredMilestone>(MILESTONE_KEY, m.id);
  }
  return remove<StoredGoal>(GOAL_KEY, id);
}

// --- Milestones ---

export function getMilestones(goalId: string): StoredMilestone[] {
  return getCollection<StoredMilestone>(MILESTONE_KEY).filter(
    (m) => m.goalId === goalId
  );
}

export function getAllMilestones(): StoredMilestone[] {
  return getCollection<StoredMilestone>(MILESTONE_KEY);
}

export function createMilestone(
  data: Omit<StoredMilestone, 'id' | 'createdAt'>
): StoredMilestone {
  return create<StoredMilestone>(MILESTONE_KEY, data);
}

export function updateMilestone(
  id: string,
  data: Partial<StoredMilestone>
): StoredMilestone | null {
  return update<StoredMilestone>(MILESTONE_KEY, id, data);
}

export function deleteMilestone(id: string): boolean {
  return remove<StoredMilestone>(MILESTONE_KEY, id);
}

export function calculateGoalProgress(goalId: string): number {
  const milestones = getMilestones(goalId);
  if (milestones.length === 0) return 0;

  const total = milestones.reduce((sum, m) => sum + m.progress, 0);
  return Math.round(total / milestones.length);
}
