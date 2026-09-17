import type { Category, CardId } from './types';

export const BASE_CARD_ORDER: CardId[] = [
  'evidencias',
  'denuncia',
  'apoio',
  'direitos',
  'prevencao',
];

const CATEGORY_WEIGHTS: Record<Category, Record<CardId, number>> = {
  'foto-sem-autorizacao': {
    evidencias: 5,
    denuncia: 3,
    apoio: 1,
    direitos: 1,
    prevencao: 0,
  },
  'imagem-criada-ia': {
    evidencias: 5,
    denuncia: 2,
    apoio: 1,
    direitos: 3,
    prevencao: 0,
  },
  'imagem-alterada': {
    evidencias: 5,
    denuncia: 2,
    apoio: 1,
    direitos: 2,
    prevencao: 0,
  },
  'publicada-sem-consentimento': {
    evidencias: 3,
    denuncia: 5,
    apoio: 2,
    direitos: 1,
    prevencao: 0,
  },
  'ameaca-exposicao': {
    evidencias: 1,
    denuncia: 2,
    apoio: 5,
    direitos: 1,
    prevencao: 0,
  },
  'nao-sei': {
    evidencias: 2,
    denuncia: 2,
    apoio: 1,
    direitos: 4,
    prevencao: 1,
  },
};

export function prioritizeCards(selected: Category[]): CardId[] {
  const scores = new Map<CardId, number>(BASE_CARD_ORDER.map((id) => [id, 0]));

  for (const category of selected) {
    const weights = CATEGORY_WEIGHTS[category];
    for (const cardId of BASE_CARD_ORDER) {
      scores.set(cardId, (scores.get(cardId) ?? 0) + weights[cardId]);
    }
  }

  return [...BASE_CARD_ORDER].sort((a, b) => {
    const diff = (scores.get(b) ?? 0) - (scores.get(a) ?? 0);
    if (diff !== 0) return diff;
    return BASE_CARD_ORDER.indexOf(a) - BASE_CARD_ORDER.indexOf(b);
  });
}
