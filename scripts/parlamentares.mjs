// Gera data/parlamentares.json (compacto, só o que o app usa) a partir de docs/pesquisa/votacoes/parlamentares.json.
// `node scripts/parlamentares.mjs`
import { readFileSync, writeFileSync } from 'node:fs';
const src = JSON.parse(readFileSync(new URL('../docs/pesquisa/votacoes/parlamentares.json', import.meta.url), 'utf8'));
const members = src.members
  .filter((m) => Object.keys(m.axes ?? {}).length > 0)
  .map((m) => ({
    id: m.id,
    nome: m.nome,
    partido: m.partido,
    uf: m.uf,
    casa: m.casa === 'Senado' ? 'S' : 'C',
    url: m.url,
    // [score, n] por eixo
    a: Object.fromEntries(Object.entries(m.axes).map(([k, v]) => [k, [v.score, v.n]])),
  }));
const out = {
  generated_at: src.generated_at,
  rollcalls: src.rollcalls.length,
  axes: [...new Set(src.rollcalls.map((r) => r.axis))],
  members,
};
writeFileSync(new URL('../data/parlamentares.json', import.meta.url), JSON.stringify(out) + '\n');
console.log(members.length, 'parlamentares,', out.rollcalls, 'votações,', out.axes.join(' '), (JSON.stringify(out).length / 1024).toFixed(0) + ' KB');
