/**
 * Event Bus — Simple pub/sub for cross-module communication
 */

type EventType =
  | 'task:completed'
  | 'workout:completed'
  | 'habit:logged'
  | 'xp:earned'
  | 'streak:updated'
  | 'budget:alert'
  | 'debt:paid'
  | 'plan:generated'
  | 'achievement:unlocked';

type EventPayload = {
  'task:completed': { taskId: string; title: string; xpEarned: number; hasGoal: boolean };
  'workout:completed': { workoutId: string; type: string; xpEarned: number };
  'habit:logged': { habitId: string; name: string; value: string };
  'xp:earned': { amount: number; reason: string; newTotal: number };
  'streak:updated': { days: number; isNew: boolean };
  'budget:alert': { category: string; spent: number; limit: number };
  'debt:paid': { debtId: string; creditor: string; remaining: number };
  'plan:generated': { date: string; itemCount: number };
  'achievement:unlocked': { id: string; name: string; icon: string };
};

type Callback<T extends EventType> = (payload: EventPayload[T]) => void;

class EventBus {
  private listeners: Map<string, Set<Function>> = new Map();

  on<T extends EventType>(event: T, callback: Callback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  emit<T extends EventType>(event: T, payload: EventPayload[T]): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;
    for (const cb of callbacks) {
      try {
        cb(payload);
      } catch (err) {
        console.error(`[EventBus] Error in listener for "${event}":`, err);
      }
    }
  }

  off<T extends EventType>(event: T, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;
    callbacks.delete(callback);
    if (callbacks.size === 0) {
      this.listeners.delete(event);
    }
  }
}

export const eventBus = new EventBus();
export type { EventType, EventPayload };
