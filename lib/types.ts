export type Category =
  | 'foto-sem-autorizacao'
  | 'imagem-criada-ia'
  | 'imagem-alterada'
  | 'publicada-sem-consentimento'
  | 'ameaca-exposicao'
  | 'nao-sei';

export type CardId = 'evidencias' | 'denuncia' | 'apoio' | 'direitos' | 'prevencao';

export interface IntakeData {
  categories: Category[];
  freeText: string;
  evidenceNotes: string;
  reportDraft: string;
}
