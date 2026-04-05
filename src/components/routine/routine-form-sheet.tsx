'use client';

import * as React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RoutineBlockData, RoutineSubItem } from './routine-block-card';

const DAY_OPTIONS = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

const COLOR_PALETTE = [
  '#22c55e',
  '#3b82f6',
  '#64748b',
  '#ef4444',
  '#a855f7',
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

const ICON_OPTIONS = [
  '☀️', '📚', '💼', '🏋️', '🔨', '🌙', '🎯', '💡',
  '🧘', '🎨', '🏃', '🍎', '💻', '📝', '🎵', '🧠',
  '☕', '🚀', '📊', '🏠',
];

interface RoutineFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block?: RoutineBlockData | null;
  onSave: (block: RoutineBlockData) => void;
  onDelete?: (id: string) => void;
}

export function RoutineFormSheet({
  open,
  onOpenChange,
  block,
  onSave,
  onDelete,
}: RoutineFormSheetProps) {
  const isEditing = !!block;

  const [name, setName] = React.useState('');
  const [startTime, setStartTime] = React.useState('08:00');
  const [endTime, setEndTime] = React.useState('09:00');
  const [daysOfWeek, setDaysOfWeek] = React.useState<number[]>([1, 2, 3, 4, 5]);
  const [color, setColor] = React.useState(COLOR_PALETTE[0]);
  const [icon, setIcon] = React.useState(ICON_OPTIONS[0]);
  const [subItems, setSubItems] = React.useState<RoutineSubItem[]>([]);
  const [newSubItem, setNewSubItem] = React.useState('');

  // Reset form when block changes
  React.useEffect(() => {
    if (block) {
      setName(block.name);
      setStartTime(block.startTime);
      setEndTime(block.endTime);
      setDaysOfWeek(block.daysOfWeek);
      setColor(block.color);
      setIcon(block.icon);
      setSubItems(block.subItems);
    } else {
      setName('');
      setStartTime('08:00');
      setEndTime('09:00');
      setDaysOfWeek([1, 2, 3, 4, 5]);
      setColor(COLOR_PALETTE[0]);
      setIcon(ICON_OPTIONS[0]);
      setSubItems([]);
    }
    setNewSubItem('');
  }, [block, open]);

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function addSubItem() {
    if (!newSubItem.trim()) return;
    setSubItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: newSubItem.trim(), checked: false },
    ]);
    setNewSubItem('');
  }

  function removeSubItem(id: string) {
    setSubItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      id: block?.id ?? crypto.randomUUID(),
      name: name.trim(),
      startTime,
      endTime,
      daysOfWeek,
      color,
      icon,
      subItems,
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle>{isEditing ? 'Editar Bloco' : 'Novo Bloco'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Edite os detalhes do bloco de rotina.'
              : 'Crie um novo bloco para sua rotina fixa.'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-5 pb-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="block-name">Nome</Label>
              <Input
                id="block-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Estudo Matinal"
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start-time">Início</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">Fim</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Days of Week */}
            <div className="space-y-2">
              <Label>Dias da Semana</Label>
              <div className="flex flex-wrap gap-1.5">
                {DAY_OPTIONS.map((day) => {
                  const isActive = daysOfWeek.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={cn(
                        'inline-flex h-8 w-10 items-center justify-center rounded-lg text-xs font-medium transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      'size-8 rounded-full transition-all',
                      color === c
                        ? 'ring-2 ring-offset-2 ring-offset-background'
                        : 'hover:scale-110'
                    )}
                    style={{
                      backgroundColor: c,
                      ...(color === c ? { ringColor: c } : {}),
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Selector */}
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-1.5">
                {ICON_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={cn(
                      'size-9 rounded-lg text-lg transition-all flex items-center justify-center',
                      icon === emoji
                        ? 'bg-primary/20 ring-2 ring-primary'
                        : 'bg-secondary hover:bg-secondary/80'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Sub-items */}
            <div className="space-y-2">
              <Label>Sub-itens</Label>
              <div className="space-y-1.5">
                {subItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2"
                  >
                    <GripVertical className="size-3.5 text-muted-foreground/50 shrink-0" />
                    <span className="flex-1 text-sm truncate">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => removeSubItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSubItem}
                  onChange={(e) => setNewSubItem(e.target.value)}
                  placeholder="Adicionar sub-item..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSubItem();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={addSubItem}
                  disabled={!newSubItem.trim()}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="border-t px-4 py-3">
          <div className="flex w-full gap-2">
            {isEditing && onDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(block.id);
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
            <Button onClick={handleSave} disabled={!name.trim()}>
              {isEditing ? 'Salvar' : 'Criar Bloco'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
