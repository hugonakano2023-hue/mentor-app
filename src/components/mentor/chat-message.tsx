'use client';

import * as React from 'react';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

/** Simple markdown-like renderer for bold and lists */
function renderContent(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Unordered list item
    if (/^[-*]\s/.test(line)) {
      elements.push(
        <li key={i} className="ml-4 list-disc">
          {renderInline(line.replace(/^[-*]\s/, ''))}
        </li>
      );
      continue;
    }

    // Ordered list item
    if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={i} className="ml-4 list-decimal">
          {renderInline(line.replace(/^\d+\.\s/, ''))}
        </li>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<br key={i} />);
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="leading-relaxed">
        {renderInline(line)}
      </p>
    );
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isAssistant = role === 'assistant';

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%]',
        isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <Avatar size="default" className="shrink-0 mt-0.5">
        <AvatarFallback
          className={cn(
            'text-xs font-bold',
            isAssistant
              ? 'bg-mentor/20 text-mentor'
              : 'bg-primary/20 text-primary'
          )}
        >
          {isAssistant ? <Brain className="size-4" /> : 'H'}
        </AvatarFallback>
      </Avatar>

      {/* Message bubble */}
      <div
        className={cn(
          'rounded-2xl px-4 py-3 text-sm space-y-1',
          isAssistant
            ? 'bg-card ring-1 ring-mentor/20'
            : 'bg-primary/15 ring-1 ring-primary/20'
        )}
      >
        {isAssistant && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-mentor">
            Mentor
          </span>
        )}
        <div className="space-y-1">{renderContent(content)}</div>
        {isStreaming && (
          <span className="inline-flex gap-0.5 mt-1">
            <span className="size-1.5 rounded-full bg-mentor/60 animate-pulse" />
            <span className="size-1.5 rounded-full bg-mentor/60 animate-pulse [animation-delay:150ms]" />
            <span className="size-1.5 rounded-full bg-mentor/60 animate-pulse [animation-delay:300ms]" />
          </span>
        )}
      </div>
    </div>
  );
}
