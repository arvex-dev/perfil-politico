import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { axes, figures, ideologies } from "@/lib/data";
import { alignment } from "@/lib/alignment";
import { rank } from "@/lib/scoring";

export function generateStaticParams() {
  return ideologies.map((i) => ({ slug: i.id }));
}

export async function generateMetadata({ params }: PageProps<"/correntes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const i = ideologies.find((x) => x.id === slug);
  if (!i) return {};
  return {
    title: `${i.name}: o que é e onde fica no espectro político`,
    description: `${i.desc} Veja a posição de ${i.name.toLowerCase()} em 12 eixos e quais figuras brasileiras e sul-americanas ficam mais perto.`,
    alternates: { canonical: `/correntes/${i.id}` },
  };
}

export default async function Corrente({ params }: PageProps<"/correntes/[slug]">) {
  const { slug } = await params;
  const i = ideologies.find((x) => x.id === slug);
  if (!i) notFound();
  const a = alignment(i.coords);
  const near = rank(i.coords, figures).slice(0, 5);
  const neighbors = rank(i.coords, ideologies.filter((x) => x.id !== i.id)).slice(0, 3);
  return (
    <article className="pt-6 space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          <Link href="/correntes" className="hover:text-ink">Correntes</Link> · {a.label}
        </p>
        <h1 className="font-display text-3xl sm:text-5xl leading-tight">{i.name}</h1>
        <p className="text-lg leading-relaxed">{i.desc}</p>
        <p className="text-muted">{a.detail}</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Posição nos 12 eixos</h2>
        <ul className="rounded-[20px] border border-line bg-card p-5 divide-y divide-line">
          {axes.map((ax) => {
            const s = i.coords[ax.id];
            const pos = s == null ? 50 : (s + 100) / 2;
            return (
              <li key={ax.id} className="py-3 first:pt-0 last:pb-0">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted text-center mb-1">{ax.name}</p>
                <div className="flex justify-between gap-3 text-[13px] mb-2">
                  <span className={`min-w-0 [overflow-wrap:anywhere] ${s != null && s < -10 ? "font-semibold" : "text-muted"}`}>{ax.poleA}</span>
                  <span className={`min-w-0 [overflow-wrap:anywhere] text-right ${s != null && s > 10 ? "font-semibold" : "text-muted"}`}>{ax.poleB}</span>
                </div>
                <div className="relative h-2 rounded-full bg-track">
                  {s != null && <div className="absolute inset-y-0 bg-accent/35" style={{ left: `${Math.min(50, pos)}%`, width: `${Math.abs(pos - 50)}%` }} />}
                  <div className="absolute left-1/2 -top-1.5 h-5 w-0.5 -translate-x-1/2 rounded-full bg-ink/70" />
                  {s != null && <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-card" style={{ left: `${pos}%` }} />}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted">Posições estimadas a partir da literatura; ver metodologia.</p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <h2 className="font-display text-xl">Figuras mais próximas</h2>
          <ul className="text-[15px] space-y-1">
            {near.map((f) => (
              <li key={f.target.id} className="flex justify-between gap-2">
                <span>{f.target.name}</span>
                <span className="font-mono text-muted">{f.similarity}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl">Correntes vizinhas</h2>
          <ul className="text-[15px] space-y-1">
            {neighbors.map((n) => (
              <li key={n.target.id}>
                <Link href={`/correntes/${n.target.id}`} className="underline underline-offset-2">{n.target.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Link href="/teste" className="inline-flex items-center h-12 rounded-full bg-ink text-paper px-6 font-semibold">
        Faça o teste e veja se você é {i.name.toLowerCase()}
      </Link>
    </article>
  );
}
