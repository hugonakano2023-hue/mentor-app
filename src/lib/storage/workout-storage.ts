/**
 * Workout Storage
 */
import {
  type StoredEntity,
  getCollection,
  create,
  update,
  STORAGE_KEYS,
} from './index';

export type StoredExercise = {
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  weight: number;
  restSeconds: number;
  instructions: string;
  completed: boolean;
};

export type StoredWorkout = StoredEntity & {
  userId: string;
  date: string;
  type: string; // e.g. 'Dia A — Peito + Triceps'
  exercises: StoredExercise[];
  completed: boolean;
  notes: string;
  duration: number | null; // minutes
};

const KEY = STORAGE_KEYS.WORKOUTS;

export function getWorkouts(): StoredWorkout[] {
  return getCollection<StoredWorkout>(KEY);
}

export function getWorkoutForDate(date: string): StoredWorkout | null {
  return getWorkouts().find((w) => w.date === date) ?? null;
}

export function getTodayWorkout(): StoredWorkout | null {
  const today = new Date().toISOString().split('T')[0];
  return getWorkoutForDate(today);
}

export function createWorkout(
  data: Omit<StoredWorkout, 'id' | 'createdAt'>
): StoredWorkout {
  return create<StoredWorkout>(KEY, data);
}

export function updateWorkout(
  id: string,
  data: Partial<StoredWorkout>
): StoredWorkout | null {
  return update<StoredWorkout>(KEY, id, data);
}

export function completeWorkout(id: string): StoredWorkout | null {
  return update<StoredWorkout>(KEY, id, {
    completed: true,
  });
}

export function getWorkoutHistory(limit?: number): StoredWorkout[] {
  const workouts = getWorkouts()
    .filter((w) => w.completed)
    .sort((a, b) => b.date.localeCompare(a.date));
  return limit ? workouts.slice(0, limit) : workouts;
}

export function getCompletedCount(days: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return getWorkouts().filter(
    (w) => w.completed && w.date >= cutoffStr
  ).length;
}
