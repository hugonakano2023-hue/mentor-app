'use client';

import * as React from 'react';
import { Brain } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Separator } from '@/components/ui/separator';
import { ModeSelector } from '@/components/mentor/mode-selector';
import { ChatMessage } from '@/components/mentor/chat-message';
import { ChatInput } from '@/components/mentor/chat-input';
import {
  getMessages,
  getMessagesForDate,
  saveMessage,
  type StoredChatMessage,
} from '@/lib/storage/chat-storage';
import { getUser } from '@/lib/storage/user-storage';
import { getCompletionForDate } from '@/lib/storage/day-plan-storage';
import { getMonthSummary, getDebtSummary } from '@/lib/storage/finance-storage';
import { getActiveHabits, getLast7Days, getStreak } from '@/lib/storage/habit-storage';
import { getGoals, calculateGoalProgress, getMilestones } from '@/lib/storage/goal-storage';
import { getXPState, getTodayXP } from '@/lib/storage/xp-storage';
import { getTasks } from '@/lib/storage/task-storage';
import type { MentorMode } from '@/types';

function buildContext(): string {
  const parts: string[] = [];

  // User profile
  const user = getUser();
  if (user) {
    const birthDate = new Date(user.birthDate);
    const now = new Date();
    const age = Math.floor(
      (now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    const thirtyDate = new Date(birthDate);
    thirtyDate.setFullYear(thirtyDate.getFullYear() + 30);
    const weeksUntil30 = Math.max(
      0,
      Math.ceil(
        (thirtyDate.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000)
      )
    );
    parts.push(
      `- Nome: ${user.name}, ${age} anos` +
        (weeksUntil30 > 0 ? `, ${weeksUntil30} semanas até os 30` : '')
    );
    if (user.objective) {
      parts.push(`- Objetivo principal: ${user.objective}`);
    }
    if (user.monthlyIncome) {
      parts.push(`- Renda mensal: R$${user.monthlyIncome.toLocaleString('pt-BR')}`);
    }
  }

  // Today's plan
  const today = new Date().toISOString().split('T')[0];
  const completion = getCompletionForDate(today);
  if (completion.total > 0) {
    parts.push(
      `- Plano de hoje: ${completion.done}/${completion.total} itens concluídos (${completion.percentage}%)`
    );
  }

  // Financial summary
  const yearMonth = today.slice(0, 7);
  const finance = getMonthSummary(yearMonth);
  if (finance.receita > 0 || finance.despesa > 0) {
    parts.push(
      `- Financeiro este mês: Receita R$${finance.receita.toLocaleString('pt-BR')}, Despesa R$${finance.despesa.toLocaleString('pt-BR')}, Saldo R$${finance.saldo.toLocaleString('pt-BR')}`
    );
    const topCats = Object.entries(finance.byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat, val]) => `${cat}: R$${val.toLocaleString('pt-BR')}`)
      .join(', ');
    if (topCats) {
      parts.push(`- Top categorias: ${topCats}`);
    }
  }

  const debt = getDebtSummary();
  if (debt.total > 0) {
    parts.push(
      `- Dívidas: R$${debt.remaining.toLocaleString('pt-BR')} restante de R$${debt.total.toLocaleString('pt-BR')} total`
    );
  }

  // Habits
  const habits = getActiveHabits();
  if (habits.length > 0) {
    const habitSummary = habits
      .map((h) => {
        const last7 = getLast7Days(h.id);
        const done = last7.filter(Boolean).length;
        const streak = getStreak(h.id);
        return `${h.name}: ${done}/7 dias${streak > 0 ? ` (streak ${streak})` : ''}`;
      })
      .join('; ');
    parts.push(`- Hábitos últimos 7 dias: ${habitSummary}`);
  }

  // Goals
  const goals = getGoals();
  if (goals.length > 0) {
    const goalSummary = goals
      .map((g) => {
        const progress = calculateGoalProgress(g.id);
        return `${g.title} (${g.area}): ${progress}%`;
      })
      .join('; ');
    parts.push(`- Metas: ${goalSummary}`);
  }

  // XP state
  const xp = getXPState();
  parts.push(`- XP: ${xp.totalXP} (Nível ${xp.level}), Streak: ${xp.currentStreak} dias`);

  const todayXP = getTodayXP();
  if (todayXP > 0) {
    parts.push(`- XP ganho hoje: +${todayXP}`);
  }

  // Tasks in backlog
  const tasks = getTasks();
  const backlog = tasks.filter((t) => t.status === 'backlog' || t.status === 'planned');
  if (backlog.length > 0) {
    const taskList = backlog
      .slice(0, 8)
      .map(
        (t) =>
          `${t.title} (${t.priority}${t.deadline ? `, prazo ${t.deadline}` : ''}${t.estimatedMinutes ? `, ${t.estimatedMinutes}min` : ''})`
      )
      .join('; ');
    parts.push(`- Tarefas pendentes (${backlog.length}): ${taskList}`);
  }

  return parts.join('\n');
}

export default function MentorPage() {
  const [mode, setMode] = React.useState<MentorMode>('planner');
  const [inputValue, setInputValue] = React.useState('');
  const [storedMessages, setStoredMessages] = React.useState<StoredChatMessage[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const autoGreetedRef = React.useRef<Set<string>>(new Set());

  // Build context on each render (lightweight — reads from localStorage)
  const contextRef = React.useRef('');
  React.useEffect(() => {
    contextRef.current = buildContext();
  }, [mode]);

  const transportRef = React.useRef(
    new DefaultChatTransport({
      api: '/api/chat',
      body: { mode, context: contextRef.current },
    })
  );

  // Update the transport body when mode changes
  React.useEffect(() => {
    transportRef.current = new DefaultChatTransport({
      api: '/api/chat',
      body: { mode, context: contextRef.current },
    });
  }, [mode]);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: `mentor-${mode}`,
    transport: transportRef.current,
  });

  const isStreaming = status === 'streaming';

  // Load stored messages on mount and mode change
  React.useEffect(() => {
    const stored = getMessages(mode, 50);
    setStoredMessages(stored);
  }, [mode]);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, storedMessages, status]);

  // Save messages to localStorage when streaming completes
  const prevStatusRef = React.useRef(status);
  React.useEffect(() => {
    if (prevStatusRef.current === 'streaming' && status === 'ready') {
      // Find the last user message and last assistant message
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      const lastAssistantMsg = [...messages]
        .reverse()
        .find((m) => m.role === 'assistant');

      if (lastUserMsg) {
        const userText = getMessageText(lastUserMsg);
        // Check if this message is already stored
        const alreadyStored = storedMessages.some(
          (s) => s.content === userText && s.role === 'user'
        );
        if (!alreadyStored && userText) {
          saveMessage({
            userId: 'local',
            role: 'user',
            content: userText,
            mode,
          });
        }
      }

      if (lastAssistantMsg) {
        const assistantText = getMessageText(lastAssistantMsg);
        const alreadyStored = storedMessages.some(
          (s) => s.content === assistantText && s.role === 'assistant'
        );
        if (!alreadyStored && assistantText) {
          saveMessage({
            userId: 'local',
            role: 'assistant',
            content: assistantText,
            mode,
          });
        }
      }

      // Refresh stored messages
      setStoredMessages(getMessages(mode, 50));
    }
    prevStatusRef.current = status;
  }, [status, messages, mode, storedMessages]);

  // Auto-greeting for planner and review modes
  React.useEffect(() => {
    if (mode === 'chat') return;
    if (isStreaming) return;
    if (messages.length > 0) return;

    const today = new Date().toISOString().split('T')[0];
    const todayMessages = getMessagesForDate(today, mode);
    const greetKey = `${mode}-${today}`;

    if (todayMessages.length === 0 && !autoGreetedRef.current.has(greetKey)) {
      autoGreetedRef.current.add(greetKey);
      const autoText =
        mode === 'planner'
          ? 'Monte meu plano de hoje e me diga minhas prioridades'
          : 'Analise meu dia de hoje — o que fiz, o que faltou, e me dê feedback';

      // Small delay to let transport initialize
      const timer = setTimeout(() => {
        sendMessage({ text: autoText });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mode, messages.length, isStreaming, sendMessage]);

  function handleSend() {
    const text = inputValue.trim();
    if (!text || isStreaming) return;
    setInputValue('');
    // Update context before sending
    contextRef.current = buildContext();
    transportRef.current = new DefaultChatTransport({
      api: '/api/chat',
      body: { mode, context: contextRef.current },
    });
    sendMessage({ text });
  }

  // Extract text from message parts
  function getMessageText(message: (typeof messages)[number]): string {
    if (message.parts) {
      return message.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('');
    }
    return '';
  }

  // Determine which messages to show: stored history + live messages
  const hasLiveMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-mentor/15">
            <Brain className="size-5 text-mentor" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Mentor IA</h1>
            <p className="text-sm text-muted-foreground">
              Seu conselheiro pessoal para decisões e planejamento
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <ModeSelector value={mode} onChange={setMode} />
      </div>

      <Separator />

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Stored history (only show when no live messages) */}
        {!hasLiveMessages &&
          storedMessages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
            />
          ))}

        {/* Live messages from useChat */}
        {messages.map((message) => {
          const text = getMessageText(message);
          if (!text) return null;
          return (
            <ChatMessage
              key={message.id}
              role={message.role as 'user' | 'assistant'}
              content={text}
              isStreaming={
                isStreaming &&
                message.role === 'assistant' &&
                message.id === messages[messages.length - 1]?.id
              }
            />
          );
        })}

        {/* Streaming indicator when waiting for first token */}
        {isStreaming &&
          messages.length > 0 &&
          messages[messages.length - 1].role === 'user' && (
            <ChatMessage role="assistant" content="" isStreaming />
          )}

        {/* Empty state */}
        {!hasLiveMessages && storedMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-mentor/10 mb-4">
              <Brain className="size-8 text-mentor/60" />
            </div>
            <h3 className="font-semibold">Nenhuma mensagem ainda</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {mode === 'chat'
                ? 'Converse com seu Mentor sobre qualquer assunto.'
                : mode === 'planner'
                  ? 'O planejador vai montar seu plano do dia automaticamente.'
                  : 'O review vai analisar seu dia automaticamente.'}
            </p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="pt-3 pb-1">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          disabled={isStreaming}
        />
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Mentor IA combina as mentalidades de Hormozi, Goggins, Naval, Munger e
          Jocko.
        </p>
      </div>
    </div>
  );
}
