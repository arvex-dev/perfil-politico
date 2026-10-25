// As seis personas da pesquisa (docs/pesquisa/02-extracao-simulacao.md), como posição alvo por eixo. Usadas nos
// testes de coerência: cada pergunta é respondida a partir da posição do eixo (|posição| ≥ 75 → "totalmente").
import type { Answer, Question } from './scoring';

export interface Persona {
  id: string;
  name: string;
  stance: Record<string, number>;
}

const AX = ['economia', 'distribuicao', 'trabalho', 'costumes', 'religiao', 'seguranca', 'liberdades', 'ambiente', 'soberania', 'geopolitica', 'instituicoes', 'diversidade'];
const st = (v: number[]) => Object.fromEntries(AX.map((k, i) => [k, v[i]]));

export const PERSONAS: Persona[] = [
  { id: 'esquerda-nacional-desenvolvimentista', name: 'Esquerda nacional-desenvolvimentista', stance: st([-70, -60, -70, -10, -20, 0, 10, 10, -85, -50, -20, -30]) },
  { id: 'social-democrata', name: 'Social-democrata / centro-esquerda urbana', stance: st([-35, -60, -50, -65, -60, -45, -35, -60, -20, -20, -50, -60]) },
  { id: 'centro-liberal', name: 'Centro liberal (mercado + costumes progressistas)', stance: st([50, 0, 35, -60, -60, -15, -50, -20, 55, 40, -50, 0]) },
  { id: 'centro-direita', name: 'Centro-direita liberal na economia, moderada nos costumes', stance: st([55, 30, 45, 20, 15, 40, 10, 25, 45, 40, -30, 40]) },
  { id: 'direita-conservadora-religiosa', name: 'Direita conservadora religiosa', stance: st([30, 35, 35, 90, 90, 65, 35, 45, 10, 50, 30, 65]) },
  { id: 'direita-libertaria', name: 'Direita libertária', stance: st([95, 85, 90, -10, -40, 10, -85, 55, 95, 60, 50, 60]) },
];

export function answerAs(stance: Record<string, number>, questions: Question[]): Record<string, Answer> {
  return Object.fromEntries(
    questions.map((q) => [q.id, Math.max(-2, Math.min(2, Math.round((stance[q.axis] * q.dir) / 50))) as Answer]),
  );
}
