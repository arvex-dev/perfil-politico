// Copia as fontes verificadas (docs/pesquisa/factcheck/fontes.json) para data/questions.json, campo `refs`:
// até 4 por pergunta, primárias primeiro. `node scripts/merge-fontes.mjs`
import { readFileSync, writeFileSync } from 'node:fs';
const qp = new URL('../data/questions.json', import.meta.url);
const j = JSON.parse(readFileSync(qp, 'utf8'));
const { items } = JSON.parse(readFileSync(new URL('../docs/pesquisa/factcheck/fontes.json', import.meta.url), 'utf8'));
const order = { primaria: 0, secundaria: 1, academica: 2 };
for (const q of j.questions) {
  const refs = (items[q.id]?.refs ?? []).filter((r) => r.verified === 'aberta' && /^https?:\/\//.test(r.url));
  const seen = new Set();
  q.refs = refs
    .sort((a, b) => (order[a.kind] ?? 3) - (order[b.kind] ?? 3))
    .filter((r) => !seen.has(r.url) && seen.add(r.url))
    .slice(0, 4)
    .map(({ publisher, title, url }) => ({ publisher, title, url }));
}
const lines = j.questions.map((q) => '    ' + JSON.stringify(q).replace(/":/g, '": ').replace(/,"/g, ', "'));
writeFileSync(qp, `{\n  "version": ${j.version},\n  "note": ${JSON.stringify(j.note)},\n  "questions": [\n${lines.join(',\n')}\n  ]\n}\n`);
console.log(j.questions.map((q) => q.refs.length).reduce((m, n) => ((m[n] = (m[n] ?? 0) + 1), m), {}));
