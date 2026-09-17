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
