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
  if (
    /\bia\b/.test(text) ||
    text.includes('intelig') ||
    text.includes('deepfake') ||
    text.includes('gerad')
  ) {
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

// Claude sometimes wraps JSON responses in a markdown code fence even when
// explicitly asked not to. Strip a leading/trailing ```json or ``` fence
// before attempting to parse.
function stripCodeFence(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

export function parseAnalyzeResponse(raw: string, fallback: AnalyzeResult): AnalyzeResult {
  try {
    const parsed = JSON.parse(stripCodeFence(raw));
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
    console.error('[claude] analyzeReport: failed to parse model response, using fallback');
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
  if (!textBlock || textBlock.type !== 'text') {
    console.error('[claude] analyzeReport: no text block in model response, using fallback');
    return fallback;
  }
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
  if (!textBlock || textBlock.type !== 'text') {
    console.error('[claude] draftReport: no text block in model response, using fallback');
    return fallback;
  }
  return textBlock.text;
}
