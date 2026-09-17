# ALERTA — Aplicação Web de Feed Adaptativo

Data: 2026-09-17
Status: Aprovado para planejamento de implementação

## Contexto e objetivo

O projeto nasce de um panfleto de conscientização ("ALERTA — Sua imagem também
é um direito") sobre uso indevido/manipulação de imagens por IA (deepfakes,
montagens não consentidas, exposição). O objetivo é transformar esse conteúdo
em uma **aplicação web** (não um app nativo) responsiva, organizada como um
**feed adaptativo**: a pessoa informa o que aconteceu com ela e o feed
reordena/prioriza os cards de orientação de acordo com o caso, em vez de
apresentar um menu estático de seções.

Público: pessoas que sofreram uso indevido de sua imagem (incluindo conteúdo
gerado/manipulado por IA), buscando entender o que aconteceu, o que fazer, e
onde buscar apoio.

## Diferenciais em relação a apps de referência (ex: apps de apoio à mulher)

- **Foco específico em abuso de imagem por IA** (deepfakes, montagens não
  consentidas), um problema recente e pouco coberto por serviços de apoio
  generalistas.
- **Público inclusivo**: não é limitado a mulheres — qualquer pessoa pode ser
  vítima de uso indevido de imagem por IA.
- **Feed adaptativo**, não menu de navegação: o conteúdo se reordena sozinho
  conforme o que a pessoa relata, sem exigir que ela saiba onde procurar.
- **IA que age, não só informa**: ajuda a estruturar o relato e a redigir a
  denúncia, não apenas exibe texto explicativo estático.
- **Privacidade por padrão**: nenhum dado sensível é salvo em servidor ou
  banco de dados — tudo permanece no dispositivo da pessoa.
- **Zero fricção de acesso**: aplicação web, sem necessidade de baixar app de
  loja — acesso imediato por link, relevante num momento de crise.
- **Localização sem infraestrutura paga**: encontra apoio/delegacias
  próximas usando dados abertos (OpenStreetMap), sem depender de orçamento
  para APIs pagas.

## Decisões de escopo (fechadas com o usuário)

- **É uma aplicação web**, não um aplicativo móvel nativo. Deve funcionar bem
  em desktop e em navegadores móveis (mobile-first). PWA fica como possível
  evolução futura, não é requisito do MVP.
- **Formato de feed adaptativo**: scroll vertical de cards; o conteúdo se
  reordena e prioriza conforme a resposta da pessoa a "o que aconteceu com
  você?", em vez de navegação por menus/telas separadas.
- **Motor de adaptação híbrido**: fluxo principal por regras determinísticas
  (chips de seleção rápida), com IA real (Claude API) usada em pontos
  pontuais de alto valor — nunca controlando sozinha decisões sensíveis (como
  classificar se algo "é ou não crime").
- **Sem backend com banco de dados**. Dados sensíveis (relato, evidências)
  ficam apenas em `localStorage`, no dispositivo da própria pessoa. Nenhum
  dado é enviado a um servidor além do texto necessário para a chamada de IA
  em tempo real (não persistido no servidor).
- **Sem autenticação/contas de usuário** no MVP.
- Se a chave de API da Claude não estiver configurada, os recursos de IA
  operam em modo mock (respostas coerentes pré-definidas), sem quebrar a
  experiência.
- **Localização é usada, mas nunca armazenada**: a coordenada obtida via
  navegador é usada apenas em tempo real para consultar pontos de apoio
  próximos, e descartada em seguida (não vai para `localStorage` nem para
  nenhum servidor controlado pela aplicação).

## Arquitetura

- **Next.js (App Router) + TypeScript + Tailwind CSS**, projeto único
  full-stack.
- Rotas de API internas do próprio Next.js (ex: `/api/analyze`,
  `/api/draft-report`) para as chamadas à Claude API — a chave de API vive
  apenas no servidor (`.env.local`), nunca no client.
- Estado da aplicação (respostas do usuário, evidências anexadas/descritas)
  mantido em memória de componente + persistido em `localStorage` para
  sobreviver a reload de página.
- Deploy alvo: Vercel (compatível com free tier), mas deve rodar localmente
  via `npm run dev` sem depender de nenhum serviço externo configurado.
- **Localização e mapa**: `navigator.geolocation` (API nativa do navegador)
  para obter a posição da pessoa mediante permissão explícita; consulta à
  **Overpass API** (OpenStreetMap) para buscar pontos de apoio próximos
  (`amenity=police`, e opcionalmente outras categorias de apoio mapeadas);
  exibição num mapa com **Leaflet** + tiles do OpenStreetMap. Toda essa
  cadeia roda no client, sem chave de API paga e sem passar pelo backend da
  aplicação.

## Estrutura do feed (página única `/`)

Scroll vertical de cards, nesta ordem lógica:

1. **Card hero (fixo)** — identidade do panfleto: título "ALERTA — Sua imagem
   também é um direito", frase de impacto "Nem tudo que parece real é real."
2. **Card de entrada adaptativa** — pergunta "O que aconteceu com você?" com
   chips de seleção rápida:
   - Usaram minha foto sem autorização
   - Criaram uma imagem minha com IA
   - Alteraram uma imagem minha
   - Publicaram minha imagem sem consentimento
   - Estão me ameaçando ou tentando me expor
   - Não sei exatamente o que aconteceu

   Mais um campo de texto livre opcional, para quem quiser descrever a
   situação com as próprias palavras.
3. **Cards gerados/priorizados dinamicamente**, conforme a escolha, na ordem
   de relevância calculada: Evidências → Denúncia → Rede de Apoio →
   Direitos → Prevenção. Cards não diretamente relevantes ao caso continuam
   visíveis (função educativa geral), mas com menor destaque visual/posição
   mais baixa no feed.

   O card de **Rede de Apoio** combina duas partes: (a) uma lista estática
   de canais oficiais nacionais (ex: Polícia Civil / Delegacia Eletrônica,
   Disque 100, SaferNet Brasil, canais de denúncia das plataformas,
   Defensoria Pública) e (b) um bloco opcional "Ver apoio perto de mim",
   que pede permissão de localização e mostra num mapa (Leaflet/OSM) os
   pontos de apoio/delegacias mais próximos, com endereço e distância.
   Se a pessoa não conceder a permissão, o card continua funcional apenas
   com a lista estática nacional.
4. **Card educativo fixo** (sempre presente, abaixo dos priorizados): "O que
   é?" — explica como a IA generativa permite criar/editar/manipular imagens
   e lista os usos ofensivos mais comuns (conteúdo direto do panfleto
   original). Prevenção já está coberta como card dinâmico no item 3 acima,
   não se repete aqui.
5. **Card de encerramento**: "Sua imagem é sua história. Respeite." mais
   reforço de direitos ("O que é seu, só você pode autorizar.").

A lógica de priorização (mapa: resposta → ordem/peso dos cards) deve ser uma
função pura, independente da UI, para ser testável isoladamente.

## Uso de IA (Claude API)

- **Classificação do texto livre**: quando a pessoa descreve a situação em
  texto livre, ele é enviado a `/api/analyze`, que chama a Claude API para
  (a) mapear o relato para uma ou mais das categorias de chip existentes e
  (b) gerar um resumo estruturado do relato (data, tipo de conteúdo,
  plataforma, se mencionado).
- **Redação assistida de denúncia**: botão "Ajude-me a redigir minha
  denúncia" no card de Evidências. Usa os dados já preenchidos pela pessoa
  (o que aconteceu, onde, quando) para gerar, via Claude API, um texto
  formal de denúncia — sempre editável antes de a pessoa usar/copiar, nunca
  enviado automaticamente a lugar nenhum.
- **Modo mock**: se `ANTHROPIC_API_KEY` não estiver definida em
  `.env.local`, as rotas de API retornam respostas pré-definidas coerentes
  em vez de chamar a API real, permitindo rodar e demonstrar o produto sem
  chave configurada.

## Identidade visual

Direto do panfleto original:
- Fundo escuro (preto/cinza-chumbo) como base.
- Vermelho de alerta (tom próximo a `#E31E24`) para ações primárias, ícones
  de alerta e destaques.
- Branco para texto de leitura sobre fundo escuro; áreas de conteúdo
  educativo mais denso podem usar fundo claro (cinza muito claro) para
  variar a leitura ao longo do scroll, como no panfleto original.
- Tipografia bold/condensada nos títulos e nomes de seção.
- Ícones simples e consistentes com o material original (triângulo de
  alerta, cadeado, olho riscado, sino, escudo).

## Testes

- Testes unitários (Vitest ou Jest) para a função pura de priorização de
  cards, cobrindo cada categoria de chip e o caso "não sei o que aconteceu".
- Teste manual do fluxo completo (seleção de chip → reordenação do feed →
  uso dos botões de IA em modo mock) em viewport mobile e desktop antes de
  considerar o MVP pronto.
- Teste manual do card de localização nos dois cenários: permissão
  concedida (mapa e pontos próximos aparecem) e permissão negada (card
  permanece funcional só com a lista estática nacional).

## Fora de escopo (fases futuras, não implementar agora)

- Contas de usuário, login e sincronização entre dispositivos.
- Banco de dados / persistência no servidor.
- Transformação em PWA instalável.
- Upload real de arquivos de evidência (prints, imagens) — no MVP a pessoa
  apenas descreve/lista as evidências em texto.
