"use client";

import Link from "next/link";
import { Brain, MessageSquare, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MOCK_MESSAGE = `Bom dia, Hugo. Hoje e quinta — se fechar forte, sexta fica leve. Prioridade: fechar o PR da 4LeafTech antes do almoco.`;

export function MentorPreview() {
  return (
    <Card className="relative overflow-hidden border-0 bg-card/80 backdrop-blur-sm card-hover">
      {/* Purple glow border effect */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-mentor/20 pointer-events-none" />
      <div className="absolute -top-12 -right-12 size-32 rounded-full bg-mentor/5 blur-3xl pointer-events-none" />

      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-mentor">
            <Brain className="size-4 text-white" />
          </div>
          <CardTitle>Mentor</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative rounded-lg bg-mentor/5 border border-mentor/10 p-3">
          <MessageSquare className="absolute -top-2 -left-2 size-4 text-mentor/40" />
          <p className="text-sm leading-relaxed text-foreground/90">
            {MOCK_MESSAGE}
          </p>
        </div>
      </CardContent>

      <CardFooter className="border-t-mentor/10">
        <Link href="/mentor" className="w-full">
          <Button
            variant="ghost"
            className="w-full justify-between text-mentor hover:text-mentor hover:bg-mentor/10 btn-press"
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="size-4" />
              Abrir Chat
            </span>
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
