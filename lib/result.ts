import { axes, countries, figures, ideologies } from "./data";
import { decodeResult, explain, rank } from "./scoring";

/** Tudo o que a página de resultado e a imagem mostram, a partir do código da URL. */
export function buildResult(code: string) {
  const decoded = decodeResult(axes, code);
  if (!decoded) return null;
  const { scores, mode } = decoded;
  const ideologyRank = rank(scores, ideologies);
  if (!ideologyRank.length) return null;
  const ideology = ideologyRank[0];
  return {
    code,
    mode,
    scores,
    ideology,
    alternatives: ideologyRank.slice(1, 3),
    figures: rank(scores, figures).slice(0, 3),
    countries: rank(scores, countries).slice(0, 3),
    explanation: explain(axes, scores, ideology.target),
  };
}

export type Result = NonNullable<ReturnType<typeof buildResult>>;
