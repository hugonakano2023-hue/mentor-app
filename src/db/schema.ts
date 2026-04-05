import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  real,
  jsonb,
  date,
  time,
  uuid,
} from 'drizzle-orm/pg-core';

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  birthDate: date('birth_date'),
  timezone: text('timezone').notNull().default('America/Sao_Paulo'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Routine Blocks ─────────────────────────────────────────────────────────

export const routineBlocks = pgTable('routine_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  daysOfWeek: jsonb('days_of_week').notNull().$type<number[]>(),
  color: text('color'),
  icon: text('icon'),
  subItems: jsonb('sub_items')
    .notNull()
    .default([])
    .$type<{ id: string; label: string; checked: boolean }[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Goals ──────────────────────────────────────────────────────────────────

export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  deadline: date('deadline'),
  area: text('area', {
    enum: ['negocios', 'carreira', 'financeiro', 'saude', 'pessoal'],
  }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Milestones ─────────────────────────────────────────────────────────────

export const milestones = pgTable('milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  goalId: uuid('goal_id')
    .notNull()
    .references(() => goals.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  deadline: date('deadline'),
  progress: integer('progress').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Tasks ──────────────────────────────────────────────────────────────────

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  estimatedMinutes: integer('estimated_minutes'),
  priority: text('priority', { enum: ['alta', 'media', 'baixa'] }).notNull(),
  category: text('category'),
  deadline: timestamp('deadline'),
  goalId: uuid('goal_id').references(() => goals.id, { onDelete: 'set null' }),
  status: text('status', {
    enum: ['backlog', 'planned', 'in_progress', 'done', 'skipped'],
  })
    .notNull()
    .default('backlog'),
  recurrence: text('recurrence'),
  parentTaskId: uuid('parent_task_id'),
  xpValue: integer('xp_value').notNull().default(10),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Day Plans ──────────────────────────────────────────────────────────────

export const dayPlans = pgTable('day_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  status: text('status', {
    enum: ['planned', 'in_progress', 'completed'],
  })
    .notNull()
    .default('planned'),
  xpEarned: integer('xp_earned').notNull().default(0),
  mentorMorningMessage: text('mentor_morning_message'),
  mentorNightMessage: text('mentor_night_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Day Plan Items ─────────────────────────────────────────────────────────

export const dayPlanItems = pgTable('day_plan_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  dayPlanId: uuid('day_plan_id')
    .notNull()
    .references(() => dayPlans.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  routineBlockId: uuid('routine_block_id').references(
    () => routineBlocks.id,
    { onDelete: 'set null' }
  ),
  workoutId: uuid('workout_id'),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  status: text('status', { enum: ['pending', 'done', 'skipped'] })
    .notNull()
    .default('pending'),
  order: integer('order').notNull(),
});

// ─── Workouts ───────────────────────────────────────────────────────────────

export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  type: text('type').notNull(),
  exercises: jsonb('exercises').notNull().$type<
    {
      name: string;
      muscleGroup: string;
      equipment: string;
      sets: number;
      reps: string;
      weight: number;
      restSeconds: number;
      instructions: string;
    }[]
  >(),
  completed: boolean('completed').notNull().default(false),
  notes: text('notes'),
  duration: integer('duration'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Transactions ───────────────────────────────────────────────────────────

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  type: text('type', { enum: ['receita', 'despesa'] }).notNull(),
  category: text('category').notNull(),
  description: text('description'),
  date: date('date').notNull(),
  recurring: boolean('recurring').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Debts ──────────────────────────────────────────────────────────────────

export const debts = pgTable('debts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  creditor: text('creditor').notNull(),
  totalAmount: real('total_amount').notNull(),
  paidAmount: real('paid_amount').notNull().default(0),
  interestRate: real('interest_rate'),
  deadline: date('deadline'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Habits ─────────────────────────────────────────────────────────────────

export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type', { enum: ['boolean', 'number', 'time'] }).notNull(),
  dailyGoal: text('daily_goal'),
  icon: text('icon'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Habit Logs ─────────────────────────────────────────────────────────────

export const habitLogs = pgTable('habit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habit_id')
    .notNull()
    .references(() => habits.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  value: text('value').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Chat Messages ──────────────────────────────────────────────────────────

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  mode: text('mode', { enum: ['planner', 'chat', 'review'] }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Weekly Reviews ─────────────────────────────────────────────────────────

export const weeklyReviews = pgTable('weekly_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  weekStart: date('week_start').notNull(),
  data: jsonb('data').notNull(),
  mentorMessage: text('mentor_message').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
