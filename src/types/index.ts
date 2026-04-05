import type * as schema from '@/db/schema';

// ─── Inferred row types from schema ─────────────────────────────────────────

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

export type RoutineBlock = typeof schema.routineBlocks.$inferSelect;
export type NewRoutineBlock = typeof schema.routineBlocks.$inferInsert;

export type Task = typeof schema.tasks.$inferSelect;
export type NewTask = typeof schema.tasks.$inferInsert;

export type DayPlan = typeof schema.dayPlans.$inferSelect;
export type NewDayPlan = typeof schema.dayPlans.$inferInsert;

export type DayPlanItem = typeof schema.dayPlanItems.$inferSelect;
export type NewDayPlanItem = typeof schema.dayPlanItems.$inferInsert;

export type Workout = typeof schema.workouts.$inferSelect;
export type NewWorkout = typeof schema.workouts.$inferInsert;

export type Transaction = typeof schema.transactions.$inferSelect;
export type NewTransaction = typeof schema.transactions.$inferInsert;

export type Debt = typeof schema.debts.$inferSelect;
export type NewDebt = typeof schema.debts.$inferInsert;

export type Habit = typeof schema.habits.$inferSelect;
export type NewHabit = typeof schema.habits.$inferInsert;

export type HabitLog = typeof schema.habitLogs.$inferSelect;
export type NewHabitLog = typeof schema.habitLogs.$inferInsert;

export type Goal = typeof schema.goals.$inferSelect;
export type NewGoal = typeof schema.goals.$inferInsert;

export type Milestone = typeof schema.milestones.$inferSelect;
export type NewMilestone = typeof schema.milestones.$inferInsert;

export type ChatMessage = typeof schema.chatMessages.$inferSelect;
export type NewChatMessage = typeof schema.chatMessages.$inferInsert;

export type WeeklyReview = typeof schema.weeklyReviews.$inferSelect;
export type NewWeeklyReview = typeof schema.weeklyReviews.$inferInsert;

// ─── Custom types ───────────────────────────────────────────────────────────

export type ExerciseSet = {
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  weight: number;
  restSeconds: number;
  instructions: string;
};

export type SubItem = {
  id: string;
  label: string;
  checked: boolean;
};

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type XPEvent = {
  type:
    | 'task'
    | 'task_with_goal'
    | 'construction_block'
    | 'workout'
    | 'perfect_day'
    | 'habits'
    | 'finance_review';
  amount: number;
};

export const XP_VALUES = {
  task: 10,
  task_with_goal: 15,
  construction_block: 25,
  workout: 20,
  perfect_day: 50,
  habits: 5,
  finance_review: 15,
} as const;

export type MentorMode = 'planner' | 'chat' | 'review';
export type TaskPriority = 'alta' | 'media' | 'baixa';
export type TaskStatus = 'backlog' | 'planned' | 'in_progress' | 'done' | 'skipped';
export type TransactionType = 'receita' | 'despesa';
export type GoalArea = 'negocios' | 'carreira' | 'financeiro' | 'saude' | 'pessoal';
