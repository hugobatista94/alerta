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
