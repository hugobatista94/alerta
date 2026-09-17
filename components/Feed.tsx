'use client';

import { useEffect, useState } from 'react';
import { HeroCard } from './HeroCard';
import { IntakeCard } from './IntakeCard';
import { EvidenceCard } from './EvidenceCard';
import { DenunciaCard } from './DenunciaCard';
import { RightsCard } from './RightsCard';
import { PreventionCard } from './PreventionCard';
import { EducationCard } from './EducationCard';
import { ClosingCard } from './ClosingCard';
import { prioritizeCards } from '@/lib/feedPriority';
import { loadIntake, saveIntake } from '@/lib/storage';
import type { Category, CardId } from '@/lib/types';

export function Feed() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [freeText, setFreeText] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [reportDraft, setReportDraft] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadIntake();
    setCategories(stored.categories);
    setFreeText(stored.freeText);
    setEvidenceNotes(stored.evidenceNotes);
    setReportDraft(stored.reportDraft);
  }, []);

  useEffect(() => {
    saveIntake({ categories, freeText, evidenceNotes, reportDraft });
  }, [categories, freeText, evidenceNotes, reportDraft]);

  function toggleCategory(id: Category) {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleAnalyze() {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freeText }),
      });
      const result = await response.json();
      setCategories(
        (prev) => Array.from(new Set([...prev, ...result.categories])) as Category[]
      );
      setAiSummary(result.summary);
      setAnalyzeError(null);
    } catch {
      setAnalyzeError('Não foi possível analisar agora. Tente novamente em instantes.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  const cardOrder: CardId[] = prioritizeCards(categories);

  function renderDynamicCard(id: CardId) {
    switch (id) {
      case 'evidencias':
        return (
          <EvidenceCard
            key={id}
            categories={categories}
            freeText={freeText}
            evidenceNotes={evidenceNotes}
            reportDraft={reportDraft}
            onEvidenceNotesChange={setEvidenceNotes}
            onReportDraftChange={setReportDraft}
          />
        );
      case 'denuncia':
        return <DenunciaCard key={id} />;
      case 'direitos':
        return <RightsCard key={id} />;
      case 'prevencao':
        return <PreventionCard key={id} />;
      case 'apoio':
        return (
          <p key={id} className="text-sm text-alerta-light/60">
            (placeholder) apoio
          </p>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <HeroCard />
      <IntakeCard
        selectedCategories={categories}
        freeText={freeText}
        onToggleCategory={toggleCategory}
        onFreeTextChange={setFreeText}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        aiSummary={aiSummary}
        analyzeError={analyzeError}
      />
      {cardOrder.map(renderDynamicCard)}
      <EducationCard />
      <ClosingCard />
    </div>
  );
}
