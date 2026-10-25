// Extrai dados dos repositórios clonados (somente leitura/parse; NÃO executa código dos downloads).
// Uso: node extract.mjs <dir_src>
import fs from 'node:fs'; import path from 'node:path';
const SRC = process.argv[2]; const OUT = path.resolve(import.meta.dirname, '..');
const rd = (...p) => fs.readFileSync(path.join(SRC, ...p), 'utf8');
const wr = (t, f, o) => fs.writeFileSync(path.join(OUT, t, f), JSON.stringify(o, null, 1));
const rj = (...p) => JSON.parse(rd(...p));
// converte "var = [ ... ]" (JS literal "quase JSON") em JSON sem avaliar código
function jsLiteral(txt) {
  let s = txt.replace(/\/\/[^\n]*/g, '').replace(/^[\s\S]*?=\s*(?=[\[{])/, '');
  s = s.replace(/;\s*$/, '').trim().replace(/,(\s*[\]}])/g, '$1');
  s = s.replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":');
  return JSON.parse(s);
}
// ---------- 12axes (RomanCypherpunk/12axes)
{
  const D = 'src/12axes/backend/src/main/resources/data';
  const axes = rj(D, 'axes.json'), pool = rj(D, 'questions-pool.json'), arch = rj(D, 'archetype-questions.json');
  wr('12axes', 'axes.json', axes); wr('12axes', 'questions.json', pool); wr('12axes', 'archetype-questions.json', arch);
  const merge = (meta, prof, key, keep) => {
    const pv = Object.fromEntries(rj(D, prof).map(p => [p[key], p.vector]));
    return rj(D, meta).map(m => ({ ...Object.fromEntries(keep.map(k => [k, m[k]])), vector: pv[m.id] ?? null }));
  };
  wr('12axes', 'ideologies.json', merge('ideologies.json', 'ideology-profiles.json', 'ideologyId', ['id', 'name', 'category']));
  wr('12axes', 'countries.json', merge('countries.json', 'countries-profiles.json', 'countryId', ['id', 'name', 'category', 'historical', 'period']));
  wr('12axes', 'personalities.json', merge('personalities.json', 'personality-profiles.json', 'personalityId', ['id', 'name', 'role', 'category', 'lifespan', 'description']));
  wr('12axes', 'source.json', { repo: 'https://github.com/RomanCypherpunk/12axes', commit: 'd77c8f6f861764abff9e711a1fe11fd762d517fe', site: 'https://12axes.vercel.app', files: ['backend/src/main/resources/data/*.json', 'backend/src/main/java/com/twelveaxes/service/ScoringService.java', 'backend/src/main/java/com/twelveaxes/service/ProfileMatchScorer.java'], license: 'ver LICENSE do repo' });
}
// ---------- 8values
{
  const q = jsLiteral(rd('src/8values.github.io/questions.js')), id = jsLiteral(rd('src/8values.github.io/ideologies.js'));
  wr('8values', 'questions.json', q.map((x, i) => ({ id: i + 1, text: x.question, effect: x.effect })));
  wr('8values', 'ideologies.json', id);
  wr('8values', 'source.json', { repo: 'https://github.com/8values/8values.github.io', commit: '3971ed8bc0c3dda18f9b001013327f382343b74f', files: ['questions.js', 'ideologies.js', 'quiz.html (calc_score)', 'results.html (matching)'] });
}
// ---------- 9axes
{
  const q = jsLiteral(rd('src/9axes/questions.js')), id = jsLiteral(rd('src/9axes/ideologies.js'));
  const axes = ['Federal|Unitary', 'Democratic|Authoritarian', 'Globalist|Isolationist', 'Militarist|Pacifist', 'Security|Freedom', 'Equality|Markets', 'Secular|Religious', 'Progressive|Traditional', 'Assimilationist|Multiculturalist'];
  const flat = [];
  q.forEach((ax, a) => ax.forEach((lvl, l) => lvl.forEach((t, k) => flat.push({ id: `${a}.${l}.${k}`, axis: a, axisName: axes[a], level: l, sign: l < 4 ? 1 : -1, text: t }))));
  wr('9axes', 'questions.json', flat);
  wr('9axes', 'axes.json', axes.map(s => ({ left: s.split('|')[0], right: s.split('|')[1] })));
  wr('9axes', 'ideologies.json', id);
  wr('9axes', 'source.json', { repo: 'https://github.com/9axes/9axes.github.io', commit: '7704f107eac4d812e21ca7d747a35217be97edb0', site: 'https://9axes.github.io', note: 'quiz padrao: 5 q/eixo sorteadas dos niveis [1,2,3,5,7] ou espelho [7,6,5,3,1]; fullquiz = todas' });
}
// ---------- SapplyValues
{
  const q = jsLiteral(rd('src/SapplyValues_SapplyValues.github.io/questions.js'));
  wr('sapplyvalues', 'questions.json', q);
  wr('sapplyvalues', 'source.json', { repo: 'https://github.com/SapplyValues/SapplyValues.github.io', commit: 'cf2554cb77424d42bc6cea6ad59861564e0a653f', files: ['questions.js', 'quiz.html (percentageCalculation)', 'results.html'] });
}
console.log('ok');
