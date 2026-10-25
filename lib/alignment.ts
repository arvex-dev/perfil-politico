// Alinhamento político resumido (esquerda–direita), derivado dos 12 eixos. Usa só os eixos cujo polo B corresponde,
// de forma consensual na literatura brasileira (ESEB, Bolognesi et al. 2023), à direita: os econômicos e os de
// costumes. Liberdades, instituições, ambiente, modelo de desenvolvimento e política externa ficam de fora porque
// dividem a esquerda e a direita por dentro (libertários × autoritários, antissistema dos dois lados).
import type { Coords, Scores } from './scoring';

export const ECONOMIC_AXES = ['economia', 'distribuicao', 'trabalho'] as const;
export const CULTURAL_AXES = ['costumes', 'religiao', 'seguranca', 'diversidade'] as const;

export interface Alignment {
  /** Econômico: −100 esquerda … +100 direita. null sem dados. */
  economic: number | null;
  /** Costumes: −100 progressista … +100 conservador. */
  cultural: number | null;
  /** Geral: média dos 7 eixos, −100 esquerda … +100 direita. */
  overall: number | null;
  label: string;
  detail: string;
}

function mean(values: (number | null | undefined)[]): number | null {
  const v = values.filter((x): x is number => typeof x === 'number');
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
}

export function leftRightLabel(v: number): string {
  if (v <= -45) return 'Esquerda';
  if (v <= -15) return 'Centro-esquerda';
  if (v < 15) return 'Centro';
  if (v < 45) return 'Centro-direita';
  return 'Direita';
}

function side(v: number, neg: string, pos: string): string {
  const a = Math.abs(v);
  if (a < 15) return 'no centro';
  return `${a >= 45 ? '' : 'moderadamente '}${v < 0 ? neg : pos}`;
}

export function alignment(scores: Scores | Coords): Alignment {
  const economic = mean(ECONOMIC_AXES.map((k) => scores[k]));
  const cultural = mean(CULTURAL_AXES.map((k) => scores[k]));
  const overall = mean([...ECONOMIC_AXES, ...CULTURAL_AXES].map((k) => scores[k]));
  if (overall === null) return { economic, cultural, overall, label: 'Sem dados', detail: '' };
  let label = leftRightLabel(overall);
  // Perfis cruzados (esquerda na economia e conservador nos costumes, ou o contrário) não cabem numa palavra só.
  if (economic !== null && cultural !== null && Math.sign(economic) !== Math.sign(cultural) && Math.abs(economic) >= 25 && Math.abs(cultural) >= 25) {
    label = economic < 0 ? 'Esquerda econômica, conservador nos costumes' : 'Liberal na economia e nos costumes';
  }
  const parts: string[] = [];
  if (economic !== null) parts.push(`Na economia, ${side(economic, 'à esquerda', 'à direita')}`);
  if (cultural !== null) parts.push(`nos costumes, ${side(cultural, 'progressista', 'conservador')}`);
  return { economic, cultural, overall, label, detail: parts.join('; ') + '.' };
}
