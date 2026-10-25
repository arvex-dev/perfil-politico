// Comparação entre este resultado e o de quem convidou (?vs=). Os rótulos são neutros porque o mesmo link é visto
// pelas duas pessoas.
import Link from "next/link";
import { axes } from "@/lib/data";
import { compare } from "@/lib/compare";
import type { Result } from "@/lib/result";

function Dots({ a, b }: { a: number; b: number }) {
  const p = (v: number) => `${(v + 100) / 2}%`;
  return (
    <div className="relative h-2 rounded-full bg-track my-2">
      <div className="absolute left-1/2 -top-1.5 h-5 w-0.5 -translate-x-1/2 rounded-full bg-ink/70" />
      {/* Círculo de quem convidou por baixo, ponto deste resultado por cima: posições iguais viram um alvo. */}
      <div className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink bg-card" style={{ left: p(b) }} />
      <div className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" style={{ left: p(a) }} />
    </div>
  );
}

export default function Comparison({ me, other }: { me: Result; other: Result }) {
  const c = compare(axes, me.scores, other.scores);
  return (
    <section className="rounded-[20px] border-2 border-ink bg-card p-5 sm:p-6 space-y-5">
      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">Comparação</p>
        <h2 className="font-display text-3xl">{c.agreement}% de concordância</h2>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-accent" /> Este resultado: <strong>{me.alignment.label}</strong>
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-[3px] border-ink" /> Quem convidou:{" "}
            <Link href={`/r/${other.code}`} className="font-semibold underline underline-offset-2">
              {other.alignment.label}
            </Link>
          </span>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 text-[15px]">
        <div>
          <h3 className="font-semibold mb-1">Onde mais concordam</h3>
          <ul className="space-y-0.5 text-muted">
            {c.closest.map((d) => (
              <li key={d.axis.id}>{d.axis.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Onde mais discordam</h3>
          <ul className="space-y-0.5 text-muted">
            {c.farthest.length ? c.farthest.map((d) => <li key={d.axis.id}>{d.axis.name}</li>) : <li>Nenhuma diferença grande</li>}
          </ul>
        </div>
      </div>
      <ul className="divide-y divide-line">
        {c.axes.map((d) => (
          <li key={d.axis.id} className="py-2.5">
            <div className="flex justify-between text-xs text-muted">
              <span>{d.axis.poleA}</span>
              <span className="font-mono uppercase tracking-wider">{d.axis.name}</span>
              <span>{d.axis.poleB}</span>
            </div>
            <Dots a={d.a} b={d.b} />
          </li>
        ))}
      </ul>
    </section>
  );
}
