import { describe, expect, it } from 'vitest';
import { axes, questions } from './data';
import { matchParliamentarian, parliament, rankParliament } from './parliament';
import { scoreAxes } from './scoring';
import { PERSONAS, answerAs } from './personas';

const scoresOf = (id: string) => scoreAxes(axes, questions, answerAs(PERSONAS.find((p) => p.id === id)!.stance, questions));

describe('parlamentares', () => {
  it('dados carregados: deputados e senadores, eixos com [score, n] válidos', () => {
    const casas = new Set(parliament.members.map((m) => m.casa));
    expect(casas).toEqual(new Set(['C', 'S']));
    expect(parliament.members.length).toBeGreaterThan(500);
    for (const m of parliament.members)
      for (const [, [s, n]] of Object.entries(m.a)) {
        expect(s).toBeGreaterThanOrEqual(-100);
        expect(s).toBeLessThanOrEqual(100);
        expect(n).toBeGreaterThan(0);
      }
  });

  it('exige 3 eixos em comum', () => {
    const m = { ...parliament.members[0], a: { economia: [100, 3] as [number, number], ambiente: [100, 3] as [number, number] } };
    expect(matchParliamentarian(scoresOf('centro-direita'), m)).toBeNull();
  });

  it('esquerda e direita têm listas diferentes, e o filtro por UF funciona', () => {
    const left = rankParliament(scoresOf('social-democrata'), { casa: 'C' }).map((x) => x.m.id);
    const right = rankParliament(scoresOf('direita-conservadora-religiosa'), { casa: 'C' }).map((x) => x.m.id);
    expect(left.filter((id) => right.includes(id))).toEqual([]);
    const sp = rankParliament(scoresOf('centro-liberal'), { casa: 'C', uf: 'SP' });
    expect(sp.length).toBe(5);
    expect(sp.every((x) => x.m.uf === 'SP')).toBe(true);
    console.log('esq:', rankParliament(scoresOf('social-democrata'), { casa: 'C' }, 3).map((x) => `${x.m.nome} (${x.m.partido}) ${x.r.similarity}`).join(', '));
    console.log('dir:', rankParliament(scoresOf('direita-conservadora-religiosa'), { casa: 'C' }, 3).map((x) => `${x.m.nome} (${x.m.partido}) ${x.r.similarity}`).join(', '));
    console.log('lib:', rankParliament(scoresOf('direita-libertaria'), { casa: 'C' }, 3).map((x) => `${x.m.nome} (${x.m.partido}) ${x.r.similarity}`).join(', '));
    console.log('sen esq:', rankParliament(scoresOf('esquerda-nacional-desenvolvimentista'), { casa: 'S' }, 3).map((x) => `${x.m.nome} (${x.m.partido}) ${x.r.similarity}`).join(', '));
  });
});
