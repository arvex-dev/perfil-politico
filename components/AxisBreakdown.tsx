"use client";

// Como as respostas formaram cada eixo. Só aparece para quem acabou de fazer o teste neste navegador: as respostas
// ficam no sessionStorage e nunca vão na URL nem para o servidor.
import { useEffect, useState } from "react";
import { axes, questions } from "@/lib/data";
import type { Answer } from "@/lib/scoring";
import { answersKey } from "@/lib/storage";

const LABEL: Record<string, string> = { "2": "Concordo totalmente", "1": "Concordo", "0": "Neutro", "-1": "Discordo", "-2": "Discordo totalmente" };

export default function AxisBreakdown({ code }: { code: string }) {
  const [answers, setAnswers] = useState<Record<string, Answer> | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(answersKey(code)) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage só existe depois da montagem
      if (saved?.answers) setAnswers(saved.answers);
    } catch {}
  }, [code]);

  if (!answers) return null;

  return (
    <details className="rounded-[20px] border border-line bg-card p-5">
      <summary className="cursor-pointer select-none font-semibold">Por que caí em cada ponto? (suas respostas)</summary>
      <p className="mt-2 text-sm text-muted">Visível só para você, neste navegador. Não fica salvo em servidor nem vai no link.</p>
      <div className="mt-4 space-y-5">
        {axes.map((ax) => {
          const qs = questions.filter((q) => q.axis === ax.id && q.id in answers);
          if (!qs.length) return null;
          return (
            <div key={ax.id}>
              <h3 className="font-mono text-xs uppercase tracking-wider text-muted mb-2">{ax.name}</h3>
              <ul className="space-y-2 text-[15px]">
                {qs.map((q) => {
                  const a = answers[q.id];
                  const pull = a === null || a === 0 ? null : a * q.dir > 0 ? ax.poleB : ax.poleA;
                  return (
                    <li key={q.id} className="leading-snug">
                      <span>{q.text}</span>{" "}
                      <span className="text-muted">
                        — {a === null ? "Não sei" : LABEL[String(a)]}
                        {pull && <> · puxou para <strong className="text-ink">{pull.toLowerCase()}</strong></>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </details>
  );
}
