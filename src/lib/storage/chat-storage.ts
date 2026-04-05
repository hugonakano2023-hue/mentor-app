/**
 * Chat Message Storage
 */
import {
  type StoredEntity,
  getCollection,
  setCollection,
  create,
  STORAGE_KEYS,
} from './index';

export type StoredChatMessage = StoredEntity & {
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  mode: 'planner' | 'chat' | 'review';
};

const KEY = STORAGE_KEYS.CHAT_MESSAGES;

export function getMessages(
  mode: StoredChatMessage['mode'],
  limit?: number
): StoredChatMessage[] {
  let messages = getCollection<StoredChatMessage>(KEY)
    .filter((m) => m.mode === mode)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  if (limit !== undefined) {
    messages = messages.slice(-limit);
  }

  return messages;
}

export function getMessagesForDate(
  date: string, // YYYY-MM-DD
  mode: StoredChatMessage['mode']
): StoredChatMessage[] {
  return getCollection<StoredChatMessage>(KEY)
    .filter((m) => m.mode === mode && m.createdAt.startsWith(date))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export function saveMessage(
  data: Omit<StoredChatMessage, 'id' | 'createdAt'>
): StoredChatMessage {
  return create<StoredChatMessage>(KEY, data);
}

export function clearMessages(mode: StoredChatMessage['mode']): void {
  const all = getCollection<StoredChatMessage>(KEY);
  const filtered = all.filter((m) => m.mode !== mode);
  setCollection(KEY, filtered);
}
