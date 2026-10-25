import { alignment } from "./alignment";
import { axes, countries, figures, ideologies } from "./data";
import { decodeResult, explain, rank } from "./scoring";

// Referências fixas do mapa, do mesmo tamanho dos dois lados: 4 à esquerda, 2 ao centro, 4 à direita.
const MAP_REFS: [string, string][] = [
  ["Guilherme Boulos", "Boulos"], ["Lula", "Lula"], ["Ciro Gomes", "Ciro"], ["Fernando Haddad", "Haddad"],
  ["Simone Tebet", "Tebet"], ["Fernando Henrique Cardoso", "FHC"],
  ["Tarcísio de Freitas", "Tarcísio"], ["Romeu Zema", "Zema"], ["Jair Bolsonaro", "Bolsonaro"], ["Javier Milei", "Milei"],
];

export const mapRefs = MAP_REFS.map(([name, short]) => {
  const f = figures.find((x) => x.name === name)!;
  const a = alignment(f.coords);
  return { name: f.name, short, x: a.economic ?? 0, y: a.cultural ?? 0 };
});

/** Tudo o que a página de resultado e as imagens mostram, a partir do código da URL. */
export function buildResult(code: string) {
  const decoded = decodeResult(axes, code);
  if (!decoded) return null;
  const { scores, mode } = decoded;
  const ideologyRank = rank(scores, ideologies);
  // Menos de MIN_SHARED_AXES eixos respondidos: não dá para comparar com nada (o questionário já impede isso).
  if (!ideologyRank.length) return null;
  const ideology = ideologyRank[0];
  return {
    code,
    mode,
    scores,
    alignment: alignment(scores),
    ideology,
    alternatives: ideologyRank.slice(1, 3),
    figures: rank(scores, figures).slice(0, 3),
    countries: rank(scores, countries).slice(0, 3),
    explanation: explain(axes, scores, ideology.target),
  };
}

export type Result = NonNullable<ReturnType<typeof buildResult>>;
