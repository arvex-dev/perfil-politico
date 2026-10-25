// "Parlamentares que votam como você": compara o resultado com a posição de cada deputado e senador do mandato atual,
// calculada pelas votações nominais (docs/pesquisa/votacoes/, scripts/parlamentares.mjs). Só no servidor: o arquivo
// tem ~160 KB e não vai para o navegador.
import data from "@/data/parlamentares.json";
import type { Scores } from "./scoring";

export interface Parliamentarian {
  id: string;
  nome: string;
  partido: string;
  uf: string;
  casa: "C" | "S";
  url: string;
  a: Record<string, [number, number]>;
}

export const parliament = data as unknown as { generated_at: string; rollcalls: number; axes: string[]; members: Parliamentarian[] };
export const UFS = [...new Set(parliament.members.map((m) => m.uf))].sort();
export const MIN_AXES = 3;

export const MIN_VOTES = 5;

/**
 * Concordância voto a voto. Voto é binário, então a posição do parlamentar num eixo é a fração de votos para o polo B.
 * Para cada eixo, a chance de você votar para o polo B é p = (score + 100) / 200; a concordância no eixo é a média, nos
 * votos dele, de p (votou B) ou 1 − p (votou A). Resultado = média dos eixos, cada um pesando até 3 votos, para um eixo
 * com muitas votações (ambiente) não dominar. Quem fica no centro tende a 50% com todos, o que é honesto.
 */
export function matchParliamentarian(scores: Scores, m: Parliamentarian) {
  let sum = 0;
  let w = 0;
  let axes = 0;
  let votes = 0;
  for (const [axis, [score, n]] of Object.entries(m.a)) {
    const s = scores[axis];
    if (s === null || s === undefined || n === 0) continue;
    const p = (s + 100) / 200;
    const fracB = (score + 100) / 200;
    const agree = fracB * p + (1 - fracB) * (1 - p);
    const wt = Math.min(n, 3);
    sum += wt * agree;
    w += wt;
    axes++;
    votes += n;
  }
  if (axes < MIN_AXES || votes < MIN_VOTES) return null;
  return { similarity: Math.round((100 * sum) / w), axes, votes };
}

export function rankParliament(scores: Scores, filter: { casa: "C" | "S"; uf?: string }, limit = 5) {
  return parliament.members
    .filter((m) => m.casa === filter.casa && (!filter.uf || m.uf === filter.uf))
    .map((m) => ({ m, r: matchParliamentarian(scores, m) }))
    .filter((x): x is { m: Parliamentarian; r: NonNullable<ReturnType<typeof matchParliamentarian>> } => x.r !== null)
    .sort((a, b) => b.r.similarity - a.r.similarity || b.r.votes - a.r.votes || a.m.nome.localeCompare(b.m.nome))
    .slice(0, limit);
}
