"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { axes, questionsFor } from "@/lib/data";
import { type Answer, type Mode, encodeResult, scoreAxes } from "@/lib/scoring";

const OPTIONS: { value: Answer; label: string }[] = [
  { value: 2, label: "Concordo totalmente" },
  { value: 1, label: "Concordo" },
  { value: 0, label: "Neutro" },
  { value: -1, label: "Discordo" },
  { value: -2, label: "Discordo totalmente" },
];

// Intercala os eixos (1ª de cada eixo, 2ª de cada eixo…) para não haver blocos temáticos que induzam a resposta.
function interleave<T extends { axis: string }>(qs: T[]): T[] {
  const byAxis = new Map<string, T[]>();
  for (const q of qs) byAxis.set(q.axis, [...(byAxis.get(q.axis) ?? []), q]);
  const lists = [...byAxis.values()];
  const out: T[] = [];
  for (let i = 0; out.length < qs.length; i++) for (const l of lists) if (l[i]) out.push(l[i]);
  return out;
}

export default function Quiz({ mode }: { mode: Mode }) {
  const router = useRouter();
  const qs = useMemo(() => interleave(questionsFor(mode)), [mode]);
  const storageKey = `perfil-politico:${mode}`;
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [i, setI] = useState(0);
  const [restored, setRestored] = useState(false);

  // Progresso só neste navegador (sessionStorage), para não perder tudo num recarregamento.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
      if (saved && typeof saved.i === "number" && saved.answers) {
        setAnswers(saved.answers);
        setI(Math.min(saved.i, qs.length - 1));
      }
    } catch {}
    setRestored(true);
  }, [storageKey, qs.length]);

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ i, answers }));
    } catch {}
  }, [restored, storageKey, i, answers]);

  const q = qs[i];
  const current = q.id in answers ? answers[q.id] : undefined;

  function choose(value: Answer) {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (i + 1 < qs.length) {
      setI(i + 1);
      return;
    }
    const code = encodeResult(axes, scoreAxes(axes, qs, next), mode);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
    router.push(`/r/${code}`);
  }

  const progress = Math.round((i / qs.length) * 100);

  return (
    <div className="pt-6 space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted">
          <span>
            {i + 1} de {qs.length}
          </span>
          <span>{mode === "rapido" ? "Modo rápido" : "Teste completo"}</span>
        </div>
        <div
          className="h-2 rounded-full bg-line overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-semibold leading-snug min-h-[6rem]" aria-live="polite">
        {q.text}
      </h1>

      <div className="grid gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => choose(o.value)}
            className={`rounded-xl border px-4 py-3 text-left font-medium transition-colors ${
              current === o.value ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-accent"
            }`}
          >
            {o.label}
          </button>
        ))}
        <button
          onClick={() => choose(null)}
          className={`rounded-xl border border-dashed px-4 py-3 text-left text-muted transition-colors ${
            current === null ? "border-accent bg-accent-soft" : "border-line hover:border-accent"
          }`}
        >
          Não sei / prefiro não responder
        </button>
      </div>

      <div className="flex justify-between text-sm">
        <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="text-muted disabled:opacity-40">
          ← Voltar
        </button>
        {current !== undefined && i + 1 < qs.length && (
          <button onClick={() => setI(i + 1)} className="text-muted">
            Avançar →
          </button>
        )}
      </div>
    </div>
  );
}
