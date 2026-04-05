"use client";

import * as React from "react";
import { differenceInWeeks, differenceInDays } from "date-fns";
import { Timer, TrendingDown } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { getUser } from "@/lib/storage/user-storage";

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: "easeOut",
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [value, motionVal, rounded]);

  return <span className={className}>{display.toLocaleString("pt-BR")}</span>;
}

const TARGET_AGE = 30;
const FALLBACK_BIRTH = "1997-03-15";

export function CountdownCard() {
  const [birthDateStr, setBirthDateStr] = React.useState<string>(FALLBACK_BIRTH);

  React.useEffect(() => {
    const user = getUser();
    if (user?.birthDate) {
      setBirthDateStr(user.birthDate);
    }
  }, []);

  const birthDate = new Date(birthDateStr + "T00:00:00");
  const targetDate = new Date(
    birthDate.getFullYear() + TARGET_AGE,
    birthDate.getMonth(),
    birthDate.getDate()
  );

  const now = new Date();
  const weeksLeft = differenceInWeeks(targetDate, now);
  const daysLeft = differenceInDays(targetDate, now);
  const totalWeeks = differenceInWeeks(targetDate, birthDate);
  const weeksLived = totalWeeks - weeksLeft;
  const progressPercent = totalWeeks > 0 ? Math.round((weeksLived / totalWeeks) * 100) : 0;

  const targetStr = targetDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className={`relative overflow-hidden border-0 bg-gradient-to-br from-[oklch(0.2_0.06_264)] via-[oklch(0.18_0.08_280)] to-[oklch(0.2_0.1_300)] glow-card card-hover ${weeksLeft > 0 && weeksLeft < 10 * 52 ? 'animate-pulse-intense' : ''}`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <CardContent className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/20">
            <Timer className="size-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Semanas ate os {TARGET_AGE}
            </p>
            <div className="flex items-baseline gap-2">
              <AnimatedNumber
                value={weeksLeft > 0 ? weeksLeft : 0}
                className="font-mono text-5xl font-black tracking-tighter text-foreground"
              />
              <span className="text-lg font-medium text-muted-foreground">
                semanas
              </span>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              {daysLeft > 0 ? daysLeft.toLocaleString("pt-BR") : 0} dias restantes
            </p>
          </div>
        </div>

        {/* Mini progress */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingDown className="size-3.5" />
            <span className="font-mono tabular-nums">{progressPercent}% vivido</span>
          </div>
          <div className="h-2 w-48 rounded-full bg-background/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-[oklch(0.7_0.2_340)] transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-mono tabular-nums">
            {targetStr}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
