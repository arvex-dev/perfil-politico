import Link from "next/link";
import { QUICK_SIZE, axes, questions } from "@/lib/data";

export default function Home() {
  return (
    <div className="pt-10 sm:pt-16 space-y-12">
      <section className="space-y-6">
        <h1 className="font-display text-[2.6rem] sm:text-6xl leading-[1.02]">
          Onde você está na política brasileira?
        </h1>
        <p className="text-lg text-muted leading-relaxed max-w-xl">
          {questions.length} afirmações sobre temas daqui: Petrobras, Bolsa Família, escala 6x1, armas, Amazônia, STF,
          BRICS. No fim, seu alinhamento, sua posição em {axes.length} eixos e as figuras políticas mais parecidas com
          você.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/teste"
            className="inline-flex items-center justify-center rounded-full bg-ink text-paper px-7 h-14 text-lg font-semibold hover:opacity-90"
          >
            Começar o teste
          </Link>
          <Link
            href="/teste/rapido"
            className="inline-flex items-center justify-center rounded-full border border-line px-7 h-14 text-lg font-medium hover:border-ink"
          >
            Versão rápida ({QUICK_SIZE})
          </Link>
        </div>
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          ~10 min · sem cadastro · nada fica guardado
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3 text-[15px] leading-relaxed">
        <div className="space-y-1">
          <h2 className="font-semibold">Feito para o Brasil</h2>
          <p className="text-muted">Temas e figuras daqui e da América do Sul, não um teste americano traduzido.</p>
        </div>
        <div className="space-y-1">
          <h2 className="font-semibold">Equilibrado</h2>
          <p className="text-muted">Cada eixo tem afirmações dos dois lados, e todas trazem contexto e fontes.</p>
        </div>
        <div className="space-y-1">
          <h2 className="font-semibold">Privado</h2>
          <p className="text-muted">Respostas ficam no seu aparelho; o link do resultado guarda só a posição.</p>
        </div>
      </section>

      <p className="text-sm text-muted">
        Protótipo em validação, não é recomendação de voto.{" "}
        <Link href="/sobre" className="underline underline-offset-2">
          Veja a metodologia
        </Link>
        .
      </p>
    </div>
  );
}
