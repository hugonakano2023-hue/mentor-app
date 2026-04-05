'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup, login, setSession, getSession } from '@/lib/auth';
import { seedInitialData } from '@/lib/storage/seed';
import { setValue, STORAGE_KEYS } from '@/lib/storage';

export default function DevEnterPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Preparando o app...');

  useEffect(() => {
    async function setup() {
      // Check if already logged in
      const session = getSession();
      if (session) {
        setStatus('Sessão encontrada! Redirecionando...');
        // Make sure data is seeded
        seedInitialData();
        setValue(STORAGE_KEYS.ONBOARDING_DONE, true);
        router.replace('/dashboard');
        return;
      }

      setStatus('Criando conta de teste...');

      // Create test account
      const email = 'hugo@mentor.app';
      const password = '123456';
      const name = 'Hugo';

      // Try login first (in case account already exists)
      const existing = login(email, password);
      if (existing) {
        setStatus('Conta encontrada! Populando dados...');
        seedInitialData();
        setValue(STORAGE_KEYS.ONBOARDING_DONE, true);
        setStatus('Pronto! Redirecionando...');
        router.replace('/dashboard');
        return;
      }

      // Create new account
      const result = signup(name, email, password);
      if ('error' in result) {
        // Account exists but wrong password? Try to login
        setStatus('Erro: ' + result.error);
        return;
      }

      setStatus('Populando dados de exemplo...');

      // Seed all data
      seedInitialData();

      // Mark onboarding as done
      setValue(STORAGE_KEYS.ONBOARDING_DONE, true);

      setStatus('Pronto! Redirecionando para o dashboard...');

      setTimeout(() => {
        router.replace('/dashboard');
      }, 500);
    }

    setup();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-gradient-to-br from-primary to-accent glow-card">
        <span className="text-4xl">🚀</span>
      </div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        MENTOR APP
      </h1>
      <p className="text-muted-foreground animate-pulse">{status}</p>
      <div className="flex gap-2 mt-4">
        <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="size-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
