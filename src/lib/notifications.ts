/**
 * Notification System
 *
 * Handles notification configuration, permission requests,
 * service worker registration, and local notification scheduling.
 */

import { getValue, setValue } from '@/lib/storage/index';

export type NotificationConfig = {
  morningTime: string; // HH:mm
  constructionBlockTime: string; // HH:mm
  nightTime: string; // HH:mm
  morningEnabled: boolean;
  constructionBlockEnabled: boolean;
  nightEnabled: boolean;
  budgetAlertsEnabled: boolean;
  waterReminderEnabled: boolean;
};

const NOTIFICATION_CONFIG_KEY = 'mentor_notification_config';

const DEFAULT_CONFIG: NotificationConfig = {
  morningTime: '07:00',
  constructionBlockTime: '18:45',
  nightTime: '22:45',
  morningEnabled: true,
  constructionBlockEnabled: true,
  nightEnabled: true,
  budgetAlertsEnabled: true,
  waterReminderEnabled: false,
};

export function getNotificationConfig(): NotificationConfig {
  const stored = getValue<NotificationConfig>(NOTIFICATION_CONFIG_KEY);
  return stored ?? { ...DEFAULT_CONFIG };
}

export function setNotificationConfig(config: Partial<NotificationConfig>): void {
  const current = getNotificationConfig();
  const updated = { ...current, ...config };
  setValue<NotificationConfig>(NOTIFICATION_CONFIG_KEY, updated);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationsSupported()) return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function isNotificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch {
    // Silently fail — SW registration is non-critical
  }
}

/**
 * Schedule local notifications using setTimeout (simple approach).
 * In a real app, you'd use Push API with a server.
 */
export function scheduleNotifications(): void {
  const config = getNotificationConfig();
  if (!isNotificationsSupported() || Notification.permission !== 'granted') return;

  const now = new Date();

  const scheduleAt = (timeStr: string, title: string, body: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= now) return; // already past
    const delay = target.getTime() - now.getTime();
    setTimeout(() => {
      new Notification(title, { body, icon: '/icon.svg' });
    }, delay);
  };

  if (config.morningEnabled) {
    scheduleAt(
      config.morningTime,
      'Bom dia!',
      'Seu plano do dia esta pronto. Vamos executar.'
    );
  }
  if (config.constructionBlockEnabled) {
    scheduleAt(
      config.constructionBlockTime,
      'Bloco de Construcao',
      'Hora de construir. Celular em modo aviao. Executa.'
    );
  }
  if (config.nightEnabled) {
    scheduleAt(
      config.nightTime,
      'Review do Dia',
      'Como foi seu dia? Registre seus habitos e veja seu feedback.'
    );
  }
}
