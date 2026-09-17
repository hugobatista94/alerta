'use client';

import { useEffect, useState } from 'react';
import { HeroCard } from './HeroCard';
import { IntakeCard } from './IntakeCard';
import { prioritizeCards } from '@/lib/feedPriority';
import { loadIntake, saveIntake } from '@/lib/storage';
import type { Category, CardId } from '@/lib/types';

export function Feed() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [freeText, setFreeText] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [reportDraft, setReportDraft] = useState('');

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

  const cardOrder: CardId[] = prioritizeCards(categories);

  return (
    <div className="flex flex-col gap-4">
      <HeroCard />
      <IntakeCard
        selectedCategories={categories}
        freeText={freeText}
        onToggleCategory={toggleCategory}
        onFreeTextChange={setFreeText}
      />
      <ol className="flex flex-col gap-2 text-sm text-alerta-light/60">
        {cardOrder.map((id, index) => (
          <li key={id}>
            {index + 1}. {id}
          </li>
        ))}
      </ol>
    </div>
  );
}
