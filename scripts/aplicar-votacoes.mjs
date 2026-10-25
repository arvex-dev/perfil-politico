// Ajusta as posições estimadas das figuras com as votações nominais (docs/pesquisa/votacoes/, Câmara e Senado,
// 2015–2026). Regras: ignora votações ambíguas (EXCLUDE) e quase unânimes (minoria < 10%); voto no sentido do polo B
// = +100, do polo A = −100, ausência/abstenção não conta; só ajusta eixos com n ≥ 2 votos, por média ponderada com a
// estimativa anterior (peso 3), para poucas votações de bancada não dominarem. `node scripts/aplicar-votacoes.mjs`
import { readFileSync, writeFileSync } from 'node:fs';
const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const roll = read('../docs/pesquisa/votacoes/votacoes.json');
const calls = Array.isArray(roll) ? roll : roll.votacoes ?? Object.values(roll);
const votes = read('../docs/pesquisa/votacoes/votos.json');
const figPath = new URL('../data/figures.json', import.meta.url);
const figs = JSON.parse(readFileSync(figPath, 'utf8'));

// PL 2630 (urgência): votos misturaram mérito e rito. MPV 1031 (Eletrobras): parte dos pró-mercado (Novo) votou contra
// pelas térmicas e subsídios incluídos no texto, não contra a privatização.
const EXCLUDE = new Set(['C:2310837-8', 'C:2270789-73', 'S:6377']);
const PRIOR = 3;
const usable = calls.filter((c) => c.nominal && !EXCLUDE.has(c.id) && !c.consenso && (c.minoria_pct ?? 100) >= 10);

const report = {};
for (const f of figs.figures) {
  const v = votes[f.name];
  if (!v) continue;
  const byAxis = {};
  for (const c of usable) {
    const vote = v[c.id];
    if (vote !== 'Sim' && vote !== 'Não') continue;
    const towardB = (vote === 'Sim') === (c.voto_sim_equivale_polo === 'B');
    (byAxis[c.axis] ??= []).push(towardB ? 100 : -100);
  }
  const changes = {};
  for (const [axis, list] of Object.entries(byAxis)) {
    if (list.length < 2 || f.coords[axis] == null) continue;
    const byVotes = list.reduce((a, b) => a + b, 0) / list.length;
    const next = Math.round((PRIOR * f.coords[axis] + list.length * byVotes) / (PRIOR + list.length));
    if (next !== f.coords[axis]) changes[axis] = { antes: f.coords[axis], votos: Math.round(byVotes), n: list.length, depois: next };
    f.coords[axis] = next;
  }
  const n = Object.values(byAxis).reduce((a, l) => a + l.length, 0);
  if (n >= 3) {
    f.votes = Object.fromEntries(Object.entries(byAxis).map(([a, l]) => [a, l.length]));
    if (!f.basis.includes('votações nominais')) f.basis += `; ajustado por ${n} votações nominais (Câmara/Senado, 2015–2026)`;
    const src = f.role.includes('Senad') || ['Rodrigo Pacheco', 'Simone Tebet', 'Sergio Moro', 'Damares Alves'].includes(f.name)
      ? 'https://legis.senado.leg.br/dadosabertos/' : 'https://dadosabertos.camara.leg.br/';
    if (!f.sources.includes(src)) f.sources.push(src);
  }
  if (Object.keys(changes).length) report[f.name] = changes;
}
figs.note = figs.note.replace(/ Ajustes por votação.*$/, '') + ' Ajustes por votação nominal: scripts/aplicar-votacoes.mjs (docs/pesquisa/votacoes/).';
writeFileSync(figPath, JSON.stringify(figs, null, 2) + '\n');
writeFileSync(new URL('../docs/pesquisa/votacoes/aplicado.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
for (const [name, ch] of Object.entries(report)) console.log(name.padEnd(20), Object.entries(ch).map(([a, c]) => `${a} ${c.antes}→${c.depois} (votos ${c.votos}, n=${c.n})`).join('; '));
