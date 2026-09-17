'use client';

import { Chip } from './Chip';
import type { Category } from '@/lib/types';

const CATEGORY_OPTIONS: { id: Category; label: string }[] = [
  { id: 'foto-sem-autorizacao', label: 'Usaram minha foto sem autorização' },
  { id: 'imagem-criada-ia', label: 'Criaram uma imagem minha com IA' },
  { id: 'imagem-alterada', label: 'Alteraram uma imagem minha' },
  {
    id: 'publicada-sem-consentimento',
    label: 'Publicaram minha imagem sem consentimento',
  },
  { id: 'ameaca-exposicao', label: 'Estão me ameaçando ou tentando me expor' },
  { id: 'nao-sei', label: 'Não sei exatamente o que aconteceu' },
];

interface IntakeCardProps {
  selectedCategories: Category[];
  freeText: string;
  onToggleCategory: (id: Category) => void;
  onFreeTextChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  aiSummary: string | null;
  analyzeError?: string | null;
}

export function IntakeCard({
  selectedCategories,
  freeText,
  onToggleCategory,
  onFreeTextChange,
  onAnalyze,
  isAnalyzing,
  aiSummary,
  analyzeError,
}: IntakeCardProps) {
  return (
    <section className="rounded-2xl bg-alerta-charcoal p-6 text-alerta-light shadow-lg">
      <h2 className="text-lg font-bold">O que aconteceu com você?</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={selectedCategories.includes(option.id)}
            onClick={() => onToggleCategory(option.id)}
          />
        ))}
      </div>
      <label className="mt-4 block text-sm text-alerta-light/80" htmlFor="free-text">
        Se preferir, descreva com suas palavras:
      </label>
      <textarea
        id="free-text"
        value={freeText}
        onChange={(event) => onFreeTextChange(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-lg bg-alerta-black p-3 text-sm text-alerta-light outline-none ring-1 ring-alerta-light/20 focus:ring-alerta-red"
        placeholder="Ex: encontrei uma foto minha alterada com IA num grupo de WhatsApp..."
      />
      <button
        type="button"
        onClick={onAnalyze}
        disabled={isAnalyzing || freeText.trim().length === 0}
        className="mt-3 rounded-lg bg-alerta-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isAnalyzing ? 'Analisando...' : 'Analisar com IA'}
      </button>
      {aiSummary && (
        <p className="mt-3 rounded-lg bg-alerta-black/60 p-3 text-sm text-alerta-light/90">
          {aiSummary}
        </p>
      )}
      {analyzeError && (
        <p className="mt-3 text-sm text-red-400">
          {analyzeError}
        </p>
      )}
    </section>
  );
}
