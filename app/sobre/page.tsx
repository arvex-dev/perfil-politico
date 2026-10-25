import type { Metadata } from "next";
import { axes, countries, figures, ideologies, questions } from "@/lib/data";

export const metadata: Metadata = { title: "Metodologia" };

const COUNTRY: Record<string, string> = {
  BR: "Brasil", AR: "Argentina", CL: "Chile", UY: "Uruguai", CO: "Colômbia", VE: "Venezuela", BO: "Bolívia",
  EC: "Equador", PE: "Peru", SV: "El Salvador", US: "EUA", ES: "Espanha", NZ: "Nova Zelândia", DE: "Alemanha",
  FR: "França", GB: "Reino Unido", IT: "Itália",
};

export default function Sobre() {
  return (
    <article className="pt-6 space-y-8 leading-relaxed">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Metodologia</h1>
        <p className="text-muted">
          Protótipo de teste político estilo 12axes/8values, recalibrado para o Brasil e a América do Sul. Versão 1 dos
          dados: {axes.length} eixos, {questions.length} afirmações, {ideologies.length} correntes, {figures.length}{" "}
          figuras e {countries.length} países.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Eixos</h2>
        <ul className="space-y-3">
          {axes.map((ax) => (
            <li key={ax.id}>
              <strong>
                {ax.name}: {ax.poleA} ↔ {ax.poleB}.
              </strong>{" "}
              <span className="text-muted">{ax.why}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Como a pontuação funciona</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Cada eixo tem 6 afirmações: 3 em que concordar puxa para um polo e 3 em que concordar puxa para o outro.
            Quem concorda com tudo fica no centro, o que neutraliza o viés de concordância.
          </li>
          <li>
            Respostas valem de −2 (discordo totalmente) a +2 (concordo totalmente). Score do eixo = soma(resposta ×
            sentido) ÷ máximo possível × 100, de −100 a +100. &quot;Não sei&quot; sai da conta do eixo.
          </li>
          <li>
            Afinidade com correntes, figuras e países = 100 − média quadrática das diferenças por eixo. Uma diferença
            média de 25 pontos dá 75%; só passa de 90% quem está a menos de 10 pontos, em média, em todos os eixos.
            Comparações com menos de 6 eixos em comum são descartadas.
          </li>
          <li>
            O modo rápido usa 2 afirmações por eixo (uma em cada sentido) e é menos preciso.
          </li>
          <li>
            A ordem das afirmações intercala os eixos e as palavras foram escolhidas para que tanto quem está à esquerda
            quanto quem está à direita encontre afirmações com as quais concorda.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Privacidade</h2>
        <p>
          Opinião política é dado pessoal sensível (LGPD, art. 5º, II). Por isso não há servidor de dados: as respostas
          ficam no seu navegador, e o link de resultado guarda só os {axes.length} scores, sem as respostas. Não há
          cookies de rastreamento.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Limitações</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Ainda não passou por piloto, análise fatorial nem cálculo de consistência interna (alfa de Cronbach).</li>
          <li>
            As posições de figuras, países e correntes são <strong>estimativas</strong> dos autores com base em
            votações, programas e declarações públicas; quando existe, citamos a nota do partido na classificação de
            especialistas de Bolognesi, Ribeiro &amp; Codato (Dados, 2023). Não são autodeclarações.
          </li>
          <li>Não é pesquisa eleitoral nem recomendação de voto.</li>
        </ul>
      </section>

      <section id="referencias" className="space-y-3">
        <h2 className="text-xl font-semibold">Figuras de referência e base da estimativa</h2>
        <ul className="text-sm space-y-1.5">
          {figures.map((f) => (
            <li key={f.id}>
              <strong>{f.name}</strong> ({COUNTRY[f.country] ?? f.country}, {f.role}): <span className="text-muted">estimado. {f.basis}</span>
              {f.sources.map((s) => (
                <a key={s} href={s} className="ml-1 underline text-muted" rel="noopener noreferrer" target="_blank">
                  [fonte]
                </a>
              ))}
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          Países: posição estimada do regime de políticas públicas em 2025, não da população.
        </p>
      </section>
    </article>
  );
}
