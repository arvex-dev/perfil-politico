import type { Metadata } from "next";
import Link from "next/link";
import { QUICK_SIZE, axes, questions } from "@/lib/data";
import { REPO_URL, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Teste político brasileiro em 12 eixos: esquerda, direita e além | Perfil Político" },
  description:
    "Descubra seu alinhamento político com um teste feito para o Brasil: 72 afirmações sobre economia, costumes, segurança, ambiente, STF e BRICS. Grátis, sem cadastro, com fontes em cada pergunta.",
  alternates: { canonical: "/" },
};

const FAQ = [
  ["O teste é neutro?", "Cada eixo tem afirmações dos dois lados, quem concorda com tudo cai no centro, e cada afirmação traz contexto e fontes checadas. O código e os dados são abertos para auditoria."],
  ["Meus dados ficam guardados?", "Não. As respostas ficam no seu navegador; o link do resultado guarda só a posição em cada eixo. Não há cadastro nem servidor de dados."],
  ["Quanto tempo leva?", `O teste completo tem ${questions.length} afirmações (cerca de 10 minutos); a versão rápida tem ${QUICK_SIZE} (cerca de 3 minutos).`],
  ["Qual a diferença para o 8values ou o Political Compass?", "Os temas, as figuras e as correntes são do Brasil e da América do Sul (Petrobras, Bolsa Família, STF, agro, BRICS), e a afinidade usa uma fórmula que não dá 90% para todo mundo."],
  ["O resultado diz em quem votar?", "Não. É uma ferramenta para entender suas próprias posições; não é pesquisa eleitoral nem recomendação de voto."],
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", name: "Perfil Político", url: SITE_URL, inLanguage: "pt-BR" },
    {
      "@type": "WebApplication",
      name: "Perfil Político: teste político em 12 eixos",
      url: SITE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "pt-BR",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      sameAs: [REPO_URL],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ],
};

export default function Home() {
  return (
    <div className="pt-10 sm:pt-16 space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
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

      <section className="space-y-3">
        <h2 className="font-display text-xl">Perguntas frequentes</h2>
        <div className="divide-y divide-line rounded-[20px] border border-line bg-card">
          {FAQ.map(([q, a]) => (
            <details key={q} className="px-5 py-4">
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="mt-2 text-muted leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
        <p className="text-sm">
          <Link href="/correntes" className="underline underline-offset-2">Conheça as 21 correntes políticas</Link> que o teste usa.
        </p>
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
