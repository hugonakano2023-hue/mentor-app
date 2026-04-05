'use client';

import * as React from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  }

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [value]);

  return (
    <div
      className={cn(
        'relative rounded-2xl p-[1px] transition-all duration-300',
        isFocused
          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
          : 'bg-border'
      )}
    >
      <div className="flex items-end gap-2 rounded-[calc(1rem-1px)] bg-card px-4 py-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Pergunte ao seu Mentor..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <Button
          size="icon"
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className={cn(
            'size-8 rounded-xl shrink-0 transition-all',
            value.trim() && !disabled
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'
              : ''
          )}
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  );
}
