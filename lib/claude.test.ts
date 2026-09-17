import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analyzeReport, draftReport, parseAnalyzeResponse } from './claude';
import type { AnalyzeResult } from './claude';

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

  it('does not classify unrelated Portuguese words containing "ia" as AI-related', async () => {
    const result = await analyzeReport(
      'Fui até a delegacia registrar um boletim de ocorrência sobre a polícia local'
    );
    expect(result.categories).not.toContain('imagem-criada-ia');
  });

  it('classifies text mentioning "IA" as a standalone word', async () => {
    const result = await analyzeReport('Uma IA gerou essa imagem falsa de mim');
    expect(result.categories).toContain('imagem-criada-ia');
  });

  it('classifies text mentioning "deepfake" as AI-related', async () => {
    const result = await analyzeReport('Fizeram um deepfake com meu rosto');
    expect(result.categories).toContain('imagem-criada-ia');
  });
});

describe('parseAnalyzeResponse (real API response parsing)', () => {
  const fallback: AnalyzeResult = { categories: ['nao-sei'], summary: 'fallback' };

  it('parses JSON wrapped in a ```json markdown code fence', () => {
    const raw = '```json\n{"categories": ["ameaca-exposicao"], "summary": "resumo"}\n```';
    const result = parseAnalyzeResponse(raw, fallback);
    expect(result.categories).toEqual(['ameaca-exposicao']);
    expect(result.summary).toBe('resumo');
  });

  it('parses JSON wrapped in a plain ``` markdown code fence', () => {
    const raw = '```\n{"categories": ["nao-sei"], "summary": "resumo simples"}\n```';
    const result = parseAnalyzeResponse(raw, fallback);
    expect(result.summary).toBe('resumo simples');
  });

  it('parses plain JSON without a code fence', () => {
    const raw = '{"categories": ["nao-sei"], "summary": "sem cerca"}';
    const result = parseAnalyzeResponse(raw, fallback);
    expect(result.summary).toBe('sem cerca');
  });

  it('logs and falls back when the response is not valid JSON even after fence stripping', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = parseAnalyzeResponse('isto não é JSON', fallback);
    expect(result).toEqual(fallback);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
