// Diagnostico de vies de pontuacao: aquiescencia (responder tudo igual) e populacao sintetica (stances sorteados com semente fixa).
import fs from 'node:fs'; import path from 'node:path';
import { score8, score9, score12, T8, T9, TS, T12, run12, run8, run9, runS, personas } from './simulate.mjs';
const D = path.resolve(import.meta.dirname, '..'); const out = {};
// 1) aquiescencia: todas as respostas "Concordo totalmente" (+2) / "Discordo totalmente" (-2) / "Neutro" (0)
for (const [nome, v] of [['concordo_tudo', 2], ['discordo_tudo', -2], ['neutro_tudo', 0]]) {
  const a12 = Object.fromEntries(T12.q.map(q => [q.id, v])); const r12 = score12(a12, {});
  const a8 = Object.fromEntries(T8.q.map(q => [q.id, v])); const r8 = score8(a8);
  const a9 = Object.fromEntries(T9.q.map(q => [q.id, v])); const std = score9(T9.q.filter(q => [1, 2, 3, 5, 7].includes(q.level) && q.id.endsWith('.0')), a9, 5);
  const s = { right: 0, auth: 0, prog: 0 }, mx = { ...s }; for (const q of TS.q) for (const [k, e] of Object.entries(q.effects)) { s[k] += v / 2 * e; mx[k] += Math.abs(e); }
  out[nome] = { '12axes': r12.axes.map(a => a.leftPercent), '8values': { e: r8.equality, d: r8.peace, g: r8.liberty, s: r8.progress, ideologia: r8.ideology.best }, '9axes_padrao_c1': std.axes.map(a => a.leftPercent), sapplyvalues: Object.fromEntries(Object.keys(s).map(k => [k, +(s[k] * 10 / mx[k]).toFixed(2)])) };
}
// 2) balanceamento das perguntas de 8values por eixo (soma dos efeitos positivos vs negativos)
out.balanco8values = Object.fromEntries(['econ', 'dipl', 'govt', 'scty'].map(k => [k, { positivos: T8.q.filter(q => q.effect[k] > 0).length, negativos: T8.q.filter(q => q.effect[k] < 0).length, somaPos: T8.q.reduce((s, q) => s + Math.max(0, q.effect[k]), 0), somaNeg: T8.q.reduce((s, q) => s + Math.min(0, q.effect[k]), 0) }]));
// 3) populacao sintetica: 300 perfis com stances ~ U[-1,1] (semente fixa)
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const codes = Object.keys(Object.values(personas)[0]).filter(k => k !== 'nome');
const top = [], fam = {}, ideo8 = {}, ideo9 = {}, famOf = Object.fromEntries(T12.ideo.map(i => [i.id, i.category]));
const lr8 = [];
for (let i = 0; i < 300; i++) { const P = Object.fromEntries(codes.map(c => [c, rnd() * 2 - 1]));
  const r = run12(P).result; top.push(r.ideologies[0].compat); const f = famOf[r.ideologies[0].id]; fam[f] = (fam[f] || 0) + 1;
  const r8 = run8(P).result; ideo8[r8.ideology.best] = (ideo8[r8.ideology.best] || 0) + 1; }
top.sort((a, b) => a - b);
out.populacaoSintetica = { n: 300, compat_top1_ideologia_12axes: { min: top[0], p10: top[30], mediana: top[150], p90: top[270], max: top[299] }, familias_top1_12axes: fam, top5_ideologias_8values: Object.entries(ideo8).sort((a, b) => b[1] - a[1]).slice(0, 6) };
fs.writeFileSync(path.join(D, 'resultados', '_vieses.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
