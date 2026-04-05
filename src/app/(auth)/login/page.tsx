'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Brain, Mail, Lock, LogIn, Loader2 } from 'lucide-react';

import { login } from '@/lib/auth';
import { isOnboardingDone } from '@/lib/storage/user-storage';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);

    // Small delay so the UI feels responsive
    setTimeout(() => {
      const user = login(email, password);

      if (!user) {
        setError('E-mail ou senha incorretos.');
        setLoading(false);
        return;
      }

      if (isOnboardingDone()) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }, 300);
  }

  return (
    <div className="w-full max-w-md">
      {/* Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 glow-card">
          <Brain className="size-9 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          MENTOR
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Seu sistema operacional de vida
        </p>
      </div>

      <Card className="border-border/50 glow-card">
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                <Mail className="size-4 text-muted-foreground" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-10"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">
                <Lock className="size-4 text-muted-foreground" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-10"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="size-4" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Ainda nao tem conta?{' '}
            <Link
              href="/cadastro"
              className="text-primary font-semibold hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
