import { PREVENTION_TIPS } from '@/lib/content';

export function PreventionCard() {
  return (
    <section className="rounded-2xl bg-alerta-light p-5 sm:p-6 text-alerta-black shadow-lg">
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
