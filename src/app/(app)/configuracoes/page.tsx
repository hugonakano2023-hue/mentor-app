'use client';

import * as React from 'react';
import {
  Settings,
  Bell,
  BellOff,
  Clock,
  User,
  Shield,
  Droplets,
  Wallet,
  Sun,
  Hammer,
  Moon,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  getNotificationConfig,
  setNotificationConfig,
  requestNotificationPermission,
  isNotificationsSupported,
  scheduleNotifications,
  type NotificationConfig,
} from '@/lib/notifications';
import { getSession } from '@/lib/auth';
import { getUser } from '@/lib/storage/user-storage';
import { getLevel, getXPState } from '@/lib/storage/xp-storage';

export default function ConfiguracoesPage() {
  const [config, setConfig] = React.useState<NotificationConfig | null>(null);
  const [permissionStatus, setPermissionStatus] = React.useState<
    'default' | 'granted' | 'denied'
  >('default');
  const [profile, setProfile] = React.useState<{
    name: string;
    email: string;
    birthDate: string;
    level: number;
    totalXP: number;
    streak: number;
  } | null>(null);

  React.useEffect(() => {
    setConfig(getNotificationConfig());

    if (isNotificationsSupported()) {
      setPermissionStatus(Notification.permission as 'default' | 'granted' | 'denied');
    }

    const session = getSession();
    const user = getUser();
    const levelInfo = getLevel();
    const xpState = getXPState();

    setProfile({
      name: session?.name ?? user?.name ?? 'Usuario',
      email: session?.email ?? user?.email ?? '',
      birthDate: user?.birthDate ?? '',
      level: levelInfo.level,
      totalXP: levelInfo.totalXP,
      streak: xpState.currentStreak,
    });
  }, []);

  function handleToggle(key: keyof NotificationConfig, value: boolean) {
    if (!config) return;
    const updated = { ...config, [key]: value };
    setConfig(updated);
    setNotificationConfig({ [key]: value });
  }

  function handleTimeChange(key: keyof NotificationConfig, value: string) {
    if (!config) return;
    const updated = { ...config, [key]: value };
    setConfig(updated);
    setNotificationConfig({ [key]: value });
  }

  async function handleRequestPermission() {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    if (granted) {
      scheduleNotifications();
    }
  }

  if (!config || !profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
          <Settings className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Configuracoes</h1>
          <p className="text-sm text-muted-foreground">
            Perfil, notificacoes e preferencias
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="size-4 text-primary" />
            Perfil
          </CardTitle>
          <CardDescription>Suas informacoes pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Nome
              </Label>
              <p className="text-sm font-medium">{profile.name}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Email
              </Label>
              <p className="text-sm font-medium">{profile.email || '—'}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Data de Nascimento
              </Label>
              <p className="text-sm font-medium">
                {profile.birthDate
                  ? new Date(profile.birthDate + 'T12:00:00').toLocaleDateString('pt-BR')
                  : '—'}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Level / XP
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  Level {profile.level}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground">
                  {profile.totalXP.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Permission */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            Permissao de Notificacoes
          </CardTitle>
          <CardDescription>
            Necessario para receber alertas no navegador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {permissionStatus === 'granted' ? (
                <Bell className="size-5 text-emerald-400" />
              ) : (
                <BellOff className="size-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {permissionStatus === 'granted'
                    ? 'Notificacoes ativadas'
                    : permissionStatus === 'denied'
                      ? 'Notificacoes bloqueadas'
                      : 'Notificacoes pendentes'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {permissionStatus === 'granted'
                    ? 'Voce recebera alertas conforme configurado abaixo.'
                    : permissionStatus === 'denied'
                      ? 'Desbloqueie nas configuracoes do navegador.'
                      : 'Clique no botao para permitir notificacoes.'}
                </p>
              </div>
            </div>
            {permissionStatus !== 'granted' && (
              <Button
                onClick={handleRequestPermission}
                disabled={permissionStatus === 'denied'}
                size="sm"
              >
                <Bell className="size-3.5 mr-1.5" />
                Permitir
              </Button>
            )}
            {permissionStatus === 'granted' && (
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                Ativo
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Schedules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Horarios de Notificacao
          </CardTitle>
          <CardDescription>
            Configure quando receber cada tipo de alerta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Morning */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                <Sun className="size-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Bom dia</p>
                <p className="text-xs text-muted-foreground truncate">
                  Plano do dia pronto
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Input
                type="time"
                value={config.morningTime}
                onChange={(e) => handleTimeChange('morningTime', e.target.value)}
                className="w-28"
                disabled={!config.morningEnabled}
              />
              <Switch
                checked={config.morningEnabled}
                onCheckedChange={(val) => handleToggle('morningEnabled', val)}
              />
            </div>
          </div>

          <Separator />

          {/* Construction Block */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                <Hammer className="size-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Bloco de Construcao</p>
                <p className="text-xs text-muted-foreground truncate">
                  Hora de construir
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Input
                type="time"
                value={config.constructionBlockTime}
                onChange={(e) =>
                  handleTimeChange('constructionBlockTime', e.target.value)
                }
                className="w-28"
                disabled={!config.constructionBlockEnabled}
              />
              <Switch
                checked={config.constructionBlockEnabled}
                onCheckedChange={(val) =>
                  handleToggle('constructionBlockEnabled', val)
                }
              />
            </div>
          </div>

          <Separator />

          {/* Night */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
                <Moon className="size-4 text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Review do Dia</p>
                <p className="text-xs text-muted-foreground truncate">
                  Registre habitos e veja feedback
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Input
                type="time"
                value={config.nightTime}
                onChange={(e) => handleTimeChange('nightTime', e.target.value)}
                className="w-28"
                disabled={!config.nightEnabled}
              />
              <Switch
                checked={config.nightEnabled}
                onCheckedChange={(val) => handleToggle('nightEnabled', val)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extra Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            Alertas Extras
          </CardTitle>
          <CardDescription>
            Notificacoes adicionais opcionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Budget alerts */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                <Wallet className="size-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Alertas de Orcamento</p>
                <p className="text-xs text-muted-foreground">
                  Avisa quando se aproximar do limite
                </p>
              </div>
            </div>
            <Switch
              checked={config.budgetAlertsEnabled}
              onCheckedChange={(val) => handleToggle('budgetAlertsEnabled', val)}
            />
          </div>

          <Separator />

          {/* Water reminder */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
                <Droplets className="size-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Lembrete de Agua</p>
                <p className="text-xs text-muted-foreground">
                  Notifica a cada 2 horas para beber agua
                </p>
              </div>
            </div>
            <Switch
              checked={config.waterReminderEnabled}
              onCheckedChange={(val) =>
                handleToggle('waterReminderEnabled', val)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
