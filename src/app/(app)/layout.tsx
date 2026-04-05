"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ListTodo,
  Brain,
  Dumbbell,
  Wallet,
  Heart,
  Target,
  BarChart3,
  Menu,
  Flame,
  Zap,
  Sparkles,
  LogOut,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/auth/auth-guard";
import { getSession, logout } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/rotina", label: "Rotina", icon: CalendarDays },
  { href: "/tarefas", label: "Tarefas", icon: ListTodo },
  { href: "/mentor", label: "Mentor IA", icon: Brain },
  { href: "/treino", label: "Treino", icon: Dumbbell },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/habitos", label: "Habitos", icon: Heart },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/review", label: "Review", icon: BarChart3 },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings },
] as const;

import { getXPState, getLevel } from "@/lib/storage/xp-storage";

// -- User stats (reads session + XP from localStorage) --
function useUserStats() {
  const session = getSession();
  const [stats, setStats] = React.useState({
    name: session?.name ?? "Usuario",
    initials: (session?.name ?? "U").charAt(0).toUpperCase(),
    level: 1,
    xp: 0,
    xpToNext: 1000,
    streak: 0,
  });

  React.useEffect(() => {
    const xpState = getXPState();
    const levelInfo = getLevel();
    const currentSession = getSession();
    setStats({
      name: currentSession?.name ?? "Usuario",
      initials: (currentSession?.name ?? "U").charAt(0).toUpperCase(),
      level: levelInfo.level,
      xp: levelInfo.totalXP,
      xpToNext: 1000,
      streak: xpState.currentStreak,
    });
  }, []);

  return stats;
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={href}
            onClick={onClick}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/15 text-primary glow-card"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          />
        }
      >
        <Icon
          className={cn(
            "size-5 shrink-0 transition-colors",
            isActive
              ? "text-primary"
              : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        <span>{label}</span>
        {isActive && (
          <span className="ml-auto size-1.5 rounded-full bg-primary animate-pulse" />
        )}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function UserSection() {
  const router = useRouter();
  const stats = useUserStats();
  const xpPercent = stats.xpToNext > 0
    ? Math.round((stats.xp / stats.xpToNext) * 100)
    : 0;

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <div className="space-y-3">
      <Separator />

      {/* XP & Streak Badges */}
      <div className="flex items-center gap-2 px-3">
        <div className="flex items-center gap-1.5 rounded-lg bg-xp/10 px-2.5 py-1.5 glow-xp">
          <Zap className="size-3.5 text-xp" />
          <span className="text-xs font-bold text-xp tabular-nums">
            {stats.xp.toLocaleString()} XP
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-streak/10 px-2.5 py-1.5 glow-streak">
          <Flame className="size-3.5 text-streak" />
          <span className="text-xs font-bold text-streak tabular-nums">
            {stats.streak} dias
          </span>
        </div>
      </div>

      {/* XP Progress bar */}
      <div className="px-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Level {stats.level}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
            {xpPercent}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      <Separator />

      {/* User Info */}
      <div className="flex items-center gap-3 px-3 py-1">
        <Avatar size="default">
          <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
            {stats.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{stats.name}</p>
          <div className="flex items-center gap-1">
            <Sparkles className="size-3 text-level" />
            <span className="text-xs text-muted-foreground">
              Level {stats.level}
            </span>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleLogout}
              />
            }
          >
            <LogOut className="size-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent side="top">Sair</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function MobileStats() {
  const stats = useUserStats();
  return (
    <div className="ml-auto flex items-center gap-2">
      <div className="flex items-center gap-1 text-xs font-bold text-xp">
        <Zap className="size-3.5" />
        {stats.xp.toLocaleString()}
      </div>
      <div className="flex items-center gap-1 text-xs font-bold text-streak">
        <Flame className="size-3.5" />
        {stats.streak}
      </div>
    </div>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent glow-card">
          <Brain className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">Mentor</h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Sistema de Vida
          </p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-3">
        <TooltipProvider>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                onClick={onNavClick}
              />
            ))}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* Bottom: User section */}
      <div className="px-2 pb-4">
        <TooltipProvider>
          <UserSection />
        </TooltipProvider>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <AuthGuard>
    <div className="flex h-full min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col border-r border-border bg-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Header + Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="flex flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm md:hidden">
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Menu className="size-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              }
            />
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Brain className="size-4 text-white" />
              </div>
              <span className="text-sm font-bold">Mentor</span>
            </div>

            {/* Mobile XP/Streak compact */}
            <MobileStats />
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Sheet Sidebar */}
        <SheetContent side="left" className="w-72 p-0 bg-sidebar">
          <SheetTitle className="sr-only">Menu de navegacao</SheetTitle>
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
    </AuthGuard>
  );
}
