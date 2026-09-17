import type { Category, IntakeData } from './types';

const STORAGE_KEY = 'alerta:intake';

// Mirrors the Category union in lib/types.ts (the same literals also live in
// lib/claude.ts's VALID_CATEGORIES). Kept as a plain array here — rather than
// importing lib/claude.ts — so this client-side module doesn't pull the
// Anthropic SDK into the browser bundle.
const VALID_CATEGORIES: Category[] = [
  'foto-sem-autorizacao',
  'imagem-criada-ia',
  'imagem-alterada',
  'publicada-sem-consentimento',
  'ameaca-exposicao',
  'nao-sei',
];

const EMPTY_INTAKE: IntakeData = {
  categories: [],
  freeText: '',
  evidenceNotes: '',
  reportDraft: '',
};

export function loadIntake(): IntakeData {
  if (typeof window === 'undefined') return { ...EMPTY_INTAKE };

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { ...EMPTY_INTAKE };
  }
  if (!raw) return { ...EMPTY_INTAKE };

  try {
    const parsed = JSON.parse(raw);
    const categories = Array.isArray(parsed?.categories)
      ? parsed.categories.filter((item: unknown): item is Category =>
          VALID_CATEGORIES.includes(item as Category)
        )
      : EMPTY_INTAKE.categories;
    return { ...EMPTY_INTAKE, ...parsed, categories };
  } catch {
    return { ...EMPTY_INTAKE };
  }
}

export function saveIntake(data: IntakeData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Best-effort persistence only — ignore quota/security errors.
  }
}

export function clearIntake(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore security errors in locked-down browsers.
  }
}
