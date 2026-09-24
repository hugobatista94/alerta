'use client';

import { useEffect, useState } from 'react';
import { HeroCard } from './HeroCard';
import { IntakeCard } from './IntakeCard';
import { EvidenceCard } from './EvidenceCard';
import { DenunciaCard } from './DenunciaCard';
import { SupportCard } from './SupportCard';
import { RightsCard } from './RightsCard';
import { PreventionCard } from './PreventionCard';
import { EducationCard } from './EducationCard';
import { ClosingCard } from './ClosingCard';
import { prioritizeCards } from '@/lib/feedPriority';
import { loadIntake, saveIntake, clearIntake } from '@/lib/storage';
import { clearEvidenceFiles } from '@/lib/evidenceFiles';
import type { Category, CardId } from '@/lib/types';

export function Feed() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [freeText, setFreeText] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [reportDraft, setReportDraft] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showClearedMessage, setShowClearedMessage] = useState(false);

  useEffect(() => {
    const stored = loadIntake();
    setCategories(stored.categories);
    setFreeText(stored.freeText);
    setEvidenceNotes(stored.evidenceNotes);
    setReportDraft(stored.reportDraft);
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    saveIntake({ categories, freeText, evidenceNotes, reportDraft });
  }, [hasLoaded, categories, freeText, evidenceNotes, reportDraft]);

  useEffect(() => {
    if (!showClearedMessage) return;
    const timer = setTimeout(() => setShowClearedMessage(false), 4000);
    return () => clearTimeout(timer);
  }, [showClearedMessage]);

  async function handleClearData() {
    const confirmed = window.confirm(
      'Tem certeza que deseja apagar todos os seus dados deste dispositivo?'
    );
    if (!confirmed) return;
    clearIntake();
    await clearEvidenceFiles();
    setCategories([]);
    setFreeText('');
    setEvidenceNotes('');
    setReportDraft('');
    setAiSummary(null);
    setAnalyzeError(null);
    setShowClearedMessage(true);
  }

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
      setAnalyzeError(null);
      setCategories(
        (prev) => Array.from(new Set([...prev, ...result.categories])) as Category[]
      );
      setAiSummary(result.summary);
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
      case 'apoio':
        return <SupportCard key={id} />;
      case 'direitos':
        return <RightsCard key={id} />;
      case 'prevencao':
        return <PreventionCard key={id} />;
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
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <button
          type="button"
          onClick={handleClearData}
          className="min-h-[44px] rounded-lg border border-alerta-light/40 bg-transparent px-4 py-2 text-xs font-medium text-alerta-light/70 hover:border-alerta-red hover:text-alerta-light"
        >
          Apagar meus dados
        </button>
        {showClearedMessage && (
          <p className="text-xs text-alerta-light/70">
            Seus dados foram apagados deste dispositivo.
          </p>
        )}
      </div>
      <ClosingCard />
    </div>
  );
}
