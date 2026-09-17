# ALERTA

ALERTA é um web app de feed adaptativo com orientação e apoio para vítimas de uso indevido de imagem por IA (fotos alteradas, imagens geradas artificialmente, exposição não consentida, entre outros).

**O app funciona 100% sem nenhuma chave de API configurada.** Por padrão, os recursos de IA (classificação do relato e redação de denúncia) rodam em um modo mock determinístico. Configurar `ANTHROPIC_API_KEY` em um arquivo `.env.local` (veja `.env.local.example`) habilita o uso da API real da Claude, mas isso é totalmente opcional.

## Instalação

```bash
npm install
```

## Rodando em desenvolvimento

```bash
npm run dev
```

## Testes

```bash
npm run test
```

## Build de produção

```bash
npm run build
```
