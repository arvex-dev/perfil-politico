// Gera docs/TABELAS.md a partir de data/*.json (perguntas, ideologias, figuras, países). `node scripts/tabelas.mjs`
import { readFileSync, writeFileSync } from 'node:fs';
const load = (f) => JSON.parse(readFileSync(new URL(`../data/${f}.json`, import.meta.url)));
const { axes } = load('axes');
const { questions } = load('questions');
const { ideologies } = load('ideologies');
const { figures } = load('figures');
const { countries } = load('countries');
const short = Object.fromEntries(axes.map((a) => [a.id, a.name.slice(0, 4)]));
const esc = (s) => String(s).replace(/\|/g, '\\|');
const coordRow = (c) => axes.map((a) => (c[a.id] ?? '–')).join(' | ');
const sep = `|${axes.map(() => '---:').join('|')}|`;

let md = `# Tabelas (gerado de data/ por scripts/tabelas.mjs, não editar à mão)\n\n`;
md += `Eixos (−100 = polo A, +100 = polo B): ${axes.map((a) => `**${short[a.id]}** ${a.name} (${a.poleA} ↔ ${a.poleB})`).join('; ')}.\n\n`;
md += `## Perguntas (${questions.length})\n\nSentido +1: concordar puxa para o polo B. R = modo rápido.\n\n| id | eixo | sentido | peso | R | afirmação | inspiração |\n|---|---|---:|---:|---|---|---|\n`;
for (const q of questions) md += `| ${q.id} | ${short[q.axis]} | ${q.dir > 0 ? '+1' : '−1'} | ${q.weight} | ${q.quick ? 'R' : ''} | ${esc(q.text)} | ${esc(q.source)} |\n`;
md += `\n## Ideologias (${ideologies.length})\n\n| ideologia | ${axes.map((a) => short[a.id]).join(' | ')} |\n|---|${sep}\n`;
for (const i of ideologies) md += `| ${i.name} | ${coordRow(i.coords)} |\n`;
md += `\n## Figuras (${figures.length}), todas estimadas\n\n| figura | país | grupo | ${axes.map((a) => short[a.id]).join(' | ')} | base |\n|---|---|---|${sep}---|\n`;
for (const f of figures) md += `| ${f.name} | ${f.country} | ${f.group} | ${coordRow(f.coords)} | ${esc(f.basis)}${f.sources.map((s) => ` [fonte](${s})`).join('')} |\n`;
md += `\n## Países (${countries.length}), todos estimados\n\n| país | ${axes.map((a) => short[a.id]).join(' | ')} |\n|---|${sep}\n`;
for (const c of countries) md += `| ${c.name} | ${coordRow(c.coords)} |\n`;
writeFileSync(new URL('../docs/TABELAS.md', import.meta.url), md);
console.log('docs/TABELAS.md', md.length);
