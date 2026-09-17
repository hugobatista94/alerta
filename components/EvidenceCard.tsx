'use client';

import { useState } from 'react';
import type { Category } from '@/lib/types';

interface EvidenceCardProps {
  categories: Category[];
  freeText: string;
  evidenceNotes: string;
  reportDraft: string;
  onEvidenceNotesChange: (value: string) => void;
  onReportDraftChange: (value: string) => void;
}

export function EvidenceCard({
  categories,
  freeText,
  evidenceNotes,
  reportDraft,
  onEvidenceNotesChange,
  onReportDraftChange,
}: EvidenceCardProps) {
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  async function handleDraft() {
    setIsDrafting(true);
    try {
      const response = await fetch('/api/draft-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories, freeText, evidenceNotes }),
      });
      const result = await response.json();
      onReportDraftChange(result.draft);
      setDraftError(null);
    } catch {
      setDraftError('Não foi possível gerar o rascunho agora. Tente novamente em instantes.');
    } finally {
      setIsDrafting(false);
    }
  }

  return (
    <section className="rounded-2xl bg-alerta-charcoal p-6 text-alerta-light shadow-lg">
      <h2 className="text-lg font-bold">Reúna suas evidências</h2>
      <p className="mt-1 text-sm text-alerta-light/80">
        Anote capturas de tela, links, nomes e datas relevantes.
      </p>
      <textarea
        value={evidenceNotes}
        onChange={(event) => onEvidenceNotesChange(event.target.value)}
        rows={3}
        className="mt-3 w-full rounded-lg bg-alerta-black p-3 text-sm outline-none ring-1 ring-alerta-light/20 focus:ring-alerta-red"
        placeholder="Ex: print de 12/09 do perfil @exemplo, link: ..."
      />
      <button
        type="button"
        onClick={handleDraft}
        disabled={isDrafting}
        className="mt-3 rounded-lg bg-alerta-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isDrafting ? 'Redigindo...' : 'Ajude-me a redigir minha denúncia'}
      </button>
      {draftError && (
        <p className="mt-3 text-sm text-red-400">
          {draftError}
        </p>
      )}
      {reportDraft && (
        <textarea
          value={reportDraft}
          onChange={(event) => onReportDraftChange(event.target.value)}
          rows={6}
          className="mt-3 w-full rounded-lg bg-white p-3 text-sm text-alerta-black outline-none"
        />
      )}
    </section>
  );
}
