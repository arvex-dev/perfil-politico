// Reimplementa o calculo de 4 testes politicos e responde com 6 personas.
// Uso: node simulate.mjs   (le ../<teste>/*.json e ./mapeamentos/*.json; escreve ../resultados/*.json)
import fs from 'node:fs'; import path from 'node:path';
const D = path.resolve(import.meta.dirname, '..');
const J = (...p) => JSON.parse(fs.readFileSync(path.join(D, ...p), 'utf8'));
const M = (n) => J('scripts', 'mapeamentos', n + '.json');
const { stances, personas } = J('scripts', 'personas.json');
const round1 = x => Math.round(x * 10) / 10;

// ---------- persona -> atitude --------------------------------------------------
function parseTag(tag) {
  const extreme = tag.endsWith('~'); if (extreme) tag = tag.slice(0, -1);
  return { extreme, terms: tag.split(',').map(t => ({ code: t.slice(0, -1), sign: t.slice(-1) === '+' ? 1 : -1 })) };
}
function attitude(P, tag) { // -1..1: quanto o persona tende a CONCORDAR (antes de extremidade)
  const { extreme, terms } = parseTag(tag);
  const a = terms.reduce((s, t) => s + t.sign * (t.code === 'yes' ? 1 : P[t.code] ?? (() => { throw new Error('stance? ' + t.code); })()), 0) / terms.length;
  return { a, m: extreme ? 0.55 : 0.1 };
}
// resposta de 5 pontos: +2 CT, +1 C, 0 N, -1 D, -2 DT
const ans5 = v => v >= 0.45 ? 2 : v >= 0.15 ? 1 : v > -0.15 ? 0 : v > -0.45 ? -1 : -2;
const LABEL5 = { 2: 'Concordo totalmente', 1: 'Concordo', 0: 'Neutro', '-1': 'Discordo', '-2': 'Discordo totalmente' };
const answerFrom = (P, tag, m0) => { const { a, m } = attitude(P, tag); return ans5(a - (m0 ?? m)); };

// ======================= 12 AXES (RomanCypherpunk) =================================
const T12 = { axes: J('12axes', 'axes.json'), q: J('12axes', 'questions.json'), arch: J('12axes', 'archetype-questions.json'),
  ideo: J('12axes', 'ideologies.json'), ctry: J('12axes', 'countries.json'), pers: J('12axes', 'personalities.json'), map: M('12axes') };
const AX12 = T12.axes.map(a => a.id);
const towards = a => (a + 2) / 4; // 1, .75, .5, .25, 0
function intensity(d) { return d < 7.5 ? 'Equilibrado' : d < 22.5 ? 'Inclinado' : d < 37.5 ? 'Forte' : 'Muito forte'; }
function compat12(u, t) { // ProfileMatchScorer.compatibility, 12 eixos
  const ids = AX12, C = 50;
  let axisSim = 0;
  for (const id of ids) {
    const uv = u[id] ?? C, tv = t[id] ?? C, diff = Math.abs(uv - tv);
    let s = Math.max(0, 1 - (diff / 50) ** 2);
    if ((uv - C) * (tv - C) < 0) s *= 1 - 0.45 * Math.tanh(Math.abs(uv - C) / 25) * Math.tanh(Math.abs(tv - C) / 25);
    axisSim += s;
  }
  axisSim = 100 * axisSim / ids.length;
  let dot = 0, un = 0, tn = 0;
  for (const id of ids) { const x = (u[id] ?? C) - C, y = (t[id] ?? C) - C; dot += x * y; un += x * x; tn += y * y; }
  const aug = ids.length * 64;
  const dir = 50 + 50 * ((dot + aug) / Math.sqrt((un + aug) * (tn + aug)));
  const avg = v => ids.reduce((s, id) => s + Math.abs((v[id] ?? C) - C), 0) / ids.length;
  const mag = 100 - 2 * Math.abs(avg(u) - avg(t));
  let maxd = 0; for (const id of ids) maxd = Math.max(maxd, Math.abs((u[id] ?? C) - (t[id] ?? C)));
  const out = 100 * Math.max(0, 1 - (maxd / 100) ** 2.5);
  return round1(Math.max(0, Math.min(100, 0.42 * axisSim + 0.33 * dir + 0.18 * mag + 0.07 * out)));
}
function score12(answers /* {qid: -2..2} */, archChoices) {
  const acc = Object.fromEntries(AX12.map(a => [a, { t: 0, w: 0 }]));
  for (const q of T12.q) { if (!(q.id in answers)) continue; const t = towards(answers[q.id]); acc[q.axisId].t += (q.agreePole === 'LEFT' ? t : 1 - t) * q.weight; acc[q.axisId].w += q.weight; }
  for (const [qid, oid] of Object.entries(archChoices || {})) {
    const o = T12.arch.find(x => x.id === qid).options.find(x => x.id === oid);
    for (const [ax, lp] of Object.entries(o.effects)) { acc[ax].t += lp / 100; acc[ax].w += 1; }
  }
  const axes = T12.axes.map(a => { const raw = acc[a.id].w ? acc[a.id].t / acc[a.id].w * 100 : 50; const left = round1(Math.max(0, Math.min(100, raw)));
    return { axis: a.id, left: a.leftPole, right: a.rightPole, leftPercent: left, rightPercent: round1(100 - left), dominant: left >= 100 - left ? a.leftPole : a.rightPole, intensity: intensity(Math.abs(left - 50)) }; });
  const u = Object.fromEntries(axes.map(a => [a.axis, a.leftPercent]));
  const rank = (cat, n) => cat.filter(x => x.vector).map(x => ({ id: x.id, name: x.name, category: x.category, compat: compat12(u, x.vector) }))
    .sort((a, b) => b.compat - a.compat || a.name.localeCompare(b.name)).slice(0, n);
  const allc = cat => cat.filter(x => x.vector).map(x => compat12(u, x.vector));
  const stat = arr => ({ min: Math.min(...arr), median: arr.sort((a, b) => a - b)[arr.length >> 1], max: Math.max(...arr) });
  const top10 = rank(T12.ideo, 10), fam10 = {}; top10.forEach(x => fam10[x.category] = (fam10[x.category] || 0) + 1);
  return { axes, ideologies: rank(T12.ideo, 4), ideologiesTop10: top10.map(x => `${x.name} [${x.category}] ${x.compat}`), familiasTop10: fam10, countries: rank(T12.ctry, 3), personalities: rank(T12.pers, 8),
    compatSpread: { ideologies: stat(allc(T12.ideo)), countries: stat(allc(T12.ctry)), personalities: stat(allc(T12.pers)) } };
}
function run12(P) {
  const answers = {};
  for (const q of T12.q) { const idx = +q.id.split('_')[1] - 1; answers[q.id] = answerFrom(P, T12.map[q.axisId][idx]); }
  const pre = score12(answers, {}), val = Object.fromEntries(pre.axes.map(a => [a.axis, a.leftPercent]));
  const arch = {};
  for (const aq of T12.arch) { let best = null, bd = 1e9; for (const o of aq.options) { const es = Object.entries(o.effects); const d = es.reduce((s, [ax, v]) => s + Math.abs(v - val[ax]), 0) / es.length; if (d < bd) { bd = d; best = o.id; } } arch[aq.id] = best; }
  return { answers, archetype: arch, result: score12(answers, arch) };
}

// ======================= 8 VALUES ===================================================
const T8 = { q: J('8values', 'questions.json'), ideo: J('8values', 'ideologies.json'), map: M('8values').tags };
const mult8 = a => a / 2; // CT 1, C .5, N 0, D -.5, DT -1
const lab8 = { econ: ['Communist', 'Socialist', 'Social', 'Centrist', 'Market', 'Capitalist', 'Laissez-Faire'], dipl: ['Cosmopolitan', 'Internationalist', 'Peaceful', 'Balanced', 'Patriotic', 'Nationalist', 'Chauvinist'],
  govt: ['Anarchist', 'Libertarian', 'Liberal', 'Moderate', 'Statist', 'Authoritarian', 'Totalitarian'], scty: ['Revolutionary', 'Very Progressive', 'Progressive', 'Neutral', 'Traditional', 'Very Traditional', 'Reactionary'] };
const label8 = (v, a) => v > 100 ? '' : v > 90 ? a[0] : v > 75 ? a[1] : v > 60 ? a[2] : v >= 40 ? a[3] : v >= 25 ? a[4] : v >= 10 ? a[5] : v >= 0 ? a[6] : '';
function match8(e, d, g, s, ideos) { // distancia de results.html
  let best = '', bd = Infinity; const all = [];
  for (const i of ideos) { const dist = Math.abs(i.stats.econ - e) ** 2 + Math.abs(i.stats.govt - g) ** 2 + Math.abs(i.stats.dipl - d) ** 1.73856063 + Math.abs(i.stats.scty - s) ** 1.73856063; all.push([i.name, dist]); if (dist < bd) { bd = dist; best = i.name; } }
  return { best, ranking: all.sort((a, b) => a[1] - b[1]).slice(0, 3).map(([n, x]) => ({ name: n, dist: round1(x) })) };
}
function score8(answers) {
  const sum = { econ: 0, dipl: 0, govt: 0, scty: 0 }, max = { ...sum };
  for (const q of T8.q) for (const k in sum) { max[k] += Math.abs(q.effect[k]); sum[k] += mult8(answers[q.id]) * q.effect[k]; }
  const c = k => +(100 * (max[k] + sum[k]) / (2 * max[k])).toFixed(1);
  const equality = c('econ'), peace = c('dipl'), liberty = c('govt'), progress = c('scty');
  return { max, raw: sum, equality, wealth: round1(100 - equality), peace, might: round1(100 - peace), liberty, authority: round1(100 - liberty), progress, tradition: round1(100 - progress),
    labels: { econ: label8(equality, lab8.econ), dipl: label8(peace, lab8.dipl), govt: label8(liberty, lab8.govt), scty: label8(progress, lab8.scty) }, ideology: match8(equality, peace, liberty, progress, T8.ideo) };
}
function run8(P) { const a = {}; for (const q of T8.q) a[q.id] = answerFrom(P, T8.map[q.id]); return { answers: a, result: score8(a) }; }

// ======================= 9 AXES =====================================================
const T9 = { q: J('9axes', 'questions.json'), ax: J('9axes', 'axes.json'), ideo: J('9axes', 'ideologies.json'), map: M('9axes') };
const lab9L = ['Federal', 'Democratic', 'Globalist', 'Militarist', 'Security', 'Equality', 'Secular', 'Progressive', 'Assimilationist'];
const lab9R = ['Unitary', 'Authoritarian', 'Isolationist', 'Pacifist', 'Freedom', 'Markets', 'Religious', 'Traditional', 'Multiculturalist'];
const label9 = (v, a) => v >= 90 ? 'Fanatic ' + lab9L[a] : v >= 80 ? 'Extreme ' + lab9L[a] : v >= 70 ? lab9L[a] : v >= 60 ? 'Moderate ' + lab9L[a] : v > 40 ? 'Neutral' : v > 30 ? 'Moderate ' + lab9R[a] : v > 20 ? lab9R[a] : v > 10 ? 'Extreme ' + lab9R[a] : 'Fanatic ' + lab9R[a];
function ans9(P, q) {
  const ext = q.level < 4 ? 4 - q.level : q.level - 3, m = (ext - 1) * 0.2;
  const ov = T9.map.overrides[`${q.axis}.${q.level}.${q.id.split('.')[2]}`];
  const a = ov ? attitude(P, ov).a : attitude(P, T9.map.axisBase[q.axis]).a * q.sign;
  return ans5(a - m);
}
function score9(sel, answers, factor) { // sel: lista de questoes; scores[ax] += mult*sign ; calc = 50 + factor*score
  const s = Array(9).fill(0); for (const q of sel) s[q.axis] += answers[q.id] * q.sign;
  const v = s.map(x => 50 + factor * x), [a, b, c, , , f, , h] = v;
  const pick = ideos => { let best = '', bd = Infinity; for (const i of ideos) { const d = Math.abs(i.stats.econ - f) ** 2 + Math.abs(i.stats.govt - b) ** 2 + Math.abs(i.stats.dipl - c) ** 1.73856063 + Math.abs(i.stats.scty - h) ** 1.73856063; if (d < bd) { bd = d; best = i.name; } } return best; };
  return { raw: s, axes: v.map((x, i) => ({ axis: `${lab9L[i]}|${lab9R[i]}`, leftPercent: x, label: label9(x, i) })), ideology: pick(T9.ideo), n: sel.length };
}
function run9(P) {
  const answers = {}; for (const q of T9.q) answers[q.id] = ans9(P, q);
  const std = c => { const lv = c ? [1, 2, 3, 5, 7] : [7, 6, 5, 3, 1]; return T9.q.filter(q => lv.includes(q.level) && q.id.endsWith('.0')); };
  return { answers, result: { full: score9(T9.q, answers, 1), standard_c1: score9(std(true), answers, 5), standard_c0: score9(std(false), answers, 5) } };
}

// ======================= SAPPLYVALUES ===============================================
const TS = { q: J('sapplyvalues', 'questions.json'), map: M('sapplyvalues') };
function tagS(q) { const ov = TS.map.overrides[q.id]; if (ov) return ov; const [k, e] = Object.entries(q.effects)[0]; const base = TS.map.base[k]; return e > 0 ? base : base.split(',').map(t => t.slice(0, -1) + (t.slice(-1) === '+' ? '-' : '+')).join(','); }
function runS(P) {
  const answers = {}, mx = { right: 0, auth: 0, prog: 0 }, sc = { right: 0, auth: 0, prog: 0 };
  for (const q of TS.q) { const v = ans5(attitude(P, tagS(q)).a - 0.1) / 2; answers[q.id] = v; for (const [k, e] of Object.entries(q.effects)) { mx[k] += Math.abs(e); sc[k] += v * e; } }
  const pct = Object.fromEntries(Object.keys(mx).map(k => [k, +(Math.round(sc[k] * 10 / mx[k] * 100) / 100).toFixed(2)]));
  return { answers, result: { ...pct, quadrante: `${pct.right >= 0 ? 'Direita' : 'Esquerda'} / ${pct.auth >= 0 ? 'Autoritario' : 'Libertario'} / ${pct.prog >= 0 ? 'Progressista' : 'Conservador'}` } };
}

export { score8, score9, score12, match8, T8, T9, TS, T12, run12, run8, run9, runS, personas, ans5 };
// ======================= execucao ===================================================
if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = { '12axes': run12, '8values': run8, '9axes': run9, sapplyvalues: runS };
  const summary = {};
  for (const [tn, fn] of Object.entries(tests)) for (const [pid, P] of Object.entries(personas)) {
    const out = fn(P);
    const labelled = Object.fromEntries(Object.entries(out.answers).map(([k, v]) => [k, tn === 'sapplyvalues' ? v : v]));
    fs.writeFileSync(path.join(D, 'resultados', `${tn}-${pid}.json`), JSON.stringify({ test: tn, persona: pid, personaNome: P.nome, escala_respostas: tn === '8values' || tn === '12axes' || tn === '9axes' ? '+2 CT, +1 C, 0 N, -1 D, -2 DT (conversao especifica do teste no calculo)' : '1, .5, 0, -.5, -1', answers: labelled, archetype: out.archetype, result: out.result }, null, 1));
    (summary[tn] ??= {})[pid] = tn === '12axes' ? { axes: Object.fromEntries(out.result.axes.map(a => [a.axis, a.leftPercent])), ideologies: out.result.ideologies.map(x => `${x.name} (${x.compat})`), countries: out.result.countries.map(x => `${x.name} (${x.compat})`), personalities: out.result.personalities.slice(0, 3).map(x => `${x.name} (${x.compat})`), compatSpread: out.result.compatSpread }
      : tn === '8values' ? { econ: out.result.equality, dipl: out.result.peace, govt: out.result.liberty, scty: out.result.progress, ideology: out.result.ideology.best, labels: out.result.labels }
      : tn === '9axes' ? { full: out.result.full.axes.map(a => a.leftPercent), std1: out.result.standard_c1.axes.map(a => a.leftPercent), std0: out.result.standard_c0.axes.map(a => a.leftPercent), ideology: { full: out.result.full.ideology, std1: out.result.standard_c1.ideology, std0: out.result.standard_c0.ideology } }
      : out.result;
  }
  fs.writeFileSync(path.join(D, 'resultados', '_resumo.json'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 0).slice(0, 6000));
}
