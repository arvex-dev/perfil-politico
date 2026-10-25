import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { axes } from "@/lib/data";
import { buildResult } from "@/lib/result";
import ShareButtons from "@/components/ShareButtons";

export async function generateMetadata({ params }: PageProps<"/r/[code]">): Promise<Metadata> {
  const { code } = await params;
  const r = buildResult(code);
  if (!r) return { title: "Resultado inválido" };
  const title = `Meu perfil político: ${r.ideology.target.name}`;
  return {
    title,
    description: `Fiz o teste de 12 eixos calibrado para o Brasil. Figura mais próxima: ${r.figures[0]?.target.name}. Faça o seu.`,
    robots: { index: false },
    openGraph: {
      title,
      images: [{ url: `/r/${code}/imagem`, width: 1080, height: 1920, alt: title }],
    },
    twitter: { card: "summary_large_image", images: [`/r/${code}/imagem`] },
  };
}

function AxisBar({ name, poleA, poleB, score }: { name: string; poleA: string; poleB: string; score: number | null }) {
  const pos = score === null ? 50 : (score + 100) / 2;
  const strength = score === null ? null : Math.abs(score);
  return (
    <li className="space-y-1.5">
      <div className="flex justify-between text-xs uppercase tracking-wide text-muted">
        <span>{name}</span>
        <span>
          {score === null
            ? "sem dados"
            : strength! < 10
              ? "centro"
              : `${strength}% ${score < 0 ? poleA.toLowerCase() : poleB.toLowerCase()}`}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-line">
        <div className="absolute left-1/2 top-0 h-3 w-px bg-muted/50" />
        {score !== null && (
          <div
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent shadow"
            style={{ left: `${pos}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-sm">
        <span className={score !== null && score < -10 ? "font-semibold" : "text-muted"}>{poleA}</span>
        <span className={score !== null && score > 10 ? "font-semibold" : "text-muted"}>{poleB}</span>
      </div>
    </li>
  );
}

export default async function ResultPage({ params }: PageProps<"/r/[code]">) {
  const { code } = await params;
  const r = buildResult(code);
  if (!r) notFound();

  return (
    <div className="pt-6 space-y-10">
      <section className="space-y-3">
        <p className="text-sm text-muted">
          Seu resultado{r.mode === "rapido" ? " (modo rápido: menos preciso)" : ""}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{r.ideology.target.name}</h1>
        <p className="text-muted">
          {r.ideology.target.desc} <span className="whitespace-nowrap">Afinidade: {r.ideology.similarity}%.</span>
        </p>
        <ul className="space-y-1 text-[15px]">
          {r.explanation.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        {r.alternatives.length > 0 && (
          <p className="text-sm text-muted">
            Também perto de você:{" "}
            {r.alternatives.map((a) => `${a.target.name} (${a.similarity}%)`).join(" · ")}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Seus {axes.length} eixos</h2>
        <ul className="space-y-5 rounded-xl border border-line bg-surface p-4 sm:p-5">
          {axes.map((ax) => (
            <AxisBar key={ax.id} name={ax.name} poleA={ax.poleA} poleB={ax.poleB} score={r.scores[ax.id]} />
          ))}
        </ul>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Figuras mais próximas</h2>
          <ol className="space-y-2">
            {r.figures.map((f) => (
              <li key={f.target.id} className="rounded-lg border border-line bg-surface px-3 py-2">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{f.target.name}</span>
                  <span className="tabular-nums">{f.similarity}%</span>
                </div>
                <div className="text-sm text-muted">{f.target.role}</div>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Países mais próximos</h2>
          <ol className="space-y-2">
            {r.countries.map((c) => (
              <li key={c.target.id} className="rounded-lg border border-line bg-surface px-3 py-2 flex justify-between">
                <span className="font-medium">{c.target.name}</span>
                <span className="tabular-nums">{c.similarity}%</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="sm:col-span-2 text-xs text-muted">
          Afinidade = 100 − distância média entre você e a referência nos eixos (0 a 100). Posições de figuras e países
          são estimativas a partir de votações, programas e declarações públicas, não autodeclarações.{" "}
          <Link href="/sobre#referencias" className="underline">
            Ver fontes
          </Link>
          .
        </p>
      </section>

      <ShareButtons code={r.code} ideology={r.ideology.target.name} />

      <section className="flex flex-wrap gap-3 text-sm">
        <Link href="/teste" className="rounded-lg border border-line px-4 py-2 hover:border-accent">
          Refazer o teste
        </Link>
        <Link href="/sobre" className="rounded-lg border border-line px-4 py-2 hover:border-accent">
          Como funciona
        </Link>
      </section>
    </div>
  );
}
