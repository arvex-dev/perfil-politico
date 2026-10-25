import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { axes } from "@/lib/data";
import { buildResult } from "@/lib/result";
import PoliticalMap from "@/components/PoliticalMap";
import ShareButtons from "@/components/ShareButtons";
import { IMAGE_VERSION } from "@/lib/og";

export async function generateMetadata({ params }: PageProps<"/r/[code]">): Promise<Metadata> {
  const { code } = await params;
  const r = buildResult(code);
  if (!r) return { title: "Resultado inválido" };
  const title = `${r.alignment.label} · ${r.ideology.target.name}`;
  const description = `Meu perfil político no teste de 12 eixos feito para o Brasil. Figura mais próxima: ${r.figures[0]?.target.name}. Faça o seu.`;
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: [{ url: `/r/${code}/og?v=${IMAGE_VERSION}`, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", images: [`/r/${code}/og?v=${IMAGE_VERSION}`] },
  };
}

function AxisRow({ name, poleA, poleB, score }: { name: string; poleA: string; poleB: string; score: number | null }) {
  const pos = score === null ? 50 : (score + 100) / 2;
  return (
    <li className="py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3 text-[13px] mb-2">
        <span className={score !== null && score < -10 ? "font-semibold" : "text-muted"}>{poleA}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted shrink-0">{name}</span>
        <span className={`text-right ${score !== null && score > 10 ? "font-semibold" : "text-muted"}`}>{poleB}</span>
      </div>
      <div className="relative h-2 rounded-full bg-track">
        <div className="absolute left-1/2 -top-0.5 h-3 w-px bg-muted/40" />
        {score !== null ? (
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-card"
            style={{ left: `${pos}%` }}
            aria-label={`${name}: ${score}`}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-muted">sem dados</span>
        )}
      </div>
    </li>
  );
}

export default async function ResultPage({ params }: PageProps<"/r/[code]">) {
  const { code } = await params;
  const r = buildResult(code);
  if (!r) notFound();
  const a = r.alignment;

  return (
    <div className="pt-6 space-y-10">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          Seu alinhamento{r.mode === "rapido" ? " · versão rápida" : ""}
        </p>
        <h1 className="font-display text-[2.4rem] sm:text-5xl leading-[1.05]">{a.label}</h1>
        <p className="text-lg text-muted">{a.detail}</p>
      </section>

      <section className="rounded-[20px] border border-line bg-card p-5 sm:p-6">
        <PoliticalMap x={a.economic} y={a.cultural} />
      </section>

      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">Corrente mais próxima</p>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl sm:text-3xl leading-tight">{r.ideology.target.name}</h2>
          <span className="font-mono text-lg tabular-nums">{r.ideology.similarity}%</span>
        </div>
        <p className="text-muted leading-relaxed">{r.ideology.target.desc}</p>
        <ul className="space-y-1.5 text-[15px] leading-relaxed">
          {r.explanation.map((l) => (
            <li key={l} className="flex gap-2">
              <span className="text-accent" aria-hidden="true">—</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
        {r.alternatives.length > 0 && (
          <p className="text-sm text-muted">
            Também perto: {r.alternatives.map((x) => `${x.target.name} (${x.similarity}%)`).join(" · ")}
          </p>
        )}
      </section>

      <ShareButtons code={r.code} label={a.label} imageVersion={IMAGE_VERSION} />

      <section className="space-y-4">
        <h2 className="font-display text-xl">Seus {axes.length} eixos</h2>
        <ul className="rounded-[20px] border border-line bg-card p-5 divide-y divide-line">
          {axes.map((ax) => (
            <AxisRow key={ax.id} name={ax.name} poleA={ax.poleA} poleB={ax.poleB} score={r.scores[ax.id]} />
          ))}
        </ul>
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-xl">Figuras mais próximas</h2>
          <ol className="divide-y divide-line rounded-[20px] border border-line bg-card">
            {r.figures.map((f) => (
              <li key={f.target.id} className="px-4 py-3">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{f.target.name}</span>
                  <span className="font-mono tabular-nums">{f.similarity}%</span>
                </div>
                <div className="text-sm text-muted">{f.target.role}</div>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-xl">Países mais próximos</h2>
          <ol className="divide-y divide-line rounded-[20px] border border-line bg-card">
            {r.countries.map((c) => (
              <li key={c.target.id} className="px-4 py-3 flex justify-between">
                <span className="font-medium">{c.target.name}</span>
                <span className="font-mono tabular-nums">{c.similarity}%</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="sm:col-span-2 text-xs text-muted leading-relaxed">
          Afinidade = 100 − distância média entre você e a referência nos eixos. Posições de figuras e países são
          estimativas a partir de votações, programas e declarações públicas.{" "}
          <Link href="/sobre#referencias" className="underline underline-offset-2">
            Ver bases
          </Link>
          .
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/teste" className="inline-flex items-center h-12 rounded-full border border-line px-5 hover:border-ink">
          Refazer o teste
        </Link>
        <Link href="/sobre" className="inline-flex items-center h-12 rounded-full border border-line px-5 hover:border-ink">
          Como funciona
        </Link>
      </div>
    </div>
  );
}
