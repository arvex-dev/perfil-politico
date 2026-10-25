// Sorteio das perguntas de cada sessão, a partir de uma semente (guardada no navegador, para um recarregamento manter
// a mesma ordem). Completo: as 72, em ordem aleatória. Rápido: por eixo, 1 pergunta de cada sentido sorteada entre as
// 3 disponíveis (o equilíbrio contra o viés de concordância se mantém). Nos dois, nunca duas seguidas do mesmo eixo.
import type { Mode, Question } from './scoring';

/** Gerador determinístico (mulberry32): mesma semente, mesma sequência. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], rand: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function selectQuestions<T extends Question>(all: T[], mode: Mode, rand: () => number): T[] {
  if (mode === 'completo') return all;
  const out: T[] = [];
  for (const axis of [...new Set(all.map((q) => q.axis))]) {
    for (const dir of [1, -1] as const) {
      const pool = all.filter((q) => q.axis === axis && q.dir === dir);
      out.push(pool[Math.floor(rand() * pool.length)]);
    }
  }
  return out;
}

/**
 * Embaralha sem repetir eixo em seguida: a cada passo sorteia entre os eixos com perguntas restantes (exceto o
 * anterior), com peso pelo que resta de cada um, para nenhum eixo sobrar acumulado no fim.
 */
export function arrange<T extends Question>(qs: T[], rand: () => number): T[] {
  const byAxis = new Map<string, T[]>();
  for (const q of shuffle(qs, rand)) byAxis.set(q.axis, [...(byAxis.get(q.axis) ?? []), q]);
  const out: T[] = [];
  let prev = '';
  while (out.length < qs.length) {
    const left = [...byAxis.entries()].filter(([, l]) => l.length > 0);
    // Se um eixo tem mais da metade do que falta, ele precisa sair agora para não acabar em sequência.
    const remaining = qs.length - out.length;
    const forced = left.find(([a, l]) => a !== prev && l.length * 2 > remaining);
    const options = forced ? [forced] : left.filter(([a]) => a !== prev);
    const pool = options.length ? options : left;
    const total = pool.reduce((n, [, l]) => n + l.length, 0);
    let r = rand() * total;
    let pick = pool[0];
    for (const o of pool) {
      r -= o[1].length;
      if (r < 0) {
        pick = o;
        break;
      }
    }
    out.push(pick[1].shift()!);
    prev = pick[0];
  }
  return out;
}

export function sessionQuestions<T extends Question>(all: T[], mode: Mode, seed: number): T[] {
  const rand = rng(seed);
  return arrange(selectQuestions(all, mode, rand), rand);
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
