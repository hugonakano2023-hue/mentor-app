/**
 * User Profile Storage
 */
import { getValue, setValue, STORAGE_KEYS } from './index';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  birthDate: string; // YYYY-MM-DD
  timezone: string;
  objective: string;
  // Workout config
  fitnessLevel: 'iniciante' | 'intermediario' | 'avancado';
  fitnessGoal: 'hipertrofia' | 'forca' | 'resistencia' | 'perda_gordura';
  workoutDaysPerWeek: number;
  workoutMinutesPerSession: number;
  availableEquipment: string[];
  // Finance
  monthlyIncome: number;
  fixedCosts: { name: string; amount: number }[];
  createdAt: string;
};

export function getUser(): UserProfile | null {
  return getValue<UserProfile>(STORAGE_KEYS.USER);
}

export function setUser(profile: UserProfile): void {
  setValue<UserProfile>(STORAGE_KEYS.USER, profile);
}

export function updateUser(partial: Partial<UserProfile>): UserProfile | null {
  const current = getUser();
  if (!current) return null;
  const updated = { ...current, ...partial };
  setUser(updated);
  return updated;
}

export function isOnboardingDone(): boolean {
  return getValue<boolean>(STORAGE_KEYS.ONBOARDING_DONE) === true;
}

export function setOnboardingDone(): void {
  setValue<boolean>(STORAGE_KEYS.ONBOARDING_DONE, true);
}
