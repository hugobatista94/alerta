import { describe, it, expect } from 'vitest';
import { prioritizeCards, BASE_CARD_ORDER } from './feedPriority';

describe('prioritizeCards', () => {
  it('returns the base order when no category is selected', () => {
    expect(prioritizeCards([])).toEqual(BASE_CARD_ORDER);
  });

  it('prioritizes evidencias for foto-sem-autorizacao', () => {
    expect(prioritizeCards(['foto-sem-autorizacao'])[0]).toBe('evidencias');
  });

  it('prioritizes evidencias for imagem-criada-ia', () => {
    expect(prioritizeCards(['imagem-criada-ia'])[0]).toBe('evidencias');
  });

  it('prioritizes evidencias for imagem-alterada', () => {
    expect(prioritizeCards(['imagem-alterada'])[0]).toBe('evidencias');
  });

  it('prioritizes denuncia for publicada-sem-consentimento', () => {
    expect(prioritizeCards(['publicada-sem-consentimento'])[0]).toBe(
      'denuncia'
    );
  });

  it('prioritizes apoio for ameaca-exposicao', () => {
    expect(prioritizeCards(['ameaca-exposicao'])[0]).toBe('apoio');
  });

  it('prioritizes direitos for nao-sei', () => {
    expect(prioritizeCards(['nao-sei'])[0]).toBe('direitos');
  });

  it('combines weights across multiple selected categories', () => {
    const result = prioritizeCards(['ameaca-exposicao', 'foto-sem-autorizacao']);
    expect(result.slice(0, 2).sort()).toEqual(['apoio', 'evidencias'].sort());
  });

  it('returns all five card ids exactly once', () => {
    const result = prioritizeCards(['imagem-criada-ia']);
    expect(result).toHaveLength(5);
    expect(new Set(result).size).toBe(5);
  });
});
