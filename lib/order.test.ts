import { describe, expect, it } from 'vitest';
import { axes, ideologies, questions } from './data';
import { sessionQuestions } from './order';
import { rank, scoreAxes } from './scoring';
import { PERSONAS, answerAs } from './personas';

const SEEDS = Array.from({ length: 300 }, (_, i) => i * 7919 + 1);

describe('sorteio das perguntas', () => {
  it('completo: todas as 72, sem repetir, ordem muda com a semente', () => {
    const a = sessionQuestions(questions, 'completo', 1).map((q) => q.id);
    const b = sessionQuestions(questions, 'completo', 2).map((q) => q.id);
    expect(new Set(a).size).toBe(questions.length);
    expect(a).not.toEqual(b);
  });

  it('mesma semente, mesma sessão (recarregar a página mantém a ordem)', () => {
    for (const mode of ['completo', 'rapido'] as const) {
      expect(sessionQuestions(questions, mode, 42).map((q) => q.id)).toEqual(sessionQuestions(questions, mode, 42).map((q) => q.id));
    }
  });

  it('nunca duas perguntas seguidas do mesmo eixo', () => {
    for (const seed of SEEDS) {
      for (const mode of ['completo', 'rapido'] as const) {
        const qs = sessionQuestions(questions, mode, seed);
        for (let i = 1; i < qs.length; i++) expect(qs[i].axis, `${mode} seed ${seed} pos ${i}`).not.toBe(qs[i - 1].axis);
      }
    }
  });

  it('rápido: 24 perguntas, 1 de cada sentido por eixo, e o conjunto varia', () => {
    const sets = new Set<string>();
    for (const seed of SEEDS) {
      const qs = sessionQuestions(questions, 'rapido', seed);
      expect(qs.length).toBe(axes.length * 2);
      for (const ax of axes) expect(qs.filter((q) => q.axis === ax.id).map((q) => q.dir).sort(), ax.id).toEqual([-1, 1]);
      sets.add(qs.map((q) => q.id).sort().join());
    }
    expect(sets.size).toBeGreaterThan(200);
  });

  it('a primeira pergunta varia (sem efeito de ordem fixo)', () => {
    const first = new Set(SEEDS.map((s) => sessionQuestions(questions, 'completo', s)[0].axis));
    expect(first.size).toBe(axes.length);
  });

  it('rápido sorteado: personas ainda caem numa corrente coerente na grande maioria das sessões', () => {
    const ok: Record<string, string[]> = {
      'esquerda-nacional-desenvolvimentista': ['nacional-desenvolvimentismo', 'trabalhismo', 'esquerda-crista', 'populismo-de-esquerda-bolivarianismo'],
      'social-democrata': ['social-democracia', 'socialismo-democratico', 'ecossocialismo-socioambientalismo'],
      'centro-liberal': ['liberalismo-progressista', 'social-liberalismo', 'tecnocracia-liberal'],
      'centro-direita': ['liberal-conservadorismo', 'tecnocracia-liberal', 'democracia-crista', 'liberalismo-classico'],
      'direita-conservadora-religiosa': ['conservadorismo-religioso', 'nacional-conservadorismo'],
      'direita-libertaria': ['libertarianismo-anarcocapitalismo', 'liberalismo-classico'],
    };
    for (const p of PERSONAS) {
      let hits = 0;
      for (const seed of SEEDS) {
        const qs = sessionQuestions(questions, 'rapido', seed);
        const top = rank(scoreAxes(axes, qs, answerAs(p.stance, qs)), ideologies)[0].target.id;
        if (ok[p.id].includes(top)) hits++;
      }
      expect(hits / SEEDS.length, p.id).toBeGreaterThanOrEqual(0.95);
    }
  });
});
