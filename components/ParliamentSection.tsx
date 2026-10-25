// Seção "Eleições 2026" do resultado: deputados e senadores do mandato atual que votam como a pessoa, pelas votações
// nominais. Renderizada no servidor; o filtro por UF é um formulário GET (funciona sem JavaScript).
import { MIN_AXES, MIN_VOTES, UFS, parliament, rankParliament } from "@/lib/parliament";
import type { Scores } from "@/lib/scoring";
import { axes } from "@/lib/data";

function List({ title, items }: { title: string; items: ReturnType<typeof rankParliament> }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Ninguém com votos suficientes nesse filtro.</p>
      ) : (
        <ol className="divide-y divide-line rounded-[20px] border border-line bg-card">
          {items.map(({ m, r }) => (
            <li key={m.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="font-medium underline-offset-2 hover:underline">
                  {m.nome}
                </a>
                <div className="text-sm text-muted">
                  {m.partido}-{m.uf} · {r.votes} votações em {r.axes} eixos
                </div>
              </div>
              <span className="font-mono tabular-nums shrink-0">{r.similarity}%</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function ParliamentSection({ scores, uf, vs }: { scores: Scores; uf?: string; vs?: string }) {
  const validUf = uf && UFS.includes(uf) ? uf : undefined;
  const covered = axes.filter((a) => parliament.axes.includes(a.id)).map((a) => a.name.toLowerCase());
  const missing = axes.filter((a) => !parliament.axes.includes(a.id)).map((a) => a.name.toLowerCase());
  return (
    <section id="parlamentares" className="space-y-4">
      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">Eleições 2026</p>
        <h2 className="font-display text-xl">Quem no Congresso vota como você</h2>
        <p className="text-sm text-muted leading-relaxed">
          Concordância entre suas respostas e como cada parlamentar do mandato 2023–2027 votou em {parliament.rollcalls}{" "}
          votações nominais da Câmara e do Senado. Cobre {covered.join(", ")}; {missing.join(", ")} não tiveram votações
          que separassem os lados. Só entra quem tem pelo menos {MIN_VOTES} votos em {MIN_AXES} eixos.
        </p>
      </div>
      <form method="get" action="#parlamentares" className="flex flex-wrap items-center gap-2">
        {vs && <input type="hidden" name="vs" value={vs} />}
        <label htmlFor="uf" className="text-sm">Estado</label>
        <select id="uf" name="uf" defaultValue={validUf ?? ""} className="h-11 rounded-[12px] border border-line bg-card px-3">
          <option value="">Brasil todo</option>
          {UFS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <button type="submit" className="h-11 rounded-full border border-line px-4 hover:border-ink">Filtrar</button>
      </form>
      <div className="grid gap-6 sm:grid-cols-2">
        <List title={`Deputados${validUf ? ` (${validUf})` : ""}`} items={rankParliament(scores, { casa: "C", uf: validUf }, 5)} />
        <List title={`Senadores${validUf ? ` (${validUf})` : ""}`} items={rankParliament(scores, { casa: "S", uf: validUf }, 3)} />
      </div>
      <p className="text-xs text-muted leading-relaxed">
        Partido atual, não o da época do voto. Concordância em votações não é recomendação de voto; veja o histórico completo
        na página oficial de cada parlamentar. Dados abertos da Câmara e do Senado; método em{" "}
        <a href="https://github.com/arvex-dev/perfil-politico/tree/main/docs/pesquisa/votacoes" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
          docs/pesquisa/votacoes
        </a>
        .
      </p>
    </section>
  );
}
