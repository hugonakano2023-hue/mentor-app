'use client';

import * as React from 'react';
import { Plus, CalendarDays, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  RoutineBlockCard,
  type RoutineBlockData,
} from '@/components/routine/routine-block-card';
import { RoutineFormSheet } from '@/components/routine/routine-form-sheet';
import {
  getRoutineBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  updateSubItemCheck,
} from '@/lib/storage/routine-storage';
import { getSession } from '@/lib/auth';

type FeedbackMessage = {
  text: string;
  type: 'success' | 'error';
};

export default function RotinaPage() {
  const [blocks, setBlocks] = React.useState<RoutineBlockData[]>([]);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingBlock, setEditingBlock] = React.useState<RoutineBlockData | null>(null);
  const [feedback, setFeedback] = React.useState<FeedbackMessage | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  // Load blocks from localStorage on mount
  React.useEffect(() => {
    const stored = getRoutineBlocks();
    setBlocks(stored.map(toBlockData));
    setLoaded(true);
  }, []);

  // Auto-dismiss feedback
  React.useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  function toBlockData(stored: ReturnType<typeof getRoutineBlocks>[number]): RoutineBlockData {
    return {
      id: stored.id,
      name: stored.name,
      startTime: stored.startTime,
      endTime: stored.endTime,
      daysOfWeek: stored.daysOfWeek,
      color: stored.color,
      icon: stored.icon,
      subItems: stored.subItems,
    };
  }

  function showFeedback(text: string, type: 'success' | 'error' = 'success') {
    setFeedback({ text, type });
  }

  function handleEdit(block: RoutineBlockData) {
    setEditingBlock(block);
    setSheetOpen(true);
  }

  function handleAddNew() {
    setEditingBlock(null);
    setSheetOpen(true);
  }

  function handleSave(block: RoutineBlockData) {
    const session = getSession();
    const userId = session?.id ?? 'local';

    const existing = blocks.find((b) => b.id === block.id);
    if (existing) {
      // Update existing block in storage
      const updated = updateBlock(block.id, {
        name: block.name,
        startTime: block.startTime,
        endTime: block.endTime,
        daysOfWeek: block.daysOfWeek,
        color: block.color,
        icon: block.icon,
        subItems: block.subItems,
      });
      if (updated) {
        setBlocks((prev) => prev.map((b) => (b.id === block.id ? toBlockData(updated) : b)));
        showFeedback('Bloco atualizado com sucesso');
      }
    } else {
      // Create new block in storage
      const created = createBlock({
        userId,
        name: block.name,
        startTime: block.startTime,
        endTime: block.endTime,
        daysOfWeek: block.daysOfWeek,
        color: block.color,
        icon: block.icon,
        subItems: block.subItems,
      });
      setBlocks((prev) => [...prev, toBlockData(created)]);
      showFeedback('Bloco criado com sucesso');
    }
  }

  function handleDelete(id: string) {
    const success = deleteBlock(id);
    if (success) {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      showFeedback('Bloco excluido com sucesso');
    } else {
      showFeedback('Erro ao excluir bloco', 'error');
    }
  }

  function handleSubItemCheck(blockId: string, subItemId: string, checked: boolean) {
    const updated = updateSubItemCheck(blockId, subItemId, checked);
    if (updated) {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? toBlockData(updated) : b))
      );
    }
  }

  if (!loaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
              <CalendarDays className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Rotina Fixa</h1>
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-secondary/30 animate-pulse" />
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
            <CalendarDays className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Rotina Fixa</h1>
            <p className="text-sm text-muted-foreground">
              Configure seus blocos ancora do dia
            </p>
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="size-4 mr-1.5" />
          Adicionar Bloco
        </Button>
      </div>

      {/* Blocks Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => (
          <RoutineBlockCard
            key={block.id}
            block={block}
            onEdit={handleEdit}
            onSubItemCheck={handleSubItemCheck}
          />
        ))}
      </div>

      {/* Empty state */}
      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <CalendarDays className="size-8 text-primary/60" />
          </div>
          <h3 className="font-semibold">Nenhum bloco criado</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Crie blocos de rotina fixa para organizar seu dia com consistencia.
          </p>
          <Button className="mt-4" onClick={handleAddNew}>
            <Plus className="size-4 mr-1.5" />
            Criar Primeiro Bloco
          </Button>
        </div>
      )}

      {/* Form Sheet */}
      <RoutineFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        block={editingBlock}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
