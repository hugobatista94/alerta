export function HeroCard() {
  return (
    <section className="rounded-2xl bg-alerta-black p-6 text-alerta-light shadow-lg">
      <div className="mb-3 flex items-center gap-2 text-alerta-red">
        <span aria-hidden className="text-2xl">
          ⚠️
        </span>
        <span className="text-3xl font-extrabold tracking-tight">ALERTA</span>
      </div>
      <h1 className="text-xl font-bold leading-snug">
        Sua imagem também é <span className="text-alerta-red">um direito</span>!
      </h1>
      <p className="mt-2 text-sm text-alerta-light/80">
        Nem tudo que parece real é real. O uso não autorizado de imagens
        geradas ou manipuladas por inteligência artificial é crime e fere o
        seu direito à imagem.
      </p>
    </section>
  );
}
