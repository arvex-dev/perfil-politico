import axesJson from '@/data/axes.json';
import questionsJson from '@/data/questions.json';
import ideologiesJson from '@/data/ideologies.json';
import figuresJson from '@/data/figures.json';
import countriesJson from '@/data/countries.json';
import type { Axis, Coords, Question, Target } from './scoring';

export interface Ideology extends Target {
  desc: string;
}

export interface Figure extends Target {
  country: string;
  group: string;
  role: string;
  basis: string;
  estimated: boolean;
  sources: string[];
}

export interface Country extends Target {
  code: string;
  estimated: boolean;
}

export interface QuestionInfo extends Question {
  source: string;
  context: string;
  agree: string;
  disagree: string;
  /** Fontes do contexto (fact-check), mostradas em "Entenda a pergunta". */
  refs?: { publisher: string; title: string; url: string }[];
}

export const axes = axesJson.axes as (Axis & { why: string })[];
export const questions = questionsJson.questions as QuestionInfo[];
export const ideologies = ideologiesJson.ideologies as unknown as Ideology[];
export const figures = figuresJson.figures as unknown as Figure[];
export const countries = countriesJson.countries as unknown as Country[];

export function questionsFor(mode: 'completo' | 'rapido'): QuestionInfo[] {
  return mode === 'rapido' ? questions.filter((q) => q.quick) : questions;
}

export type { Coords };
