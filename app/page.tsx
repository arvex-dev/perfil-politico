import Link from "next/link";
import { axes, questions, questionsFor } from "@/lib/data";

export default function Home() {
  return (
    <div className="pt-8 space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Onde você está no mapa político brasileiro?</h1>
        <p className="text-lg text-muted">
          Um teste em {axes.length} eixos pensado para o Brasil e a América do Sul: Petrobras, Bolsa Família, escala 6x1,
          armas, Amazônia, STF, BRICS, cotas. No fim você vê sua posição em cada eixo, a corrente de pensamento mais
          próxima e as figuras políticas e países mais parecidos com você.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/teste"
          className="rounded-xl border border-line bg-surface p-5 hover:border-accent transition-colors"
        >
          <div className="text-lg font-semibold">Teste completo</div>
          <div className="text-muted">{questions.length} afirmações · cerca de 10 minutos</div>
        </Link>
        <Link
          href="/teste/rapido"
          className="rounded-xl border border-line bg-surface p-5 hover:border-accent transition-colors"
        >
          <div className="text-lg font-semibold">Modo rápido</div>
          <div className="text-muted">{questionsFor("rapido").length} afirmações · cerca de 3 minutos, menos preciso</div>
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Os {axes.length} eixos</h2>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm">
          {axes.map((ax) => (
            <li key={ax.id} className="rounded-lg bg-surface border border-line px-3 py-2">
              <span className="font-medium">{ax.name}:</span>{" "}
              <span className="text-muted">
                {ax.poleA} ↔ {ax.poleB}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="text-sm text-muted space-y-2">
        <p>
          <strong className="text-foreground">Privacidade:</strong> suas respostas ficam só no seu navegador. Nada é
          enviado a servidor nem guardado em banco de dados; o link de resultado contém apenas a posição em cada eixo,
          nunca as respostas.
        </p>
        <p>
          <strong className="text-foreground">Limites:</strong> é um protótipo sem validação estatística ainda. As
          posições de figuras e países são estimativas a partir de fontes públicas. Não é recomendação de voto.{" "}
          <Link href="/sobre" className="underline">
            Veja a metodologia
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
