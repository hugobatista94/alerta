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
    url: 'https://delegaciavirtual.sinesp.gov.br/portal/home',
  },
  {
    name: 'Disque 100 — Direitos Humanos',
    description: 'Canal nacional para denúncias de violações de direitos humanos.',
    url: 'https://www.gov.br/pt-br/servicos/denunciar-violacao-de-direitos-humanos',
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
    url: 'https://www.gov.br/mulheres/pt-br/ligue180',
  },
  {
    name: 'Defensoria Pública',
    description:
      'Assistência jurídica gratuita para buscar reparação e medidas de proteção. Cada estado tem sua própria Defensoria — use o mapa abaixo para encontrar a do seu estado.',
    url: 'https://www.ipea.gov.br/sites/pt-br/mapadefensoria/defensoresnosestados',
  },
];
