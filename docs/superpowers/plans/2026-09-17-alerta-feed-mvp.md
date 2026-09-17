# ALERTA — Feed Adaptativo (MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the ALERTA web application — a single-page adaptive feed
(Next.js) that guides victims of AI-driven image abuse through evidence
collection, reporting, and nearby/national support, reordering itself based
on what the person says happened.

**Architecture:** One Next.js (App Router) project, TypeScript + Tailwind
CSS. A pure priority function reorders a fixed set of guidance cards based on
selected categories. Two internal API routes proxy to the Claude API (with a
deterministic mock fallback when no key is configured) for free-text
classification and assisted report drafting. All user data lives in
`localStorage` only. A geolocation + OpenStreetMap/Overpass + Leaflet stack
(entirely client-side, no paid keys) finds nearby support points.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS
3, Vitest (unit tests, jsdom), `@anthropic-ai/sdk`, Leaflet + react-leaflet,
OpenStreetMap Overpass API.

**Spec:** `docs/superpowers/specs/2026-09-17-alerta-feed-design.md`

## Global Constraints

- Aplicação **web** (não app nativo), responsiva, mobile-first.
- Next.js (App Router) + TypeScript + Tailwind CSS, um único projeto
  full-stack, sem serviços externos obrigatórios para rodar localmente.
- **Sem banco de dados e sem autenticação/contas.** Dados sensíveis
  (relato, evidências, rascunho de denúncia) ficam apenas em `localStorage`.
- IA (Claude API) usada em pontos pontuais (classificação de texto livre,
  redação assistida de denúncia) — nunca decide sozinha se algo "é crime".
  Se `ANTHROPIC_API_KEY` não estiver definida em `.env.local`, as rotas
  operam em modo mock determinístico.
- Localização é usada apenas em tempo real (nunca salva em `localStorage`
  nem em servidor); busca de apoio próximo via OpenStreetMap/Overpass API
  (gratuita, sem chave), mapa renderizado com Leaflet + tiles OSM.
- Identidade visual: fundo escuro (`#121212`/`#1E1E1E`), vermelho de alerta
  (`#E31E24`), branco/cinza claro (`#F4F4F4`) para texto e áreas educativas,
  tipografia bold nos títulos.
- Todo o conteúdo voltado à pessoa usuária é em português (Brasil).

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `vitest.config.ts`
- Create: `.env.local.example`
- Create: `.gitignore`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx`

**Interfaces:**
- Produces: a working Next.js dev/build setup, the `@/*` path alias, and a
  Vitest runner (`npm run test`) that later tasks' `lib/**/*.test.ts` files
  will run under. Tailwind color tokens `alerta.red` (`#E31E24`),
  `alerta.black` (`#121212`), `alerta.charcoal` (`#1E1E1E`), `alerta.light`
  (`#F4F4F4`) are available to every component built in later tasks.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "alerta",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "leaflet": "^1.9.4",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.0",
    "jsdom": "^24.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 4: Create `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
```

- [ ] **Step 5: Create `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        alerta: {
          red: '#E31E24',
          black: '#121212',
          charcoal: '#1E1E1E',
          light: '#F4F4F4',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Create `postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['lib/**/*.test.ts'],
  },
});
```

- [ ] **Step 8: Create `.env.local.example`**

```
ANTHROPIC_API_KEY=
```

- [ ] **Step 9: Create `.gitignore`**

```
node_modules
.next
.env.local
```

- [ ] **Step 10: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #121212;
  color: #f4f4f4;
}
```

- [ ] **Step 11: Create `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ALERTA — Sua imagem também é um direito',
  description:
    'Orientação e apoio para uso indevido de imagem gerada ou manipulada por IA.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 12: Create `app/page.tsx`**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-alerta-light">ALERTA em construção</p>
    </main>
  );
}
```

- [ ] **Step 13: Install dependencies**

Run: `npm install`
Expected: completes without errors, creates `node_modules/` and
`package-lock.json`.

- [ ] **Step 14: Verify the project builds**

Run: `npm run build`
Expected: `Compiled successfully` with a static `/` route listed in the
output.

- [ ] **Step 15: Commit**

```bash
git add package.json package-lock.json tsconfig.json next-env.d.ts next.config.js tailwind.config.ts postcss.config.js vitest.config.ts .env.local.example .gitignore app/layout.tsx app/globals.css app/page.tsx
git commit -m "chore: scaffold Next.js + TypeScript + Tailwind + Vitest project"
```

---

### Task 2: Feed priority engine

**Files:**
- Create: `lib/types.ts`
- Create: `lib/feedPriority.ts`
- Test: `lib/feedPriority.test.ts`

**Interfaces:**
- Consumes: nothing (pure module).
- Produces: `Category` type (union of 6 string literals), `CardId` type
  (union of 5 string literals: `'evidencias' | 'denuncia' | 'apoio' |
  'direitos' | 'prevencao'`), `IntakeData` interface (`{ categories:
  Category[]; freeText: string; evidenceNotes: string; reportDraft: string
  }`), `BASE_CARD_ORDER: CardId[]`, and `prioritizeCards(selected:
  Category[]): CardId[]` — used by `lib/storage.ts` (Task 3), `Feed.tsx`
  (Task 5+), `lib/claude.ts` (Task 8), and every card component that takes
  `categories`/`freeText` as props.

- [ ] **Step 1: Write the failing test**

Create `lib/feedPriority.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- feedPriority`
Expected: FAIL — `Cannot find module './feedPriority'` (module does not
exist yet).

- [ ] **Step 3: Create `lib/types.ts`**

```ts
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
```

- [ ] **Step 4: Create `lib/feedPriority.ts`**

```ts
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- feedPriority`
Expected: PASS — all 9 tests green.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/feedPriority.ts lib/feedPriority.test.ts
git commit -m "feat: add adaptive feed priority engine"
```

---

### Task 3: Local persistence

**Files:**
- Create: `lib/storage.ts`
- Test: `lib/storage.test.ts`

**Interfaces:**
- Consumes: `IntakeData` from `lib/types.ts` (Task 2).
- Produces: `loadIntake(): IntakeData`, `saveIntake(data: IntakeData): void`,
  `clearIntake(): void` — used by `Feed.tsx` (Task 5+).

- [ ] **Step 1: Write the failing test**

Create `lib/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
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
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- storage`
Expected: FAIL — `Cannot find module './storage'`.

- [ ] **Step 3: Create `lib/storage.ts`**

```ts
import type { IntakeData } from './types';

const STORAGE_KEY = 'alerta:intake';

const EMPTY_INTAKE: IntakeData = {
  categories: [],
  freeText: '',
  evidenceNotes: '',
  reportDraft: '',
};

export function loadIntake(): IntakeData {
  if (typeof window === 'undefined') return { ...EMPTY_INTAKE };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...EMPTY_INTAKE };
  try {
    return { ...EMPTY_INTAKE, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_INTAKE };
  }
}

export function saveIntake(data: IntakeData): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearIntake(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- storage`
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/storage.ts lib/storage.test.ts
git commit -m "feat: persist intake data to localStorage"
```

---

### Task 4: Hero and Chip components

**Files:**
- Create: `components/Chip.tsx`
- Create: `components/HeroCard.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `Chip` component (props: `label: string; selected: boolean;
  onClick: () => void`) — used by `IntakeCard.tsx` (Task 5). `HeroCard`
  component (no props) — used by `Feed.tsx` (Task 5+).

- [ ] **Step 1: Create `components/Chip.tsx`**

```tsx
'use client';

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        selected
          ? 'border-alerta-red bg-alerta-red text-white'
          : 'border-alerta-light/40 bg-transparent text-alerta-light hover:border-alerta-red'
      }`}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 2: Create `components/HeroCard.tsx`**

```tsx
export function HeroCard() {
  return (
    <section className="rounded-2xl bg-alerta-black p-6 text-alerta-light shadow-lg">
      <div className="mb-3 flex items-center gap-2 text-alerta-red">
        <span aria-hidden className="text-2xl">
          ⚠️
        </span>
        <span className="text-3xl font-extrabold tracking-tight">ALERTA</span>
      </div>
      <h1 className="text-xl font-bold leading-snug">
        Sua imagem também é <span className="text-alerta-red">um direito</span>!
      </h1>
      <p className="mt-2 text-sm text-alerta-light/80">
        Nem tudo que parece real é real. O uso não autorizado de imagens
        geradas ou manipuladas por inteligência artificial é crime e fere o
        seu direito à imagem.
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Update `app/page.tsx`**

```tsx
import { HeroCard } from '@/components/HeroCard';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 px-4 py-6">
      <HeroCard />
    </main>
  );
}
```

- [ ] **Step 4: Verify the project builds**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add components/Chip.tsx components/HeroCard.tsx app/page.tsx
git commit -m "feat: add hero card and reusable chip component"
```

---

### Task 5: Intake card and feed orchestrator

**Files:**
- Create: `components/IntakeCard.tsx`
- Create: `components/Feed.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Chip` (Task 4), `HeroCard` (Task 4), `prioritizeCards` (Task
  2), `loadIntake`/`saveIntake` (Task 3), `Category`/`CardId` (Task 2).
- Produces: `IntakeCard` component (props: `selectedCategories: Category[];
  freeText: string; onToggleCategory: (id: Category) => void;
  onFreeTextChange: (value: string) => void`) — extended with AI props in
  Task 9. `Feed` component (no props) — the page's single entry point,
  rendered by `app/page.tsx`.

- [ ] **Step 1: Create `components/IntakeCard.tsx`**

```tsx
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
}

export function IntakeCard({
  selectedCategories,
  freeText,
  onToggleCategory,
  onFreeTextChange,
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
    </section>
  );
}
```

- [ ] **Step 2: Create `components/Feed.tsx`**

```tsx
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
```

- [ ] **Step 3: Update `app/page.tsx`**

```tsx
import { Feed } from '@/components/Feed';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 px-4 py-6">
      <Feed />
    </main>
  );
}
```

- [ ] **Step 4: Verify the project builds**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add components/IntakeCard.tsx components/Feed.tsx app/page.tsx
git commit -m "feat: wire intake card into adaptive feed orchestrator"
```

---

### Task 6: Fixed educational cards

**Files:**
- Create: `lib/content.ts`
- Create: `components/EducationCard.tsx`
- Create: `components/ClosingCard.tsx`
- Modify: `components/Feed.tsx`

**Interfaces:**
- Produces: `AI_MISUSE_EXAMPLES: string[]` from `lib/content.ts` (extended
  in Task 7). `EducationCard` and `ClosingCard` components (no props) —
  rendered as fixed cards at the bottom of `Feed.tsx`.

- [ ] **Step 1: Create `lib/content.ts`**

```ts
export const AI_MISUSE_EXAMPLES = [
  'Montagens de conteúdo íntimo',
  'Pornografia não consentida',
  'Golpes e extorsões',
  'Difamação e exposição',
];
```

- [ ] **Step 2: Create `components/EducationCard.tsx`**

```tsx
import { AI_MISUSE_EXAMPLES } from '@/lib/content';

export function EducationCard() {
  return (
    <section className="rounded-2xl bg-alerta-light p-6 text-alerta-black shadow-lg">
      <h2 className="text-lg font-bold">O que é?</h2>
      <p className="mt-2 text-sm">
        A inteligência artificial (IA) permite criar, editar e manipular
        imagens de forma realista, inclusive com o seu rosto, corpo ou voz,
        mesmo sem que você tenha feito ou autorizado. Essas imagens podem ser
        usadas para fins ofensivos, como:
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
        {AI_MISUSE_EXAMPLES.map((example) => (
          <li key={example}>{example}</li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: Create `components/ClosingCard.tsx`**

```tsx
export function ClosingCard() {
  return (
    <section className="rounded-2xl bg-alerta-black p-6 text-center text-alerta-light shadow-lg">
      <p className="text-lg font-semibold italic">
        Sua imagem é sua história. <span className="text-alerta-red">Respeite.</span>
      </p>
      <p className="mt-2 text-xs text-alerta-light/70">
        Não é só sobre imagem. É sobre sua liberdade, seu corpo e sua
        segurança.
      </p>
    </section>
  );
}
```

- [ ] **Step 4: Update `components/Feed.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { HeroCard } from './HeroCard';
import { IntakeCard } from './IntakeCard';
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
      <EducationCard />
      <ClosingCard />
    </div>
  );
}
```

- [ ] **Step 5: Verify the project builds**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 6: Commit**

```bash
git add lib/content.ts components/EducationCard.tsx components/ClosingCard.tsx components/Feed.tsx
git commit -m "feat: add fixed education and closing cards"
```

---

### Task 7: Rights, prevention, and denúncia cards

**Files:**
- Modify: `lib/content.ts`
- Create: `components/RightsCard.tsx`
- Create: `components/PreventionCard.tsx`
- Create: `components/DenunciaCard.tsx`
- Modify: `components/Feed.tsx`

**Interfaces:**
- Consumes: `CardId` (Task 2).
- Produces: `PREVENTION_TIPS: { title: string; description: string }[]`
  added to `lib/content.ts`. `RightsCard`, `PreventionCard`, `DenunciaCard`
  components (no props) — mapped to `'direitos'`, `'prevencao'`,
  `'denuncia'` respectively inside `Feed.tsx`'s dynamic card renderer.

- [ ] **Step 1: Add `PREVENTION_TIPS` to `lib/content.ts`**

```ts
export const AI_MISUSE_EXAMPLES = [
  'Montagens de conteúdo íntimo',
  'Pornografia não consentida',
  'Golpes e extorsões',
  'Difamação e exposição',
];

export const PREVENTION_TIPS = [
  {
    title: 'Proteja seus dados',
    description:
      'Evite compartilhar fotos íntimas ou pessoais em redes sociais, chats ou aplicativos.',
  },
  {
    title: 'Ajuste sua privacidade',
    description:
      'Deixe suas redes sociais com configurações de privacidade mais restritas.',
  },
  {
    title: 'Desconfie de imagens',
    description: 'Se algo parece estranho, pare, analise e verifique a origem.',
  },
  {
    title: 'Informe-se',
    description:
      'Conheça seus direitos e os limites do uso da inteligência artificial.',
  },
  {
    title: 'Converse',
    description: 'Compartilhe esse tema. A prevenção também é coletiva.',
  },
];
```

- [ ] **Step 2: Create `components/RightsCard.tsx`**

```tsx
export function RightsCard() {
  return (
    <section className="rounded-2xl bg-alerta-red p-6 text-white shadow-lg">
      <h2 className="text-lg font-bold">Direito à imagem é direito humano</h2>
      <p className="mt-2 text-sm">
        O que é seu, só você pode autorizar. Se você encontrar suas imagens em
        sites, redes sociais ou qualquer outro ambiente sem o seu
        consentimento, pode ser vítima de um crime. Isso não é brincadeira,
        não é &quot;só uma foto&quot; — é uma violação da sua privacidade, da
        sua dignidade e do seu direito à imagem.
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Create `components/PreventionCard.tsx`**

```tsx
import { PREVENTION_TIPS } from '@/lib/content';

export function PreventionCard() {
  return (
    <section className="rounded-2xl bg-alerta-light p-6 text-alerta-black shadow-lg">
      <h2 className="text-lg font-bold">Prevenção</h2>
      <p className="mt-1 text-sm">
        A melhor forma de se proteger é a informação e o cuidado diário!
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PREVENTION_TIPS.map((tip) => (
          <div key={tip.title} className="rounded-xl bg-white p-3">
            <h3 className="text-sm font-semibold">{tip.title}</h3>
            <p className="mt-1 text-xs text-alerta-black/70">{tip.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `components/DenunciaCard.tsx`**

```tsx
export function DenunciaCard() {
  return (
    <section className="rounded-2xl bg-alerta-charcoal p-6 text-alerta-light shadow-lg">
      <h2 className="text-lg font-bold">Caso aconteça, o que fazer?</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
        <li>
          Denuncie: procure a delegacia mais próxima ou registre um boletim
          de ocorrência online.
        </li>
        <li>
          Avise o suporte das plataformas: peça a remoção do conteúdo e o
          bloqueio dos perfis que estiverem divulgando.
        </li>
        <li>
          Busque orientação jurídica: você pode ter direito a indenização e
          outras medidas legais de proteção.
        </li>
      </ol>
    </section>
  );
}
```

- [ ] **Step 5: Update `components/Feed.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { HeroCard } from './HeroCard';
import { IntakeCard } from './IntakeCard';
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

  function renderDynamicCard(id: CardId) {
    switch (id) {
      case 'denuncia':
        return <DenunciaCard key={id} />;
      case 'direitos':
        return <RightsCard key={id} />;
      case 'prevencao':
        return <PreventionCard key={id} />;
      case 'evidencias':
        return (
          <p key={id} className="text-sm text-alerta-light/60">
            (placeholder) evidencias
          </p>
        );
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
      />
      {cardOrder.map(renderDynamicCard)}
      <EducationCard />
      <ClosingCard />
    </div>
  );
}
```

- [ ] **Step 6: Verify the project builds**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 7: Commit**

```bash
git add lib/content.ts components/RightsCard.tsx components/PreventionCard.tsx components/DenunciaCard.tsx components/Feed.tsx
git commit -m "feat: add rights, prevention, and denuncia cards"
```

---

### Task 8: Claude API integration with mock fallback

**Files:**
- Create: `lib/claude.ts`
- Test: `lib/claude.test.ts`
- Create: `app/api/analyze/route.ts`
- Create: `app/api/draft-report/route.ts`

**Interfaces:**
- Consumes: `Category` from `lib/types.ts` (Task 2).
- Produces: `AnalyzeResult { categories: Category[]; summary: string }`,
  `DraftReportInput { categories: Category[]; freeText: string;
  evidenceNotes: string }`, `analyzeReport(freeText: string):
  Promise<AnalyzeResult>`, `draftReport(input: DraftReportInput):
  Promise<string>` — called by `POST /api/analyze` and `POST
  /api/draft-report`, which are consumed by `IntakeCard`/`Feed` (Task 9)
  and `EvidenceCard` (Task 9) via `fetch`.

- [ ] **Step 1: Write the failing test**

Create `lib/claude.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analyzeReport, draftReport } from './claude';

describe('claude (mock fallback, no API key configured)', () => {
  beforeEach(() => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('classifies AI-related free text without calling the real API', async () => {
    const result = await analyzeReport(
      'Criaram uma imagem minha usando inteligência artificial'
    );
    expect(result.categories).toContain('imagem-criada-ia');
    expect(result.summary).toContain('Relato registrado');
  });

  it('falls back to "nao-sei" when the text gives no clear signal', async () => {
    const result = await analyzeReport('aconteceu algo estranho');
    expect(result.categories).toEqual(['nao-sei']);
  });

  it('drafts a formal report using the provided evidence notes', async () => {
    const draft = await draftReport({
      categories: ['ameaca-exposicao'],
      freeText: 'estão ameaçando divulgar minhas fotos',
      evidenceNotes: 'prints de conversa e link do perfil',
    });
    expect(draft).toContain('estão ameaçando divulgar minhas fotos');
    expect(draft).toContain('prints de conversa e link do perfil');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- claude`
Expected: FAIL — `Cannot find module './claude'`.

- [ ] **Step 3: Create `lib/claude.ts`**

```ts
import Anthropic from '@anthropic-ai/sdk';
import type { Category } from './types';

export interface AnalyzeResult {
  categories: Category[];
  summary: string;
}

export interface DraftReportInput {
  categories: Category[];
  freeText: string;
  evidenceNotes: string;
}

const VALID_CATEGORIES: Category[] = [
  'foto-sem-autorizacao',
  'imagem-criada-ia',
  'imagem-alterada',
  'publicada-sem-consentimento',
  'ameaca-exposicao',
  'nao-sei',
];

function mockAnalyze(freeText: string): AnalyzeResult {
  const text = freeText.toLowerCase();
  const categories: Category[] = [];
  if (text.includes('ia') || text.includes('intelig')) {
    categories.push('imagem-criada-ia');
  }
  if (text.includes('amea') || text.includes('expor') || text.includes('exposi')) {
    categories.push('ameaca-exposicao');
  }
  if (text.includes('public')) {
    categories.push('publicada-sem-consentimento');
  }
  if (categories.length === 0) categories.push('nao-sei');

  return {
    categories,
    summary:
      freeText.trim().length > 0
        ? `Relato registrado: "${freeText.trim().slice(0, 160)}"`
        : 'Nenhuma descrição adicional foi fornecida.',
  };
}

function mockDraftReport(input: DraftReportInput): string {
  const situacao = input.freeText.trim() || 'uso indevido da minha imagem';
  const evidencias =
    input.evidenceNotes.trim() || 'não há evidências detalhadas registradas ainda';

  return [
    'À autoridade competente,',
    '',
    `Venho por meio deste relatar ${situacao}.`,
    `Evidências reunidas até o momento: ${evidencias}.`,
    'Solicito a devida apuração dos fatos e as medidas cabíveis para a remoção do conteúdo e responsabilização dos envolvidos.',
    '',
    'Atenciosamente,',
  ].join('\n');
}

function parseAnalyzeResponse(raw: string, fallback: AnalyzeResult): AnalyzeResult {
  try {
    const parsed = JSON.parse(raw);
    const categories = Array.isArray(parsed.categories)
      ? parsed.categories.filter((item: unknown): item is Category =>
          VALID_CATEGORIES.includes(item as Category)
        )
      : [];
    return {
      categories: categories.length > 0 ? categories : fallback.categories,
      summary: typeof parsed.summary === 'string' ? parsed.summary : fallback.summary,
    };
  } catch {
    return fallback;
  }
}

export async function analyzeReport(freeText: string): Promise<AnalyzeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const fallback = mockAnalyze(freeText);
  if (!apiKey) return fallback;

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Classifique o relato abaixo em uma ou mais destas categorias: ${VALID_CATEGORIES.join(
          ', '
        )}. Responda APENAS com um JSON no formato {"categories": string[], "summary": string}, sem texto adicional.\n\nRelato: """${freeText}"""`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') return fallback;
  return parseAnalyzeResponse(textBlock.text, fallback);
}

export async function draftReport(input: DraftReportInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const fallback = mockDraftReport(input);
  if (!apiKey) return fallback;

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Redija um texto formal de denúncia em português, em primeira pessoa, para uma vítima de uso indevido de imagem. Categorias: ${input.categories.join(
          ', '
        )}. Relato: """${input.freeText}""". Evidências: """${input.evidenceNotes}""". Responda apenas com o texto da denúncia.`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  return textBlock && textBlock.type === 'text' ? textBlock.text : fallback;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- claude`
Expected: PASS — all 3 tests green.

- [ ] **Step 5: Create `app/api/analyze/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { analyzeReport } from '@/lib/claude';

export async function POST(request: Request) {
  const body = await request.json();
  const freeText = typeof body.freeText === 'string' ? body.freeText : '';
  const result = await analyzeReport(freeText);
  return NextResponse.json(result);
}
```

- [ ] **Step 6: Create `app/api/draft-report/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { draftReport } from '@/lib/claude';
import type { Category } from '@/lib/types';

export async function POST(request: Request) {
  const body = await request.json();
  const categories: Category[] = Array.isArray(body.categories) ? body.categories : [];
  const freeText = typeof body.freeText === 'string' ? body.freeText : '';
  const evidenceNotes = typeof body.evidenceNotes === 'string' ? body.evidenceNotes : '';
  const draft = await draftReport({ categories, freeText, evidenceNotes });
  return NextResponse.json({ draft });
}
```

- [ ] **Step 7: Verify the project builds**

Run: `npm run build`
Expected: `Compiled successfully`, with `/api/analyze` and `/api/draft-report`
listed as dynamic routes.

- [ ] **Step 8: Commit**

```bash
git add lib/claude.ts lib/claude.test.ts app/api/analyze/route.ts app/api/draft-report/route.ts
git commit -m "feat: add Claude API integration with deterministic mock fallback"
```

---

### Task 9: Evidence card and AI-assisted intake

**Files:**
- Create: `components/EvidenceCard.tsx`
- Modify: `components/IntakeCard.tsx`
- Modify: `components/Feed.tsx`

**Interfaces:**
- Consumes: `POST /api/analyze`, `POST /api/draft-report` (Task 8),
  `Category` (Task 2).
- Produces: `EvidenceCard` component (props: `categories: Category[];
  freeText: string; evidenceNotes: string; reportDraft: string;
  onEvidenceNotesChange: (value: string) => void; onReportDraftChange:
  (value: string) => void`) — mapped to `'evidencias'` in `Feed.tsx`.
  `IntakeCard` gains `onAnalyze: () => void; isAnalyzing: boolean;
  aiSummary: string | null` props.

- [ ] **Step 1: Create `components/EvidenceCard.tsx`**

```tsx
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
```

- [ ] **Step 2: Update `components/IntakeCard.tsx`**

```tsx
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
}

export function IntakeCard({
  selectedCategories,
  freeText,
  onToggleCategory,
  onFreeTextChange,
  onAnalyze,
  isAnalyzing,
  aiSummary,
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
    </section>
  );
}
```

- [ ] **Step 3: Update `components/Feed.tsx`**

```tsx
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
      />
      {cardOrder.map(renderDynamicCard)}
      <EducationCard />
      <ClosingCard />
    </div>
  );
}
```

- [ ] **Step 4: Verify the project builds**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add components/EvidenceCard.tsx components/IntakeCard.tsx components/Feed.tsx
git commit -m "feat: add evidence card and AI-assisted report drafting"
```

---

### Task 10: Overpass support-point lookup

**Files:**
- Create: `lib/overpass.ts`
- Test: `lib/overpass.test.ts`

**Interfaces:**
- Produces: `LatLon { lat: number; lon: number }`, `SupportPoint extends
  LatLon { id: string; name: string; distanceKm: number }`,
  `haversineDistanceKm(a: LatLon, b: LatLon): number`,
  `findNearbySupportPoints(origin: LatLon, radiusMeters?: number):
  Promise<SupportPoint[]>` — used by `SupportCard.tsx` and `SupportMap.tsx`
  (Task 11).

- [ ] **Step 1: Write the failing test**

Create `lib/overpass.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { haversineDistanceKm, findNearbySupportPoints } from './overpass';

describe('haversineDistanceKm', () => {
  it('returns ~0 for the same point', () => {
    const point = { lat: -23.5505, lon: -46.6333 };
    expect(haversineDistanceKm(point, point)).toBeCloseTo(0, 5);
  });

  it('returns approximately the known distance between São Paulo and Rio de Janeiro', () => {
    const saoPaulo = { lat: -23.5505, lon: -46.6333 };
    const rioDeJaneiro = { lat: -22.9068, lon: -43.1729 };
    const distance = haversineDistanceKm(saoPaulo, rioDeJaneiro);
    expect(distance).toBeGreaterThan(350);
    expect(distance).toBeLessThan(370);
  });
});

describe('findNearbySupportPoints', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses, calculates distance, and sorts Overpass results', async () => {
    const origin = { lat: -23.5505, lon: -46.6333 };
    const mockResponse = {
      elements: [
        { id: 1, lat: -23.6, lon: -46.7, tags: { name: 'Delegacia Distante' } },
        { id: 2, lat: -23.551, lon: -46.634, tags: { name: 'Delegacia Perto' } },
        { id: 3, center: { lat: -23.5515, lon: -46.6335 }, tags: {} },
      ],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
    );

    const points = await findNearbySupportPoints(origin);

    expect(points).toHaveLength(3);
    expect(points[0].name).toBe('Delegacia Perto');
    expect(points[points.length - 1].name).toBe('Delegacia Distante');
    expect(points.some((point) => point.name === 'Delegacia de Polícia')).toBe(true);
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i].distanceKm).toBeGreaterThanOrEqual(points[i - 1].distanceKm);
    }
  });

  it('throws when the Overpass API responds with an error status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(findNearbySupportPoints({ lat: 0, lon: 0 })).rejects.toThrow(
      'Overpass API respondeu com status 500'
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- overpass`
Expected: FAIL — `Cannot find module './overpass'`.

- [ ] **Step 3: Create `lib/overpass.ts`**

```ts
export interface LatLon {
  lat: number;
  lon: number;
}

export interface SupportPoint extends LatLon {
  id: string;
  name: string;
  distanceKm: number;
}

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(a: LatLon, b: LatLon): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: { name?: string };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

export async function findNearbySupportPoints(
  origin: LatLon,
  radiusMeters = 5000
): Promise<SupportPoint[]> {
  const query = `[out:json][timeout:15];(node["amenity"="police"](around:${radiusMeters},${origin.lat},${origin.lon});way["amenity"="police"](around:${radiusMeters},${origin.lat},${origin.lon}););out center;`;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  });

  if (!response.ok) {
    throw new Error(`Overpass API respondeu com status ${response.status}`);
  }

  const data = (await response.json()) as OverpassResponse;

  return data.elements
    .map((element) => {
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      if (lat === undefined || lon === undefined) return null;
      return {
        id: String(element.id),
        name: element.tags?.name ?? 'Delegacia de Polícia',
        lat,
        lon,
        distanceKm: haversineDistanceKm(origin, { lat, lon }),
      };
    })
    .filter((point): point is SupportPoint => point !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 5);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- overpass`
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/overpass.ts lib/overpass.test.ts
git commit -m "feat: add Overpass-based nearby support point lookup"
```

---

### Task 11: Support card with geolocation and map

**Files:**
- Create: `lib/supportChannels.ts`
- Create: `components/SupportMap.tsx`
- Create: `components/SupportCard.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/Feed.tsx`

**Interfaces:**
- Consumes: `findNearbySupportPoints`, `SupportPoint` from `lib/overpass.ts`
  (Task 10).
- Produces: `NATIONAL_SUPPORT_CHANNELS: { name: string; description: string;
  url?: string }[]`. `SupportMap` default-exported component (props:
  `origin: { lat: number; lon: number }; points: SupportPoint[]`).
  `SupportCard` component (no props) — mapped to `'apoio'` in `Feed.tsx`,
  completing the dynamic card set.

- [ ] **Step 1: Create `lib/supportChannels.ts`**

```ts
export interface SupportChannel {
  name: string;
  description: string;
  url?: string;
}

export const NATIONAL_SUPPORT_CHANNELS: SupportChannel[] = [
  {
    name: 'Delegacia Eletrônica / Delegacia de Crimes Cibernéticos',
    description:
      'Registre um boletim de ocorrência online ou procure a delegacia mais próxima.',
  },
  {
    name: 'Disque 100 — Direitos Humanos',
    description: 'Canal nacional para denúncias de violações de direitos humanos.',
  },
  {
    name: 'SaferNet Brasil',
    description:
      'Canal de denúncia de crimes cibernéticos e exposição não consentida de imagens.',
    url: 'https://new.safernet.org.br/denuncie',
  },
  {
    name: 'Central de Atendimento à Mulher — 180',
    description: 'Orientação e encaminhamento em situações de violência contra a mulher.',
  },
  {
    name: 'Defensoria Pública',
    description:
      'Assistência jurídica gratuita para buscar reparação e medidas de proteção.',
  },
];
```

- [ ] **Step 2: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'ALERTA — Sua imagem também é um direito',
  description:
    'Orientação e apoio para uso indevido de imagem gerada ou manipulada por IA.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Create `components/SupportMap.tsx`**

```tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { SupportPoint } from '@/lib/overpass';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface SupportMapProps {
  origin: { lat: number; lon: number };
  points: SupportPoint[];
}

export default function SupportMap({ origin, points }: SupportMapProps) {
  return (
    <MapContainer
      center={[origin.lat, origin.lon]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: '260px', width: '100%', borderRadius: '1rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[origin.lat, origin.lon]} icon={markerIcon}>
        <Popup>Você está aqui</Popup>
      </Marker>
      {points.map((point) => (
        <Marker key={point.id} position={[point.lat, point.lon]} icon={markerIcon}>
          <Popup>
            {point.name}
            <br />
            {point.distanceKm.toFixed(1)} km de distância
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

- [ ] **Step 4: Create `components/SupportCard.tsx`**

```tsx
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { NATIONAL_SUPPORT_CHANNELS } from '@/lib/supportChannels';
import { findNearbySupportPoints, type SupportPoint } from '@/lib/overpass';

const SupportMap = dynamic(() => import('./SupportMap'), { ssr: false });

type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

export function SupportCard() {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [origin, setOrigin] = useState<{ lat: number; lon: number } | null>(null);
  const [points, setPoints] = useState<SupportPoint[]>([]);

  function handleFindNearby() {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextOrigin = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setOrigin(nextOrigin);
        try {
          const nearby = await findNearbySupportPoints(nextOrigin);
          setPoints(nearby);
          setStatus('granted');
        } catch {
          setStatus('error');
        }
      },
      () => setStatus('denied')
    );
  }

  return (
    <section className="rounded-2xl bg-alerta-charcoal p-6 text-alerta-light shadow-lg">
      <h2 className="text-lg font-bold">Rede de apoio</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {NATIONAL_SUPPORT_CHANNELS.map((channel) => (
          <li key={channel.name}>
            <p className="font-medium">{channel.name}</p>
            <p className="text-alerta-light/70">{channel.description}</p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleFindNearby}
        disabled={status === 'loading'}
        className="mt-4 rounded-lg bg-alerta-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {status === 'loading' ? 'Localizando...' : 'Ver apoio perto de mim'}
      </button>

      {status === 'denied' && (
        <p className="mt-3 text-sm text-alerta-light/70">
          Localização não autorizada. Você ainda pode usar os canais nacionais
          listados acima.
        </p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-alerta-light/70">
          Não foi possível buscar pontos de apoio próximos agora. Tente
          novamente mais tarde.
        </p>
      )}
      {status === 'granted' && origin && (
        <div className="mt-4">
          <SupportMap origin={origin} points={points} />
          <ul className="mt-3 space-y-1 text-sm">
            {points.map((point) => (
              <li key={point.id}>
                {point.name} — {point.distanceKm.toFixed(1)} km
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 5: Update `components/Feed.tsx`**

```tsx
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
import { loadIntake, saveIntake } from '@/lib/storage';
import type { Category, CardId } from '@/lib/types';

export function Feed() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [freeText, setFreeText] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [reportDraft, setReportDraft] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

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
      />
      {cardOrder.map(renderDynamicCard)}
      <EducationCard />
      <ClosingCard />
    </div>
  );
}
```

- [ ] **Step 6: Verify the project builds**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 7: Commit**

```bash
git add lib/supportChannels.ts components/SupportMap.tsx components/SupportCard.tsx app/layout.tsx components/Feed.tsx
git commit -m "feat: add geolocation-based support card with Leaflet map"
```

---

### Task 12: Visual and responsive polish

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Feed` (Task 11). No new interfaces produced — this task only
  adjusts layout spacing.

- [ ] **Step 1: Update `app/page.tsx` with final spacing/safe-area polish**

```tsx
import { Feed } from '@/components/Feed';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 px-4 pb-16 pt-6 sm:px-6">
      <Feed />
    </main>
  );
}
```

- [ ] **Step 2: Verify the project builds**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 3: Run the full automated test suite**

Run: `npm run test`
Expected: PASS — all suites from Tasks 2, 3, 8, and 10 green (20 tests
total: 9 feedPriority + 4 storage + 3 claude + 4 overpass).

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "chore: final layout spacing and mobile safe-area polish"
```

---

### Task 13: Manual QA pass

**Files:** none (manual verification only; no code changes expected unless
a check below fails, in which case fix the specific file involved and
re-run Steps 1-3 of Task 12 before continuing).

**Interfaces:** none — this task exercises the full app built in Tasks 1-12.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server starts on `http://localhost:3000` with no errors in the
terminal.

- [ ] **Step 2: Verify the base feed and chip reordering**

In a browser, open `http://localhost:3000`. Confirm the Hero card and
"O que aconteceu com você?" intake card render first. Click the
"Estão me ameaçando ou tentando me expor" chip and confirm the "Rede de
apoio" card visually appears before the "Reúna suas evidências" card in
the feed. Click "Usaram minha foto sem autorização" and confirm
"Reúna suas evidências" moves back to the top of the dynamic section.

- [ ] **Step 3: Verify the AI mock flow (no `ANTHROPIC_API_KEY` set)**

With no `.env.local` file present, type
`"criaram uma imagem minha com inteligência artificial"` into the free-text
field and click "Analisar com IA". Confirm a summary sentence appears and
the "Criaram uma imagem minha com IA" chip becomes selected automatically.
In the "Reúna suas evidências" card, type a short evidence note and click
"Ajude-me a redigir minha denúncia". Confirm an editable draft text
appears referencing the note.

- [ ] **Step 4: Verify the geolocation flow, both outcomes**

In the "Rede de apoio" card, click "Ver apoio perto de mim" and grant
location permission when prompted. Confirm a map renders with a marker for
the current position and any nearby police points found. Reload the page,
click the button again, and deny permission this time. Confirm the card
shows the "Localização não autorizada" message and the static national
channel list remains visible and usable.

- [ ] **Step 5: Verify mobile viewport**

In the browser's device toolbar, switch to a mobile viewport (e.g. 390x844).
Confirm no horizontal scrolling appears, all cards remain readable, and
buttons are large enough to tap comfortably.

- [ ] **Step 6: Reload persistence check**

With at least one chip selected and free text entered, reload the page.
Confirm the chip selection and free text are restored from `localStorage`.

- [ ] **Step 7: Final commit**

If any fixes were needed during this pass, ensure they are committed with a
descriptive message. If no fixes were needed, no commit is required for
this task.
