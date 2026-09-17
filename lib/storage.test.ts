import { describe, it, expect, beforeEach } from 'vitest';
import { loadIntake, saveIntake, clearIntake } from './storage';
import type { Category, IntakeData } from './types';

const EMPTY: IntakeData = {
  categories: [],
  freeText: '',
  evidenceNotes: '',
  reportDraft: '',
};

describe('intake storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns empty intake when nothing is stored', () => {
    expect(loadIntake()).toEqual(EMPTY);
  });

  it('round-trips saved data', () => {
    const data: IntakeData = {
      categories: ['ameaca-exposicao'] as Category[],
      freeText: 'relato de teste',
      evidenceNotes: 'prints salvos',
      reportDraft: '',
    };
    saveIntake(data);
    expect(loadIntake()).toEqual(data);
  });

  it('clears stored data', () => {
    saveIntake({ ...EMPTY, freeText: 'x' });
    clearIntake();
    expect(loadIntake()).toEqual(EMPTY);
  });

  it('falls back to empty intake on corrupted JSON', () => {
    window.localStorage.setItem('alerta:intake', '{not valid json');
    expect(loadIntake()).toEqual(EMPTY);
  });
});
