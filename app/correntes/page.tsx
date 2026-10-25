import type { Metadata } from "next";
import Link from "next/link";
import { ideologies } from "@/lib/data";
import { alignment } from "@/lib/alignment";

export const metadata: Metadata = {
  title: "Correntes políticas: da esquerda à direita no Brasil",
  description:
    "As 21 correntes políticas do teste explicadas: socialismo democrático, nacional-desenvolvimentismo, social-democracia, liberalismo, conservadorismo, libertarianismo e mais.",
  alternates: { canonical: "/correntes" },
};

export default function Correntes() {
  const sorted = [...ideologies].sort((a, b) => (alignment(a.coords).overall ?? 0) - (alignment(b.coords).overall ?? 0));
  return (
    <div className="pt-6 space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl sm:text-4xl">Correntes políticas</h1>
        <p className="text-muted leading-relaxed">
          As {ideologies.length} correntes que o teste usa para descrever o seu resultado, da mais à esquerda à mais à
          direita no eixo econômico e de costumes. Cada uma tem posição nos 12 eixos.
        </p>
      </header>
      <ul className="divide-y divide-line rounded-[20px] border border-line bg-card">
        {sorted.map((i) => (
          <li key={i.id}>
            <Link href={`/correntes/${i.id}`} className="block px-5 py-4 hover:bg-paper">
              <div className="flex justify-between gap-3">
                <span className="font-semibold">{i.name}</span>
                <span className="text-sm text-muted shrink-0">{alignment(i.coords).label}</span>
              </div>
              <p className="text-sm text-muted mt-1">{i.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/teste" className="inline-flex items-center h-12 rounded-full bg-ink text-paper px-6 font-semibold">
        Descubra a sua corrente
      </Link>
    </div>
  );
}
