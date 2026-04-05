'use client';

import * as React from 'react';
import { Plus, ListTodo, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard, type TaskData } from '@/components/tasks/task-card';
import { TaskFilters, type TaskFilterValue } from '@/components/tasks/task-filters';
import { TaskFormSheet } from '@/components/tasks/task-form-sheet';
import { Separator } from '@/components/ui/separator';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  getSubtasks,
  getCategories,
  addCategory,
} from '@/lib/storage/task-storage';
import { getGoals } from '@/lib/storage/goal-storage';
import { addXP } from '@/lib/storage/xp-storage';
import { getSession } from '@/lib/auth';

type FeedbackMessage = {
  text: string;
  type: 'success' | 'error';
};

const STATUS_ORDER: TaskData['status'][] = [
  'in_progress',
  'planned',
  'backlog',
  'done',
  'skipped',
];

const STATUS_LABELS: Record<string, string> = {
  in_progress: 'Em Andamento',
  planned: 'Planejadas',
  backlog: 'Backlog',
  done: 'Concluidas',
  skipped: 'Puladas',
};

function storedToTaskData(stored: ReturnType<typeof getTasks>[number], subtaskCount: number): TaskData {
  return {
    id: stored.id,
    title: stored.title,
    description: stored.description || undefined,
    category: stored.category,
    priority: stored.priority,
    estimatedMinutes: stored.estimatedMinutes,
    status: stored.status,
    goalId: stored.goalId,
    deadline: stored.deadline,
    subtaskCount,
    recurrence: stored.recurrence,
    parentTaskId: stored.parentTaskId,
  };
}

export default function TarefasPage() {
  const [tasks, setTasks] = React.useState<TaskData[]>([]);
  const [filter, setFilter] = React.useState<TaskFilterValue>('todas');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskData | null>(null);
  const [feedback, setFeedback] = React.useState<FeedbackMessage | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [goals, setGoals] = React.useState<{ id: string; title: string }[]>([]);
  const [editingSubtasks, setEditingSubtasks] = React.useState<TaskData[]>([]);

  // Load tasks from localStorage on mount
  React.useEffect(() => {
    loadTasks();
    setCategories(getCategories());
    setGoals(getGoals().map((g) => ({ id: g.id, title: g.title })));
    setLoaded(true);
  }, []);

  // Auto-dismiss feedback
  React.useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Load subtasks when editing a task
  React.useEffect(() => {
    if (editingTask) {
      const subs = getSubtasks(editingTask.id).map((s) => storedToTaskData(s, 0));
      setEditingSubtasks(subs);
    } else {
      setEditingSubtasks([]);
    }
  }, [editingTask]);

  function loadTasks() {
    const allStored = getTasks();
    // Only show parent tasks (non-subtasks) in the main list
    const parentTasks = allStored.filter((t) => !t.parentTaskId);
    const taskDataList = parentTasks.map((t) => {
      const subtaskCount = getSubtasks(t.id).length;
      return storedToTaskData(t, subtaskCount);
    });
    setTasks(taskDataList);
  }

  function showFeedback(text: string, type: 'success' | 'error' = 'success') {
    setFeedback({ text, type });
  }

  // Compute filter counts
  const counts: Record<TaskFilterValue, number> = {
    todas: tasks.length,
    backlog: tasks.filter((t) => t.status === 'backlog').length,
    hoje: tasks.filter((t) => t.status === 'planned' || t.status === 'in_progress').length,
    concluidas: tasks.filter((t) => t.status === 'done').length,
  };

  // Filter tasks
  const filteredTasks = React.useMemo(() => {
    switch (filter) {
      case 'backlog':
        return tasks.filter((t) => t.status === 'backlog');
      case 'hoje':
        return tasks.filter((t) => t.status === 'planned' || t.status === 'in_progress');
      case 'concluidas':
        return tasks.filter((t) => t.status === 'done');
      default:
        return tasks;
    }
  }, [tasks, filter]);

  // Group tasks by status
  const groupedTasks = React.useMemo(() => {
    const groups: Record<string, TaskData[]> = {};
    for (const task of filteredTasks) {
      if (!groups[task.status]) groups[task.status] = [];
      groups[task.status].push(task);
    }
    return groups;
  }, [filteredTasks]);

  function handleEdit(task: TaskData) {
    setEditingTask(task);
    setSheetOpen(true);
  }

  function handleAddNew() {
    setEditingTask(null);
    setSheetOpen(true);
  }

  function handleSave(taskData: TaskData) {
    const session = getSession();
    const userId = session?.id ?? 'local';

    const existing = tasks.find((t) => t.id === taskData.id);
    if (existing) {
      // Update existing task in storage
      updateTask(taskData.id, {
        title: taskData.title,
        description: taskData.description ?? '',
        category: taskData.category,
        priority: taskData.priority,
        estimatedMinutes: taskData.estimatedMinutes,
        deadline: taskData.deadline ?? null,
        goalId: taskData.goalId ?? null,
        recurrence: taskData.recurrence === '_none' ? null : (taskData.recurrence ?? null),
        status: taskData.status,
      });
      showFeedback('Tarefa atualizada com sucesso');
    } else {
      // Create new task in storage
      createTask({
        userId,
        title: taskData.title,
        description: taskData.description ?? '',
        category: taskData.category,
        priority: taskData.priority,
        estimatedMinutes: taskData.estimatedMinutes,
        status: 'backlog',
        deadline: taskData.deadline ?? null,
        goalId: taskData.goalId ?? null,
        milestoneId: null,
        recurrence: taskData.recurrence === '_none' ? null : (taskData.recurrence ?? null),
        recurrenceDays: null,
        parentTaskId: taskData.parentTaskId ?? null,
        xpValue: taskData.estimatedMinutes >= 60 ? 30 : 15,
        completedAt: null,
      });
      showFeedback('Tarefa criada com sucesso');
    }
    loadTasks();
  }

  function handleDelete(id: string) {
    const success = deleteTask(id);
    if (success) {
      showFeedback('Tarefa excluida com sucesso');
      loadTasks();
    } else {
      showFeedback('Erro ao excluir tarefa', 'error');
    }
  }

  function handleComplete(id: string) {
    const storedTask = getTasks().find((t) => t.id === id);
    if (!storedTask) return;

    completeTask(id);
    addXP(storedTask.xpValue, `Tarefa concluida: ${storedTask.title}`);
    showFeedback(`Tarefa concluida! +${storedTask.xpValue} XP`);
    loadTasks();
  }

  function handleAddCategory(name: string) {
    const updated = addCategory(name);
    setCategories(updated);
    showFeedback(`Categoria "${name}" adicionada`);
  }

  function handleAddSubtask(parentId: string, title: string) {
    const session = getSession();
    const userId = session?.id ?? 'local';

    createTask({
      userId,
      title,
      description: '',
      category: editingTask?.category ?? 'Pessoal',
      priority: 'media',
      estimatedMinutes: 15,
      status: 'backlog',
      deadline: null,
      goalId: null,
      milestoneId: null,
      recurrence: null,
      recurrenceDays: null,
      parentTaskId: parentId,
      xpValue: 5,
      completedAt: null,
    });

    // Reload subtasks for the editing task
    const subs = getSubtasks(parentId).map((s) => storedToTaskData(s, 0));
    setEditingSubtasks(subs);
    loadTasks();
    showFeedback('Subtarefa adicionada');
  }

  if (!loaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
              <ListTodo className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Tarefas</h1>
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback toast */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/15 text-red-400 border border-red-500/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <X className="size-4" />
          )}
          {feedback.text}
          <button onClick={() => setFeedback(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <ListTodo className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tarefas</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seu backlog e tarefas do dia
            </p>
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="size-4 mr-1.5" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filters */}
      <TaskFilters value={filter} onChange={setFilter} counts={counts} />

      {/* Task list grouped by status */}
      <div className="space-y-6">
        {STATUS_ORDER.map((status) => {
          const group = groupedTasks[status];
          if (!group || group.length === 0) return null;
          return (
            <div key={status} className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {STATUS_LABELS[status]}
                </h2>
                <span className="text-xs text-muted-foreground/60 tabular-nums">
                  ({group.length})
                </span>
                <Separator className="flex-1" />
              </div>
              <div className="grid gap-2">
                {group.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEdit}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <ListTodo className="size-8 text-primary/60" />
          </div>
          <h3 className="font-semibold">Nenhuma tarefa encontrada</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {filter === 'todas'
              ? 'Crie sua primeira tarefa para comecar a organizar seu dia.'
              : 'Nenhuma tarefa nesta categoria.'}
          </p>
          {filter === 'todas' && (
            <Button className="mt-4" onClick={handleAddNew}>
              <Plus className="size-4 mr-1.5" />
              Criar Primeira Tarefa
            </Button>
          )}
        </div>
      )}

      {/* Form Sheet */}
      <TaskFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        task={editingTask}
        onSave={handleSave}
        onDelete={handleDelete}
        categories={categories}
        onAddCategory={handleAddCategory}
        goals={goals}
        subtasks={editingSubtasks}
        onAddSubtask={handleAddSubtask}
      />
    </div>
  );
}
