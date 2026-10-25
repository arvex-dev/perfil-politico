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

  it('rápido: sempre as mesmas 24 perguntas (conjunto fixo), só a ordem muda', () => {
    const fixed = questions.filter((q) => q.quick).map((q) => q.id).sort();
    expect(fixed.length).toBe(axes.length * 2);
    const orders = new Set<string>();
    for (const seed of SEEDS) {
      const ids = sessionQuestions(questions, 'rapido', seed).map((q) => q.id);
      expect([...ids].sort()).toEqual(fixed);
      orders.add(ids.join());
    }
    expect(orders.size).toBeGreaterThan(250);
  });

  it('a primeira pergunta varia (sem efeito de ordem fixo)', () => {
    const first = new Set(SEEDS.map((s) => sessionQuestions(questions, 'completo', s)[0].axis));
    expect(first.size).toBe(axes.length);
  });

  it('rápido: personas caem numa corrente coerente (a ordem não muda o resultado)', () => {
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
      expect(hits, p.id).toBe(SEEDS.length);
    }
  });
});
