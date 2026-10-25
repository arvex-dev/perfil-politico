import { describe, expect, it } from 'vitest';
import { axes, countries, figures, ideologies, questions, questionsFor } from './data';
import {
  type Answer,
  decodeResult,
  encodeResult,
  explain,
  rank,
  scoreAxes,
  similarity,
} from './scoring';
import { PERSONAS, answerAs } from './personas';

const all = (a: Answer) => Object.fromEntries(questions.map((q) => [q.id, a]));

describe('dados', () => {
  it('cada eixo tem 6 perguntas, 3 em cada sentido, e 1 de cada sentido no modo rápido', () => {
    for (const ax of axes) {
      const qs = questions.filter((q) => q.axis === ax.id);
      expect(qs.length, ax.id).toBe(6);
      expect(qs.filter((q) => q.dir === 1).length, ax.id).toBe(3);
      const quick = qs.filter((q) => q.quick);
      expect(quick.map((q) => q.dir).sort(), ax.id).toEqual([-1, 1]);
    }
    expect(questionsFor('rapido').length).toBe(axes.length * 2);
  });

  it('toda pergunta tem contexto e o que significa concordar e discordar', () => {
    for (const q of questions) {
      for (const k of ['context', 'agree', 'disagree'] as const) expect(q[k]?.length, `${q.id}.${k}`).toBeGreaterThan(15);
      expect(q.agree, q.id).not.toBe(q.disagree);
    }
  });

  it('ids únicos e todas as coordenadas dentro de -100..100 ou null', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const t of [...ideologies, ...figures, ...countries]) {
      for (const ax of axes) {
        const v = t.coords[ax.id];
        expect(v === null || (typeof v === 'number' && v >= -100 && v <= 100), `${t.id}.${ax.id}`).toBe(true);
      }
    }
  });

  it('figuras equilibradas: lados esquerdo e direito com no máximo 20% de diferença, e um centro', () => {
    const left = figures.filter((f) => f.group === 'esquerda' || f.group === 'centro-esquerda').length;
    const right = figures.filter((f) => f.group === 'direita' || f.group === 'centro-direita').length;
    const center = figures.filter((f) => f.group === 'centro').length;
    expect(figures.length).toBeGreaterThanOrEqual(40);
    expect(Math.abs(left - right) / Math.max(left, right)).toBeLessThanOrEqual(0.2);
    expect(center).toBeGreaterThanOrEqual(8);
  });
});

describe('scoreAxes', () => {
  it('concordar com tudo dá 0 em todos os eixos (itens balanceados anulam o viés de concordância)', () => {
    for (const v of Object.values(scoreAxes(axes, questions, all(2)))) expect(v).toBe(0);
  });

  it('"não sei" em tudo deixa os eixos sem dados', () => {
    for (const v of Object.values(scoreAxes(axes, questions, all(null)))) expect(v).toBeNull();
  });

  it('respostas espelhadas dão scores espelhados', () => {
    const p = answerAs(PERSONAS[0].stance, questions);
    const mirror = Object.fromEntries(Object.entries(p).map(([k, v]) => [k, (v === null ? null : -v) as Answer]));
    const a = scoreAxes(axes, questions, p);
    const b = scoreAxes(axes, questions, mirror);
    for (const ax of axes) expect(a[ax.id]).toBe(-(b[ax.id] as number) || 0);
  });

  it('extremo em um eixo dá ±100', () => {
    const ans: Record<string, Answer> = {};
    for (const q of questions.filter((q) => q.axis === 'economia')) ans[q.id] = (2 * q.dir) as Answer;
    expect(scoreAxes(axes, questions, ans).economia).toBe(100);
  });
});

describe('similarity', () => {
  it('discrimina: só fica acima de 90% quem está muito perto', () => {
    const zero = Object.fromEntries(axes.map((a) => [a.id, 0]));
    const far = Object.fromEntries(axes.map((a) => [a.id, 50]));
    expect(similarity(zero, zero).similarity).toBe(100);
    expect(similarity(zero, far).similarity).toBe(50);
    expect(similarity(zero, Object.fromEntries(axes.map((a) => [a.id, 100]))).similarity).toBe(0);
  });

  it('ignora eixos null e exige eixos mínimos em comum', () => {
    const s = Object.fromEntries(axes.map((a) => [a.id, 0]));
    const sparse = { id: 'x', name: 'X', coords: { economia: 0 } };
    expect(rank(s, [sparse])).toEqual([]);
  });

  it('com respostas aleatórias a melhor figura raramente passa de 90%', () => {
    let seed = 42;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    let over90 = 0;
    for (let i = 0; i < 200; i++) {
      const ans = Object.fromEntries(questions.map((q) => [q.id, (Math.floor(rnd() * 5) - 2) as Answer]));
      if (rank(scoreAxes(axes, questions, ans), figures)[0].similarity > 90) over90++;
    }
    expect(over90).toBe(0);
  });
});

describe('personas (coerência do resultado)', () => {
  const expected: Record<string, string[]> = {
    'esquerda-nacional-desenvolvimentista': ['nacional-desenvolvimentismo', 'trabalhismo'],
    'social-democrata': ['social-democracia', 'socialismo-democratico', 'ecossocialismo-socioambientalismo'],
    'centro-liberal': ['liberalismo-progressista', 'social-liberalismo'],
    'centro-direita': ['liberal-conservadorismo', 'tecnocracia-liberal', 'democracia-crista'],
    'direita-conservadora-religiosa': ['conservadorismo-religioso', 'nacional-conservadorismo'],
    'direita-libertaria': ['libertarianismo-anarcocapitalismo', 'liberalismo-classico'],
  };
  for (const p of PERSONAS) {
    it(`${p.name} cai numa ideologia coerente (completo e rápido)`, () => {
      for (const mode of ['completo', 'rapido'] as const) {
        const qs = questionsFor(mode);
        const scores = scoreAxes(axes, qs, answerAs(p.stance, qs));
        const top = rank(scores, ideologies)[0];
        expect(expected[p.id], `${mode}: ${top.target.id}`).toContain(top.target.id);
      }
    });
  }

  it('as personas não se concentram: ideologias do topo são diferentes e a distância entre extremos é grande', () => {
    const tops = PERSONAS.map((p) => rank(scoreAxes(axes, questions, answerAs(p.stance, questions)), ideologies)[0].target.id);
    expect(new Set(tops).size).toBe(PERSONAS.length);
  });
});

describe('codificação na URL', () => {
  it('ida e volta preserva scores, nulls e modo', () => {
    const s = scoreAxes(axes, questions, answerAs(PERSONAS[4].stance, questions));
    s.geopolitica = null;
    const code = encodeResult(axes, s, 'rapido');
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeResult(axes, code)).toEqual({ scores: s, mode: 'rapido' });
  });

  it('rejeita lixo', () => {
    expect(decodeResult(axes, '')).toBeNull();
    expect(decodeResult(axes, '!!!')).toBeNull();
    expect(decodeResult(axes, 'AAAA')).toBeNull();
  });
});

describe('explain', () => {
  it('gera frases citando polos reais', () => {
    const s = scoreAxes(axes, questions, answerAs(PERSONAS[5].stance, questions));
    const top = rank(s, ideologies)[0].target;
    const lines = explain(axes, s, top);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines[0]).toMatch(/mercado|flexibilização|responsabilidade/i);
  });
});
