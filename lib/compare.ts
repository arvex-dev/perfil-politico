// Comparação entre dois resultados (comparar com um amigo), só a partir dos dois códigos: nada vai para servidor.
import type { Axis, Scores } from './scoring';
import { similarity } from './scoring';

export interface AxisDiff {
  axis: Axis;
  a: number;
  b: number;
  diff: number;
}

export function compare(axes: Axis[], a: Scores, b: Scores) {
  const both: AxisDiff[] = axes
    .filter((ax) => a[ax.id] != null && b[ax.id] != null)
    .map((ax) => ({ axis: ax, a: a[ax.id]!, b: b[ax.id]!, diff: Math.abs(a[ax.id]! - b[ax.id]!) }));
  const sorted = [...both].sort((x, y) => x.diff - y.diff);
  return {
    /** Mesma fórmula da afinidade com figuras: 100 − RMS das diferenças. */
    agreement: similarity(a, b).similarity,
    axes: both,
    closest: sorted.slice(0, 3),
    farthest: sorted.slice(-3).reverse().filter((d) => d.diff >= 25),
  };
}
