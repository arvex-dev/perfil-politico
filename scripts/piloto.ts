// Piloto simulado: respondentes sintéticos com posições latentes conhecidas respondem o banco de perguntas por um
// modelo de resposta graduada com ruído, viés de concordância e "não sei". Mede o que o piloto real mediria (alfa por
// eixo, correlação item-total, validade discriminante, recuperação das posições, imunidade ao viés de concordância,
// estrutura fatorial, distribuição dos resultados). Verifica a MECÂNICA do teste (chaves, balanceamento, pontuação,
// catálogo de referências) sob um modelo de resposta assumido; não substitui dados de pessoas reais.
// Rodar: pnpm piloto (escreve docs/PILOTO.md e docs/pesquisa/piloto/resultado.json).
import { writeFileSync, mkdirSync } from "node:fs";
import { it } from "vitest";
import { alignment } from "../lib/alignment";
import { axes, figures, ideologies, questions } from "../lib/data";
import { rng } from "../lib/order";
import { type Answer, rank, scoreAxes } from "../lib/scoring";

const N = 2000;
const SEED = 20261025;
const rand = rng(SEED);
const normal = () => {
  const u = Math.max(rand(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
};

// Quanto cada eixo acompanha o fator geral esquerda–direita (sinal: polo B = direita). Valores plausíveis para o Brasil
// (ESEB, LAPOP): economia e costumes fortes; liberdades quase independente; modelo de desenvolvimento fraco.
const LOADING: Record<string, number> = {
  economia: 0.7, distribuicao: 0.7, trabalho: 0.65, costumes: 0.7, religiao: 0.6, seguranca: 0.6, liberdades: 0.15,
  ambiente: 0.55, soberania: 0.35, geopolitica: 0.55, instituicoes: 0.4, diversidade: 0.65,
};
// Eleitorado: 35% esquerda, 30% centro, 35% direita no fator geral.
const GROUPS = [
  { name: "esquerda", share: 0.35, mean: -0.9 },
  { name: "centro", share: 0.3, mean: 0 },
  { name: "direita", share: 0.35, mean: 0.9 },
];
const CUTS = [-1.3, -0.45, 0.45, 1.3];
const NOISE = 0.75;
const ACQ_SD = 0.35;
const DONT_KNOW = 0.05;

interface Person { group: string; g: number; theta: Record<string, number>; acq: number; answers: Record<string, Answer> }

// Discriminação de cada item (desconhecida na vida real): sorteada entre 0,6 e 1,4 para testar robustez.
const discr: Record<string, number> = Object.fromEntries(questions.map((q) => [q.id, 0.6 + 0.8 * rand()]));

function simulate(): Person[] {
  const people: Person[] = [];
  for (let n = 0; n < N; n++) {
    let r = rand();
    const grp = GROUPS.find((x) => (r -= x.share) < 0) ?? GROUPS[2];
    const g = grp.mean + 0.45 * normal();
    const theta: Record<string, number> = {};
    for (const ax of axes) theta[ax.id] = LOADING[ax.id] * g + Math.sqrt(1 - LOADING[ax.id] ** 2) * normal();
    const acq = ACQ_SD * normal();
    const answers: Record<string, Answer> = {};
    for (const q of questions) {
      if (rand() < DONT_KNOW) {
        answers[q.id] = null;
        continue;
      }
      const latent = discr[q.id] * q.dir * theta[q.axis] + acq + NOISE * normal();
      answers[q.id] = (CUTS.filter((c) => latent > c).length - 2) as Answer;
    }
    people.push({ group: grp.name, g, theta, acq, answers });
  }
  return people;
}

const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
function corr(x: number[], y: number[]) {
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < x.length; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
}
const variance = (v: number[]) => { const m = mean(v); return mean(v.map((x) => (x - m) ** 2)); };
// Item com "não sei" vira a média do item (imputação simples só para as estatísticas de consistência).
function keyed(people: Person[], id: string, dir: number) {
  const vals = people.map((p) => p.answers[id]).filter((a): a is Exclude<Answer, null> => a !== null);
  const m = mean(vals);
  return people.map((p) => (p.answers[id] === null ? m : (p.answers[id] as number)) * dir);
}
function alpha(items: number[][]) {
  const k = items.length;
  const total = items[0].map((_, i) => items.reduce((s, it) => s + it[i], 0));
  return (k / (k - 1)) * (1 - items.reduce((s, it) => s + variance(it), 0) / variance(total));
}

// Autovalores de matriz simétrica (Jacobi).
function eigenvalues(A: number[][]): number[] {
  const n = A.length;
  const a = A.map((r) => [...r]);
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] ** 2;
    if (off < 1e-10) break;
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-12) continue;
        const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = a[k][p], akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p][k], aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
        }
      }
  }
  return a.map((r, i) => r[i]).sort((x, y) => y - x);
}
const corrMatrix = (cols: number[][]) => cols.map((x) => cols.map((y) => corr(x, y)));

it("piloto simulado", () => {
  const people = simulate();
  const quick = questions.filter((q) => q.quick);
  const full = people.map((p) => scoreAxes(axes, questions, p.answers));
  const fast = people.map((p) => scoreAxes(axes, quick, p.answers));
  const r2 = (x: number) => Math.round(x * 100) / 100;

  // 1–3. Consistência e validade discriminante.
  const perAxis = axes.map((ax) => {
    const qs = questions.filter((q) => q.axis === ax.id);
    const items = qs.map((q) => keyed(people, q.id, q.dir));
    const scores = full.map((s) => s[ax.id] ?? 0);
    const itemStats = qs.map((q, k) => {
      const rest = items[0].map((_, i) => items.reduce((s, it, j) => (j === k ? s : s + it[i]), 0));
      const own = corr(items[k], rest);
      const otherAxes = axes.filter((o) => o.id !== ax.id).map((o) => Math.abs(corr(items[k], full.map((s) => s[o.id] ?? 0))));
      return { id: q.id, dir: q.dir, itemTotal: r2(own), maxOther: r2(Math.max(...otherAxes)), ok: own > 0.3 && own > Math.max(...otherAxes) };
    });
    const qItems = qs.filter((q) => q.quick).map((q) => keyed(people, q.id, q.dir));
    return {
      axis: ax.id,
      alpha: r2(alpha(items)),
      alphaQuick: r2(alpha(qItems)),
      recovery: r2(corr(people.map((p) => p.theta[ax.id]), scores)),
      recoveryQuick: r2(corr(people.map((p) => p.theta[ax.id]), fast.map((s) => s[ax.id] ?? 0))),
      quickVsFull: r2(corr(scores, fast.map((s) => s[ax.id] ?? 0))),
      acquiescence: r2(corr(people.map((p) => p.acq), scores)),
      items: itemStats,
    };
  });

  // 4. Controle: o mesmo teste só com itens de um sentido (como muitos testes) — quanto a concordância contamina.
  const onlyAgree = axes.map((ax) => {
    const pos = questions.filter((q) => q.axis === ax.id && q.dir === 1);
    return r2(corr(people.map((p) => p.acq), people.map((p) => scoreAxes(axes, pos, p.answers)[ax.id] ?? 0)));
  });

  // 5. Estrutura: autovalores da matriz de correlação dos 72 itens × análise paralela (dados aleatórios do mesmo tamanho).
  const cols = questions.map((q) => keyed(people, q.id, q.dir));
  const eig = eigenvalues(corrMatrix(cols));
  const randCols = questions.map(() => people.map(() => normal()));
  const eigRand = eigenvalues(corrMatrix(randCols));
  const factors = eig.filter((e, i) => e > eigRand[i]).length;

  // 6. Resultados: alinhamento × grupo verdadeiro, ideologias, figuras, afinidade.
  const labels: Record<string, Record<string, number>> = {};
  const ideologyCount: Record<string, number> = {};
  const figureSims: number[] = [];
  let sideOk = 0, sideN = 0;
  full.forEach((s, i) => {
    const al = alignment(s);
    const grp = people[i].group;
    labels[grp] ??= {};
    labels[grp][al.label] = (labels[grp][al.label] ?? 0) + 1;
    const top = rank(s, ideologies)[0];
    ideologyCount[top.target.name] = (ideologyCount[top.target.name] ?? 0) + 1;
    figureSims.push(rank(s, figures)[0].similarity);
    if (grp !== "centro") {
      sideN++;
      if ((grp === "esquerda" && (al.overall ?? 0) < 0) || (grp === "direita" && (al.overall ?? 0) > 0)) sideOk++;
    }
  });
  const sorted = [...figureSims].sort((a, b) => a - b);
  const pct = (p: number) => sorted[Math.floor(p * (sorted.length - 1))];
  const ideologyDist = Object.entries(ideologyCount).sort((a, b) => b[1] - a[1]);

  const result = {
    config: { N, SEED, LOADING, GROUPS, CUTS, NOISE, ACQ_SD, DONT_KNOW, discr: "uniforme 0,6–1,4 por item" },
    perAxis,
    onlyAgreeAcquiescence: Object.fromEntries(axes.map((a, i) => [a.id, onlyAgree[i]])),
    eigenTop: eig.slice(0, 15).map(r2),
    eigRandTop: eigRand.slice(0, 15).map(r2),
    factorsParallel: factors,
    alignmentByGroup: labels,
    sideAccuracy: r2(sideOk / sideN),
    ideologyDistribution: ideologyDist,
    topFigureSimilarity: { p10: pct(0.1), median: pct(0.5), p90: pct(0.9), over90: figureSims.filter((x) => x > 90).length },
  };
  mkdirSync("docs/pesquisa/piloto", { recursive: true });
  writeFileSync("docs/pesquisa/piloto/resultado.json", JSON.stringify(result, null, 2) + "\n");

  const flagged = perAxis.flatMap((a) => a.items.filter((x) => !x.ok).map((x) => `${x.id} (item-total ${x.itemTotal}, outro eixo ${x.maxOther})`));
  const row = (a: (typeof perAxis)[number]) =>
    `| ${axes.find((x) => x.id === a.axis)!.name} | ${a.alpha} | ${a.alphaQuick} | ${a.recovery} | ${a.recoveryQuick} | ${a.quickVsFull} | ${a.acquiescence} | ${result.onlyAgreeAcquiescence[a.axis]} |`;
  const md = `# Piloto simulado (gerado por \`pnpm piloto\`, não editar à mão)

${N} respondentes sintéticos, semente ${SEED}. Cada pessoa tem uma posição latente em cada eixo (parte comum
esquerda–direita, parte própria do eixo), um viés de concordância (dp ${ACQ_SD}) e ${DONT_KNOW * 100}% de "não sei".
Cada item tem discriminação sorteada entre 0,6 e 1,4 e ruído (dp ${NOISE}). **O que isto prova:** que as chaves (sentido
dos itens), o balanceamento, a pontuação e o catálogo funcionam como deveriam se as pessoas responderem de forma
coerente. **O que não prova:** que as perguntas reais medem o que pretendem; isso só o piloto com pessoas responde.

## Por eixo

| Eixo | α (6 itens) | α rápido (2) | recupera posição | recupera (rápido) | rápido × completo | r com viés de concordância | idem, só itens "a favor" |
|---|---:|---:|---:|---:|---:|---:|---:|
${perAxis.map(row).join("\n")}

- α ≥ 0,70 é a meta para o completo; o rápido, com 2 itens, fica naturalmente abaixo.
- "r com viés de concordância" perto de 0 mostra que o balanceamento (3 itens em cada sentido) neutraliza quem concorda
  com tudo; a última coluna é o mesmo eixo pontuado só com os 3 itens "a favor", como muitos testes fazem.

## Itens

Todo item deve correlacionar mais com o total do próprio eixo do que com qualquer outro eixo, e acima de 0,30.
${flagged.length ? `Itens fora disso: ${flagged.join("; ")}.` : "**Todos os 72 itens passam** (nenhuma chave invertida, nenhum item mais alinhado a outro eixo)."}

## Estrutura

Análise paralela: **${factors} fatores** acima do acaso (autovalores ${result.eigenTop.slice(0, 13).join(", ")} …;
aleatórios ${result.eigRandTop.slice(0, 3).join(", ")} …). O primeiro fator grande é o esquerda–direita comum; os demais
correspondem aos eixos.

## Resultados

- Lado correto (esquerda/direita verdadeira × sinal do alinhamento): **${Math.round(result.sideAccuracy * 100)}%**.
- Alinhamento por grupo verdadeiro: ${Object.entries(labels).map(([g, c]) => `${g}: ${Object.entries(c).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${Math.round((n / Object.values(c).reduce((x, y) => x + y, 0)) * 100)}%`).join(", ")}`).join(" · ")}.
- Correntes no topo: ${ideologyDist.length} de ${ideologies.length} aparecem; as mais frequentes: ${ideologyDist.slice(0, 6).map(([n, c]) => `${n} ${Math.round((c / N) * 100)}%`).join(", ")}.
- Afinidade com a figura mais próxima: p10 ${result.topFigureSimilarity.p10}%, mediana ${result.topFigureSimilarity.median}%, p90 ${result.topFigureSimilarity.p90}%; acima de 90%: ${result.topFigureSimilarity.over90} de ${N}.
`;
  writeFileSync("docs/PILOTO.md", md);
  console.log(md);
}, 120_000);
