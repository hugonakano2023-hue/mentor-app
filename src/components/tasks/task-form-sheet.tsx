'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TaskData, TaskPriority } from './task-card';

const DEFAULT_CATEGORIES = [
  'Desenvolvimento',
  'Financeiro',
  'Estudo',
  'Negocios',
  'Saude',
  'Pessoal',
];

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baixa', label: 'Baixa' },
];

const RECURRENCE_OPTIONS = [
  { value: '', label: 'Sem recorrencia' },
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
];

interface TaskFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskData | null;
  onSave: (task: TaskData) => void;
  onDelete?: (id: string) => void;
  categories?: string[];
  onAddCategory?: (name: string) => void;
  goals?: { id: string; title: string }[];
  subtasks?: TaskData[];
  onAddSubtask?: (parentId: string, title: string) => void;
}

export function TaskFormSheet({
  open,
  onOpenChange,
  task,
  onSave,
  onDelete,
  categories,
  onAddCategory,
  goals = [],
  subtasks = [],
  onAddSubtask,
}: TaskFormSheetProps) {
  const isEditing = !!task;
  const allCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [estimatedMinutes, setEstimatedMinutes] = React.useState(30);
  const [priority, setPriority] = React.useState<TaskPriority>('media');
  const [category, setCategory] = React.useState(allCategories[0]);
  const [deadline, setDeadline] = React.useState('');
  const [goalId, setGoalId] = React.useState<string>('');
  const [recurrence, setRecurrence] = React.useState('');
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [showNewCategory, setShowNewCategory] = React.useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setEstimatedMinutes(task.estimatedMinutes);
      setPriority(task.priority);
      setCategory(task.category);
      setDeadline(task.deadline ?? '');
      setGoalId(task.goalId ?? '');
      setRecurrence(task.recurrence ?? '');
    } else {
      setTitle('');
      setDescription('');
      setEstimatedMinutes(30);
      setPriority('media');
      setCategory(allCategories[0]);
      setDeadline('');
      setGoalId('');
      setRecurrence('');
    }
    setNewCategoryName('');
    setShowNewCategory(false);
    setNewSubtaskTitle('');
  }, [task, open, allCategories]);

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      id: task?.id ?? crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      estimatedMinutes,
      status: task?.status ?? 'backlog',
      goalId: goalId || null,
      deadline: deadline || null,
      recurrence: recurrence || null,
      parentTaskId: task?.parentTaskId ?? null,
    });
    onOpenChange(false);
  }

  function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    onAddCategory?.(name);
    setCategory(name);
    setNewCategoryName('');
    setShowNewCategory(false);
  }

  function handleAddSubtask() {
    const t = newSubtaskTitle.trim();
    if (!t || !task?.id) return;
    onAddSubtask?.(task.id, t);
    setNewSubtaskTitle('');
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle>{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Edite os detalhes da tarefa.'
              : 'Adicione uma nova tarefa ao seu backlog.'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-5 pb-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="task-title">Titulo</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Revisar PR da 4LeafTech"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="task-desc">Descricao (opcional)</Label>
              <Textarea
                id="task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes adicionais..."
                className="min-h-20"
              />
            </div>

            {/* Estimated Time */}
            <div className="space-y-2">
              <Label htmlFor="task-time">Tempo estimado (minutos)</Label>
              <Input
                id="task-time"
                type="number"
                min={5}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              />
            </div>

            <Separator />

            {/* Priority */}
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      'flex-1 h-8 rounded-lg text-xs font-medium transition-all',
                      priority === p.value
                        ? p.value === 'alta'
                          ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50'
                          : p.value === 'media'
                            ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50'
                            : 'bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/50'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Categoria</Label>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="text-[10px] text-primary hover:text-primary/80 transition-colors"
                >
                  {showNewCategory ? 'Cancelar' : '+ Nova categoria'}
                </button>
              </div>
              {showNewCategory ? (
                <div className="flex gap-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da categoria..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              ) : (
                <Select value={category} onValueChange={(v) => setCategory(v ?? allCategories[0])}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Recurrence */}
            <div className="space-y-2">
              <Label>Recorrencia</Label>
              <Select value={recurrence} onValueChange={(v) => setRecurrence(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sem recorrencia" />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value || '_none'} value={opt.value || '_none'}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="task-deadline">Prazo (opcional)</Label>
              <Input
                id="task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <Separator />

            {/* Goal Link */}
            <div className="space-y-2">
              <Label>Vincular a meta (opcional)</Label>
              <Select value={goalId || '_none'} onValueChange={(v) => setGoalId(v === '_none' ? '' : (v ?? ''))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Nenhuma meta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Nenhuma</SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subtasks (only in edit mode) */}
            {isEditing && onAddSubtask && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Subtarefas</Label>
                  {subtasks.length > 0 && (
                    <div className="space-y-1.5">
                      {subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          className={cn(
                            'flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2',
                            sub.status === 'done' && 'opacity-60'
                          )}
                        >
                          <span
                            className={cn(
                              'size-2 rounded-full shrink-0',
                              sub.status === 'done' ? 'bg-emerald-400' : 'bg-muted-foreground/30'
                            )}
                          />
                          <span
                            className={cn(
                              'flex-1 text-sm truncate',
                              sub.status === 'done' && 'line-through text-muted-foreground'
                            )}
                          >
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Adicionar subtarefa..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleAddSubtask}
                      disabled={!newSubtaskTitle.trim()}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="border-t px-4 py-3">
          <div className="flex w-full gap-2">
            {isEditing && onDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(task.id);
                  onOpenChange(false);
                }}
                className="mr-auto"
              >
                Excluir
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {isEditing ? 'Salvar' : 'Criar Tarefa'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
