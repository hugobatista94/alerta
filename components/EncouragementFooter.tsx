import { ENCOURAGEMENT_MESSAGES } from '@/lib/content';

export function EncouragementFooter() {
  return (
    <section className="rounded-2xl bg-alerta-charcoal p-6 text-alerta-light shadow-lg">
      <h2 className="text-lg font-bold">Você não está sozinho ou sozinha</h2>
      <ul className="mt-3 space-y-3 text-sm text-alerta-light/85">
        {ENCOURAGEMENT_MESSAGES.map((message) => (
          <li key={message} className="border-l-2 border-alerta-red pl-3 italic">
            {message}
          </li>
        ))}
      </ul>
    </section>
  );
}
