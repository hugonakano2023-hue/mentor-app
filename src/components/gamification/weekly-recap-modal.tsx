'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Flame, Zap, Trophy, Dumbbell, ListChecks, Wallet, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWeeklyCompletion, getCompletionForDate } from '@/lib/storage/day-plan-storage';
import { getXPState, getWeekXP } from '@/lib/storage/xp-storage';
import { getMonthSummary } from '@/lib/storage/finance-storage';
import { getWorkouts } from '@/lib/storage/workout-storage';

const TOTAL_SLIDES = 7;
const AUTO_ADVANCE_MS = 4000;
const RECAP_KEY = 'mentor_last_recap_week';

type RecapData = {
  weekRange: string;
  grade: string;
  gradeBg: string;
  tasksCompleted: number;
  tasksTotal: number;
  tasksPct: number;
  workoutsCompleted: number;
  workoutsTotal: number;
  workoutTypes: string[];
  streak: number;
  longestStreak: number;
  weekXP: number;
  level: number;
  xpInLevel: number;
  receita: number;
  despesa: number;
  saldo: number;
  mentorMessage: string;
};

function getWeekNumber(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return `${now.getFullYear()}-W${Math.ceil(diff / oneWeek)}`;
}

function getWeekRange(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
  return `${fmt(monday)} — ${fmt(sunday)}`;
}

function computeGrade(pct: number): { grade: string; bg: string } {
  if (pct >= 90) return { grade: 'A', bg: 'from-emerald-500 to-emerald-700' };
  if (pct >= 75) return { grade: 'B', bg: 'from-blue-500 to-blue-700' };
  if (pct >= 55) return { grade: 'C', bg: 'from-amber-500 to-amber-700' };
  if (pct >= 35) return { grade: 'D', bg: 'from-orange-500 to-orange-700' };
  return { grade: 'F', bg: 'from-red-500 to-red-700' };
}

function buildMotivationalMessage(data: RecapData): string {
  if (data.grade === 'A') {
    return 'Semana excepcional. Você provou que disciplina gera resultados. Mantenha essa intensidade — é assim que se constrói uma vida extraordinária.';
  }
  if (data.grade === 'B') {
    return 'Boa semana, mas você sabe que pode mais. Identifique os momentos de distração e elimine-os. A diferença entre bom e excelente está nos detalhes.';
  }
  if (data.grade === 'C') {
    return 'Semana mediana. Não é o fim do mundo, mas lembre-se: a mediocridade é o inimigo silencioso. O que você vai mudar na próxima semana?';
  }
  if (data.grade === 'D') {
    return 'Semana difícil. Mas cair faz parte — ficar no chão é que não é opção. Identifique o que travou você e ataque com tudo na próxima.';
  }
  return 'Essa semana não saiu como planejado. Mas Goggins diria: "É justamente agora que você descobre do que é feito." Levanta e volta com força.';
}

function buildRecapData(): RecapData {
  const weeklyCompletion = getWeeklyCompletion();
  const totalTasks = weeklyCompletion.reduce((s, d) => s + d.total, 0);
  const doneTasks = weeklyCompletion.reduce((s, d) => s + d.done, 0);
  const avgPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const { grade, bg } = computeGrade(avgPct);

  const xpState = getXPState();
  const weekXP = getWeekXP();

  // Workouts this week
  const weekDates = weeklyCompletion.map((d) => d.date);
  const allWorkouts = getWorkouts();
  const weekWorkouts = allWorkouts.filter((w) => weekDates.includes(w.date));
  const completedWorkouts = weekWorkouts.filter((w) => w.completed);
  const workoutTypes = [...new Set(completedWorkouts.map((w) => w.type.split('—')[0].trim()))];

  // Finance
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const finance = getMonthSummary(yearMonth);

  const data: RecapData = {
    weekRange: getWeekRange(),
    grade,
    gradeBg: bg,
    tasksCompleted: doneTasks,
    tasksTotal: totalTasks,
    tasksPct: avgPct,
    workoutsCompleted: completedWorkouts.length,
    workoutsTotal: weekWorkouts.length,
    workoutTypes,
    streak: xpState.currentStreak,
    longestStreak: xpState.longestStreak,
    weekXP,
    level: xpState.level,
    xpInLevel: xpState.totalXP % 1000,
    receita: finance.receita,
    despesa: finance.despesa,
    saldo: finance.saldo,
    mentorMessage: '',
  };

  data.mentorMessage = buildMotivationalMessage(data);
  return data;
}

function AnimatedNumber({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const ms = duration * 1000;

    function tick() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / ms);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  }, [value, duration]);

  return <>{display.toLocaleString('pt-BR')}</>;
}

const slideGradients = [
  'from-violet-600/90 to-indigo-900/90',     // Sua Semana
  'from-blue-600/90 to-cyan-900/90',          // Tarefas
  'from-orange-600/90 to-red-900/90',         // Treino
  'from-amber-500/90 to-orange-800/90',       // Streak
  'from-emerald-600/90 to-teal-900/90',       // XP
  'from-pink-600/90 to-purple-900/90',        // Financeiro
  'from-indigo-600/90 to-purple-900/90',      // Mentor
];

export function WeeklyRecapModal() {
  const [open, setOpen] = React.useState(false);
  const [slide, setSlide] = React.useState(0);
  const [data, setData] = React.useState<RecapData | null>(null);
  const [direction, setDirection] = React.useState(1);
  const autoTimer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Check if we should show the recap
  React.useEffect(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Show on Saturday (6) or Sunday (0) or Monday (1)
    if (dayOfWeek !== 0 && dayOfWeek !== 1 && dayOfWeek !== 6) return;

    const currentWeek = getWeekNumber();
    const lastRecap = localStorage.getItem(RECAP_KEY);

    if (lastRecap === currentWeek) return;

    // Show the modal
    setData(buildRecapData());
    setOpen(true);
    localStorage.setItem(RECAP_KEY, currentWeek);
  }, []);

  // Auto-advance
  React.useEffect(() => {
    if (!open) return;

    autoTimer.current = setInterval(() => {
      setDirection(1);
      setSlide((prev) => (prev < TOTAL_SLIDES - 1 ? prev + 1 : prev));
    }, AUTO_ADVANCE_MS);

    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
    };
  }, [open, slide]);

  function goTo(idx: number) {
    if (autoTimer.current) clearInterval(autoTimer.current);
    setDirection(idx > slide ? 1 : -1);
    setSlide(idx);
  }

  function next() {
    if (slide < TOTAL_SLIDES - 1) goTo(slide + 1);
  }

  function prev() {
    if (slide > 0) goTo(slide - 1);
  }

  function close() {
    setOpen(false);
    setSlide(0);
  }

  if (!open || !data) return null;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full max-w-sm mx-4 overflow-hidden rounded-2xl"
      >
        {/* Gradient background */}
        <div className={`bg-gradient-to-br ${slideGradients[slide]} p-6 min-h-[420px] flex flex-col transition-all duration-500`}>
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-20"
          >
            <X className="size-5" />
          </button>

          {/* Slide content */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-full text-center text-white"
              >
                {slide === 0 && (
                  <div className="space-y-4">
                    <Trophy className="size-12 mx-auto text-amber-300" />
                    <h2 className="text-2xl font-bold">Sua Semana</h2>
                    <p className="text-white/70 text-sm">{data.weekRange}</p>
                    <div className={`inline-flex items-center justify-center size-24 rounded-full bg-gradient-to-br ${data.gradeBg} text-5xl font-black shadow-lg`}>
                      {data.grade}
                    </div>
                    <p className="text-white/80 text-sm">Nota geral da semana</p>
                  </div>
                )}

                {slide === 1 && (
                  <div className="space-y-4">
                    <ListChecks className="size-12 mx-auto text-cyan-300" />
                    <h2 className="text-2xl font-bold">Tarefas</h2>
                    <div className="text-5xl font-black tabular-nums">
                      <AnimatedNumber value={data.tasksCompleted} />
                      <span className="text-2xl text-white/50">/{data.tasksTotal}</span>
                    </div>
                    <p className="text-white/80 text-sm">concluídas</p>
                    <div className="w-full bg-white/20 rounded-full h-3 mx-auto max-w-[200px]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.tasksPct}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full bg-white/80"
                      />
                    </div>
                    <p className="text-lg font-bold tabular-nums">
                      <AnimatedNumber value={data.tasksPct} />%
                    </p>
                  </div>
                )}

                {slide === 2 && (
                  <div className="space-y-4">
                    <Dumbbell className="size-12 mx-auto text-orange-300" />
                    <h2 className="text-2xl font-bold">Treino</h2>
                    <div className="text-5xl font-black tabular-nums">
                      <AnimatedNumber value={data.workoutsCompleted} />
                      <span className="text-2xl text-white/50">/{data.workoutsTotal}</span>
                    </div>
                    <p className="text-white/80 text-sm">treinos completos</p>
                    {data.workoutTypes.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {data.workoutTypes.map((t) => (
                          <span key={t} className="rounded-full bg-white/20 px-3 py-1 text-xs">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {slide === 3 && (
                  <div className="space-y-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Flame className="size-16 mx-auto text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                    </motion.div>
                    <h2 className="text-2xl font-bold">Streak</h2>
                    <div className="text-6xl font-black tabular-nums">
                      <AnimatedNumber value={data.streak} />
                    </div>
                    <p className="text-white/80 text-sm">dias consecutivos</p>
                    {data.longestStreak > data.streak && (
                      <p className="text-white/50 text-xs">Recorde: {data.longestStreak} dias</p>
                    )}
                  </div>
                )}

                {slide === 4 && (
                  <div className="space-y-4">
                    <Zap className="size-12 mx-auto text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]" />
                    <h2 className="text-2xl font-bold">XP Ganho</h2>
                    <div className="text-5xl font-black tabular-nums text-emerald-300">
                      +<AnimatedNumber value={data.weekXP} />
                    </div>
                    <p className="text-white/80 text-sm">XP esta semana</p>
                    <div className="space-y-1 mt-4">
                      <p className="text-white/60 text-xs">Level {data.level}</p>
                      <div className="w-full bg-white/20 rounded-full h-2 max-w-[200px] mx-auto">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(data.xpInLevel / 1000) * 100}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full rounded-full bg-emerald-400"
                        />
                      </div>
                      <p className="text-white/50 text-xs">{data.xpInLevel}/1000 XP</p>
                    </div>
                  </div>
                )}

                {slide === 5 && (
                  <div className="space-y-4">
                    <Wallet className="size-12 mx-auto text-pink-300" />
                    <h2 className="text-2xl font-bold">Financeiro</h2>
                    <div className="space-y-3 mt-4">
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider">Receita</p>
                        <p className="text-2xl font-bold text-emerald-300 tabular-nums">
                          R$ <AnimatedNumber value={data.receita} />
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider">Despesa</p>
                        <p className="text-2xl font-bold text-red-300 tabular-nums">
                          R$ <AnimatedNumber value={data.despesa} />
                        </p>
                      </div>
                      <div className="pt-2 border-t border-white/20">
                        <p className="text-white/60 text-xs uppercase tracking-wider">Saldo</p>
                        <p className={`text-3xl font-black tabular-nums ${data.saldo >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                          R$ <AnimatedNumber value={Math.abs(data.saldo)} />
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {slide === 6 && (
                  <div className="space-y-4">
                    <Brain className="size-12 mx-auto text-violet-300" />
                    <h2 className="text-2xl font-bold">Mensagem do Mentor</h2>
                    <p className="text-white/90 text-sm leading-relaxed italic px-2">
                      &ldquo;{data.mentorMessage}&rdquo;
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={prev}
              className="text-white/60 hover:text-white hover:bg-white/10"
              disabled={slide === 0}
            >
              <ChevronLeft className="size-5" />
            </Button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === slide
                      ? 'w-6 h-2 bg-white'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            {slide < TOTAL_SLIDES - 1 ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={next}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <ChevronRight className="size-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={close}
                className="text-white/80 hover:text-white hover:bg-white/10 text-xs"
              >
                Fechar
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
