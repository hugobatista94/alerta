import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  it('filters out invalid category values from stored data', () => {
    window.localStorage.setItem(
      'alerta:intake',
      JSON.stringify({
        categories: ['nao-sei', 'categoria-invalida', 42, null],
        freeText: 'x',
        evidenceNotes: '',
        reportDraft: '',
      })
    );
    expect(loadIntake().categories).toEqual(['nao-sei']);
  });

  it('returns empty intake when localStorage.getItem throws', () => {
    const spy = vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadIntake()).toEqual(EMPTY);
    spy.mockRestore();
  });

  it('does not throw when localStorage.setItem throws', () => {
    const spy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveIntake({ ...EMPTY, freeText: 'x' })).not.toThrow();
    spy.mockRestore();
  });

  it('does not throw when localStorage.removeItem throws', () => {
    const spy = vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => clearIntake()).not.toThrow();
    spy.mockRestore();
  });
});
