"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { axes, questions } from "@/lib/data";
import { newSeed, sessionQuestions } from "@/lib/order";
import { type Answer, type Mode, encodeResult, scoreAxes } from "@/lib/scoring";

// A bolinha à esquerda cresce com a intensidade, igual para concordar e discordar: nenhuma cor sugere a resposta certa.
const OPTIONS: { value: Exclude<Answer, null>; label: string; dot: number }[] = [
  { value: 2, label: "Concordo totalmente", dot: 14 },
  { value: 1, label: "Concordo", dot: 9 },
  { value: 0, label: "Neutro", dot: 5 },
  { value: -1, label: "Discordo", dot: 9 },
  { value: -2, label: "Discordo totalmente", dot: 14 },
];

function lower(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export default function Quiz({ mode }: { mode: Mode }) {
  const router = useRouter();
  const storageKey = `perfil-politico:${mode}`;
  // Semente do sorteio (ordem e, no modo rápido, quais perguntas). Só existe depois da montagem, no navegador.
  const [seed, setSeed] = useState<number | null>(null);
  const qs = useMemo(() => (seed === null ? [] : sessionQuestions(questions, mode, seed)), [mode, seed]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [i, setI] = useState(0);
  // Quem abre a explicação uma vez provavelmente quer vê-la nas próximas: fica aberta até ser fechada.
  const [showInfo, setShowInfo] = useState(false);

  // Progresso e sorteio só neste navegador (sessionStorage): recarregar a página mantém as mesmas perguntas, na mesma
  // ordem. Lido depois da montagem porque a página é pré-renderizada sem storage.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    let restored = false;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
      if (saved && typeof saved.seed === "number" && typeof saved.i === "number" && saved.answers) {
        setSeed(saved.seed);
        setAnswers(saved.answers);
        setI(saved.i);
        restored = true;
      }
    } catch {}
    if (!restored) setSeed(newSeed());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [storageKey]);

  useEffect(() => {
    if (seed === null) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ seed, i, answers }));
    } catch {}
  }, [seed, storageKey, i, answers]);

  if (!qs.length) return <div className="pt-24 text-center text-muted" aria-busy="true">Sorteando as perguntas…</div>;

  const q = qs[Math.min(i, qs.length - 1)];
  const current = q.id in answers ? answers[q.id] : undefined;
  const axis = axes.find((a) => a.id === q.axis)!;

  function choose(value: Answer) {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (i + 1 < qs.length) {
      setI(i + 1);
      return;
    }
    const code = encodeResult(axes, scoreAxes(axes, qs, next), mode, seed!);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
    router.push(`/r/${code}`);
  }

  const progress = (i / qs.length) * 100;

  return (
    <div className="pt-2 space-y-7">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setI(Math.max(0, i - 1))}
          disabled={i === 0}
          aria-label="Pergunta anterior"
          className="h-11 w-11 -ml-2 shrink-0 rounded-full flex items-center justify-center hover:bg-card disabled:opacity-30"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12.5 4 6.5 10l6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div
          className="h-1.5 flex-1 rounded-full bg-track overflow-hidden"
          role="progressbar"
          aria-label="Progresso"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-ink transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="font-mono text-xs text-muted tabular-nums w-12 text-right">
          {i + 1}/{qs.length}
        </span>
      </div>

      <div key={q.id} className="fade-in space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{axis.name}</p>
        <h1 className="text-[1.65rem] sm:text-3xl font-semibold leading-snug tracking-tight" aria-live="polite">
          {q.text}
        </h1>
        <button
          onClick={() => setShowInfo(!showInfo)}
          aria-expanded={showInfo}
          aria-controls="q-info"
          className="inline-flex items-center gap-1.5 h-9 -ml-1 px-1 rounded-md text-[15px] font-medium text-accent"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 7.2v4M8 4.8v.1" strokeLinecap="round" />
          </svg>
          {showInfo ? "Ocultar explicação" : "Entenda a pergunta"}
        </button>
        {showInfo && (
          <div id="q-info" className="rounded-[20px] bg-card border border-line p-5 space-y-3 text-[15px] leading-relaxed">
            <p>{q.context}</p>
            <dl className="space-y-2">
              <div>
                <dt className="inline font-semibold">Concordar: </dt>
                <dd className="inline">{lower(q.agree)}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Discordar: </dt>
                <dd className="inline">{lower(q.disagree)}</dd>
              </div>
            </dl>
            {q.refs && q.refs.length > 0 && (
              <p className="text-sm text-muted">
                Fontes:{" "}
                {q.refs.map((r, k) => (
                  <span key={r.url}>
                    {k > 0 && " · "}
                    <a href={r.url} target="_blank" rel="noopener noreferrer" title={r.title} className="underline underline-offset-2 hover:text-ink">
                      {r.publisher}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </div>
        )}
      </div>

      {i === 0 && !showInfo && (
        <p className="text-sm text-muted -mt-3">
          Não conhece o tema? Use &quot;Não sei&quot;, que não conta no resultado.
        </p>
      )}

      <div className="grid gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => choose(o.value)}
            aria-pressed={current === o.value}
            className={`flex items-center gap-4 h-14 rounded-[12px] border px-4 text-left text-[17px] font-medium transition-colors ${
              current === o.value ? "border-accent bg-accent-soft" : "border-line bg-card hover:border-ink"
            }`}
          >
            <span className="w-4 flex justify-center" aria-hidden="true">
              <span className="rounded-full bg-ink" style={{ width: o.dot, height: o.dot, opacity: o.value === 0 ? 0.35 : 0.85 }} />
            </span>
            {o.label}
          </button>
        ))}
        <button
          onClick={() => choose(null)}
          aria-pressed={current === null}
          className={`h-12 rounded-[12px] px-4 text-left text-[15px] text-muted transition-colors ${
            current === null ? "bg-accent-soft text-ink" : "hover:bg-card"
          }`}
        >
          Não sei / prefiro não responder
        </button>
      </div>

      {current !== undefined && i + 1 < qs.length && (
        <div className="text-right">
          <button onClick={() => setI(i + 1)} className="h-11 px-3 rounded-md text-sm text-muted hover:text-ink">
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
