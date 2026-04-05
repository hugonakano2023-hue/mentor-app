'use client';

import * as React from 'react';
import { Sunrise, MessageSquare, Moon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMessages } from '@/lib/storage/chat-storage';
import type { MentorMode } from '@/types';

interface ModeSelectorProps {
  value: MentorMode;
  onChange: (mode: MentorMode) => void;
}

const MODES: {
  value: MentorMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'planner', label: 'Planejador', icon: Sunrise },
  { value: 'chat', label: 'Chat', icon: MessageSquare },
  { value: 'review', label: 'Review', icon: Moon },
];

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const [messageCounts, setMessageCounts] = React.useState<
    Record<MentorMode, number>
  >({ planner: 0, chat: 0, review: 0 });

  React.useEffect(() => {
    setMessageCounts({
      planner: getMessages('planner').length,
      chat: getMessages('chat').length,
      review: getMessages('review').length,
    });
  }, [value]);

  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as MentorMode)}>
      <TabsList className="w-full">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const count = messageCounts[mode.value];
          const isActive = mode.value === value;
          return (
            <TabsTrigger
              key={mode.value}
              value={mode.value}
              className="flex-1 gap-1.5 relative"
            >
              <Icon className="size-3.5" />
              {mode.label}
              {!isActive && count > 0 && (
                <span className="absolute -top-1 -right-1 flex size-2 rounded-full bg-mentor" />
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
