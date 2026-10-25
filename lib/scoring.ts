// Motor de pontuação: TypeScript puro, sem React nem Next, para rodar igual no navegador, no servidor (página de
// resultado e imagem) e nos testes. Fórmulas documentadas em docs/PROPOSTA.md §3.

export type Answer = -2 | -1 | 0 | 1 | 2 | null; // discordo totalmente … concordo totalmente; null = "não sei"

export interface Axis {
  id: string;
  name: string;
  poleA: string;
  poleB: string;
  descA: string;
  descB: string;
}

export interface Question {
  id: string;
  axis: string;
  dir: 1 | -1;
  weight: number;
  quick?: boolean;
  text: string;
}

export type Coords = Record<string, number | null>;

export interface Target {
  id: string;
  name: string;
  coords: Coords;
}

export type Scores = Record<string, number | null>;

export interface Match<T extends Target> {
  target: T;
  /** 0–100; 100 = mesma posição em todos os eixos comparados. */
  similarity: number;
  /** Eixos usados na comparação (os dois lados com valor). */
  axes: number;
}

/** Score por eixo de -100 (polo A) a +100 (polo B). null quando o eixo não teve nenhuma resposta válida. */
export function scoreAxes(axes: Axis[], questions: Question[], answers: Record<string, Answer>): Scores {
  const sum: Record<string, number> = {};
  const max: Record<string, number> = {};
  for (const q of questions) {
    const a = answers[q.id];
    if (a === undefined || a === null) continue;
    sum[q.axis] = (sum[q.axis] ?? 0) + a * q.dir * q.weight;
    max[q.axis] = (max[q.axis] ?? 0) + 2 * q.weight;
  }
  const out: Scores = {};
  for (const ax of axes) out[ax.id] = max[ax.id] ? Math.round((100 * sum[ax.id]) / max[ax.id]) : null;
  return out;
}

/** Quantas perguntas do eixo tiveram resposta (fora "não sei"), para mostrar a confiança. */
export function answeredPerAxis(questions: Question[], answers: Record<string, Answer>): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = {};
  for (const q of questions) {
    const c = (out[q.axis] ??= [0, 0]);
    c[1]++;
    const a = answers[q.id];
    if (a !== undefined && a !== null) c[0]++;
  }
  return out;
}

/** Eixos mínimos em comum para uma comparação valer (evita 100% com uma figura que só tem 2 eixos preenchidos). */
export const MIN_SHARED_AXES = 6;

/**
 * Similaridade = 100 × (1 − RMS das diferenças / 100), limitada a 0–100.
 * Diferença média de 25 pontos por eixo → 75%; de 50 → 50%; de 100 ou mais → 0%. Assim só fica acima de 90% quem
 * está a menos de 10 pontos, em média, em todos os eixos.
 */
export function similarity(a: Scores, b: Coords): { similarity: number; axes: number } {
  let sq = 0;
  let n = 0;
  for (const k of Object.keys(a)) {
    const x = a[k];
    const y = b[k];
    if (x === null || x === undefined || y === null || y === undefined) continue;
    sq += (x - y) ** 2;
    n++;
  }
  if (n === 0) return { similarity: 0, axes: 0 };
  const rms = Math.sqrt(sq / n);
  return { similarity: Math.max(0, Math.min(100, Math.round(100 - rms))), axes: n };
}

export function rank<T extends Target>(scores: Scores, targets: T[]): Match<T>[] {
  return targets
    .map((target) => ({ target, ...similarity(scores, target.coords) }))
    .filter((m) => m.axes >= MIN_SHARED_AXES)
    .sort((x, y) => y.similarity - x.similarity || y.axes - x.axes || x.target.name.localeCompare(y.target.name));
}

/** Frases curtas: os eixos mais marcados da pessoa e onde ela mais se afasta da ideologia atribuída. */
export function explain(axes: Axis[], scores: Scores, ideology: Target): string[] {
  const label = (s: number) => (Math.abs(s) >= 60 ? 'forte' : Math.abs(s) >= 30 ? 'clara' : 'leve');
  const marked = axes
    .filter((ax) => scores[ax.id] !== null)
    .sort((x, y) => Math.abs(scores[y.id]!) - Math.abs(scores[x.id]!));
  const lines: string[] = [];
  const strong = marked.slice(0, 3).filter((ax) => Math.abs(scores[ax.id]!) >= 15);
  if (strong.length) {
    lines.push(
      'Suas posições mais marcadas: ' +
        strong
          .map((ax) => {
            const s = scores[ax.id]!;
            return `${label(s)} tendência a ${(s < 0 ? ax.poleA : ax.poleB).toLowerCase()} (${ax.name})`;
          })
          .join('; ') +
        '.',
    );
  } else {
    lines.push('Você ficou perto do centro em todos os eixos: nenhuma posição se destacou.');
  }
  const near = marked
    .filter((ax) => ideology.coords[ax.id] != null && Math.abs(scores[ax.id]! - ideology.coords[ax.id]!) <= 25)
    .slice(0, 3);
  if (near.length) lines.push(`Você e ${ideology.name} coincidem em ${near.map((ax) => ax.name.toLowerCase()).join(', ')}.`);
  let far: Axis | null = null;
  let farD = 0;
  for (const ax of marked) {
    const t = ideology.coords[ax.id];
    if (t == null) continue;
    const d = Math.abs(scores[ax.id]! - t);
    if (d > farD) [far, farD] = [ax, d];
  }
  if (far && farD >= 40) {
    const s = scores[far.id]!;
    const t = ideology.coords[far.id]!;
    lines.push(
      `A maior diferença está em ${far.name.toLowerCase()}: você está mais para ${(s < t ? far.poleA : far.poleB).toLowerCase()} do que essa corrente costuma estar.`,
    );
  }
  return lines;
}

// Resultado na URL: só os scores por eixo (nunca as respostas, que são opinião política e dado sensível pela LGPD).
// Bytes: [versão, modo (0 completo, 1 rápido), score+100 de cada eixo na ordem de axes.json (255 = sem dados)].
export const CODE_VERSION = 1;

export type Mode = 'completo' | 'rapido';

export function encodeResult(axes: Axis[], scores: Scores, mode: Mode): string {
  const bytes = new Uint8Array(2 + axes.length);
  bytes[0] = CODE_VERSION;
  bytes[1] = mode === 'rapido' ? 1 : 0;
  axes.forEach((ax, i) => {
    const s = scores[ax.id];
    bytes[2 + i] = s === null || s === undefined ? 255 : Math.max(-100, Math.min(100, Math.round(s))) + 100;
  });
  return toBase64Url(bytes);
}

export function decodeResult(axes: Axis[], code: string): { scores: Scores; mode: Mode } | null {
  let bytes: Uint8Array;
  try {
    bytes = fromBase64Url(code);
  } catch {
    return null;
  }
  if (bytes.length !== 2 + axes.length || bytes[0] !== CODE_VERSION || bytes[1] > 1) return null;
  const scores: Scores = {};
  for (let i = 0; i < axes.length; i++) {
    const b = bytes[2 + i];
    if (b === 255) scores[axes[i].id] = null;
    else if (b <= 200) scores[axes[i].id] = b - 100;
    else return null;
  }
  return { scores, mode: bytes[1] === 1 ? 'rapido' : 'completo' };
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(s)) throw new Error('invalid');
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
