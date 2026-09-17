export function DenunciaCard() {
  return (
    <section className="rounded-2xl bg-alerta-charcoal p-6 text-alerta-light shadow-lg">
      <h2 className="text-lg font-bold">Caso aconteça, o que fazer?</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
        <li>
          Denuncie: procure a delegacia mais próxima ou registre um boletim
          de ocorrência online.
        </li>
        <li>
          Avise o suporte das plataformas: peça a remoção do conteúdo e o
          bloqueio dos perfis que estiverem divulgando.
        </li>
        <li>
          Busque orientação jurídica: você pode ter direito a indenização e
          outras medidas legais de proteção.
        </li>
      </ol>
    </section>
  );
}
