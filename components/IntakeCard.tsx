'use client';

import { useEffect, useRef, useState } from 'react';
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

// Minimal typings for the Web Speech API — not part of TypeScript's DOM lib.
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResultItem {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResultItem;
}
interface SpeechRecognitionEventLike extends Event {
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognitionConstructor():
  | (new () => SpeechRecognitionInstance)
  | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
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
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseTextRef = useRef('');

  useEffect(() => {
    setSpeechSupported(Boolean(getSpeechRecognitionConstructor()));
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function handleToggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;
    baseTextRef.current = freeText.trim().length > 0 ? `${freeText.trim()} ` : '';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      onFreeTextChange(`${baseTextRef.current}${finalTranscript}${interimTranscript}`);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

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
      <div className="mt-4 flex items-center justify-between gap-2">
        <label className="block text-sm text-alerta-light/80" htmlFor="free-text">
          Se preferir, descreva com suas palavras:
        </label>
        {speechSupported && (
          <button
            type="button"
            onClick={handleToggleListening}
            aria-pressed={isListening}
            aria-label={isListening ? 'Parar de gravar' : 'Descrever por voz'}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg transition-colors ${
              isListening
                ? 'animate-pulse bg-alerta-red text-white'
                : 'bg-alerta-light/10 text-alerta-light hover:bg-alerta-light/20'
            }`}
          >
            🎤
          </button>
        )}
      </div>
      <textarea
        id="free-text"
        value={freeText}
        onChange={(event) => onFreeTextChange(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-lg bg-alerta-black p-3 text-sm text-alerta-light outline-none ring-1 ring-alerta-light/20 focus:ring-alerta-red"
        placeholder="Ex: encontrei uma foto minha alterada com IA num grupo de WhatsApp..."
      />
      {speechSupported && (
        <p className="mt-1 text-xs text-alerta-light/50">
          {isListening
            ? 'Ouvindo... fale com calma.'
            : 'O áudio é processado por um serviço do navegador para virar texto — não é salvo.'}
        </p>
      )}
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
