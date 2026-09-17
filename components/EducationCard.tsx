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
