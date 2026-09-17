import type { IntakeData } from './types';

const STORAGE_KEY = 'alerta:intake';

const EMPTY_INTAKE: IntakeData = {
  categories: [],
  freeText: '',
  evidenceNotes: '',
  reportDraft: '',
};

export function loadIntake(): IntakeData {
  if (typeof window === 'undefined') return { ...EMPTY_INTAKE };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...EMPTY_INTAKE };
  try {
    return { ...EMPTY_INTAKE, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_INTAKE };
  }
}

export function saveIntake(data: IntakeData): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearIntake(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
