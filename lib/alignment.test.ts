import { describe, expect, it } from 'vitest';
import { axes, figures, questions } from './data';
import { alignment, leftRightLabel } from './alignment';
import { scoreAxes } from './scoring';
import { PERSONAS, answerAs } from './personas';

const of = (id: string) => alignment(scoreAxes(axes, questions, answerAs(PERSONAS.find((p) => p.id === id)!.stance, questions)));

describe('alignment', () => {
  it('rótulos por faixa', () => {
    expect([-80, -30, 0, 30, 80].map(leftRightLabel)).toEqual(['Esquerda', 'Centro-esquerda', 'Centro', 'Centro-direita', 'Direita']);
  });

  it('personas caem do lado esperado', () => {
    expect(of('social-democrata').overall!).toBeLessThan(-30);
    expect(of('esquerda-nacional-desenvolvimentista').overall!).toBeLessThan(-15);
    expect(of('direita-conservadora-religiosa').label).toBe('Direita');
    expect(of('centro-direita').label).toBe('Centro-direita');
  });

  it('perfil cruzado ganha rótulo próprio', () => {
    expect(of('centro-liberal').label).toBe('Liberal na economia e nos costumes');
  });

  it('concordar com tudo dá centro', () => {
    const all = Object.fromEntries(questions.map((q) => [q.id, 2 as const]));
    expect(alignment(scoreAxes(axes, questions, all)).label).toBe('Centro');
  });

  it('figuras de referência: Lula à esquerda, Bolsonaro à direita', () => {
    const f = (n: string) => alignment(figures.find((x) => x.name === n)!.coords);
    expect(f('Lula').overall!).toBeLessThan(-15);
    expect(f('Jair Bolsonaro').overall!).toBeGreaterThan(45);
  });
});
