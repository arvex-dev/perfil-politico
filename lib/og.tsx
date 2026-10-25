// Peças das imagens geradas com next/og (Satori: só flexbox e posicionamento absoluto). Fontes TTF em assets/fonts
// (OFL), lidas do disco uma vez por processo; o Dockerfile copia a pasta para a imagem.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { mapRefs, type Result } from "./result";

/** Sobe quando o layout das imagens muda: entra na URL (?v=) para furar caches de versões anteriores. */
export const IMAGE_VERSION = 4;
export const IMAGE_CACHE = "public, max-age=86400";

// Cache em memória das imagens já geradas (cada uma custa de 0,2 a 1,6 s de CPU no VPS compartilhado). LRU simples;
// 120 PNGs de ~150 KB ≈ 18 MB, dentro do limite de 256 MB do container. Pedidos simultâneos da mesma imagem esperam a
// mesma geração, e no máximo RENDER_SLOTS geram ao mesmo tempo (o resto espera na fila).
const rendered = new Map<string, ArrayBuffer>();
const inflight = new Map<string, Promise<ArrayBuffer | Response>>();
const MAX_RENDERED = 120;
const RENDER_SLOTS = 2;
let busy = 0;
const queue: (() => void)[] = [];

async function slot<T>(fn: () => Promise<T>): Promise<T> {
  if (busy >= RENDER_SLOTS) await new Promise<void>((r) => queue.push(r));
  busy++;
  try {
    return await fn();
  } finally {
    busy--;
    queue.shift()?.();
  }
}

/** Chave da imagem: tipo, versão e o que aparece nela (modo + scores). A semente da ordem não muda a imagem e fica de
 *  fora, senão cada uma das 2^32 sementes seria uma imagem nova a gerar. */
export function imageKey(kind: string, scores: Record<string, number | null>, mode: string) {
  return `${kind}:${IMAGE_VERSION}:${mode}:${Object.values(scores).join(",")}`;
}

export async function cachedPng(key: string, render: () => Promise<Response> | Response): Promise<Response> {
  let png = rendered.get(key);
  if (png) {
    rendered.delete(key);
  } else {
    let job = inflight.get(key);
    if (!job) {
      job = slot(async () => {
        const res = await render();
        return res.ok ? res.arrayBuffer() : res;
      }).finally(() => inflight.delete(key));
      inflight.set(key, job);
    }
    const out = await job;
    if (out instanceof Response) return out;
    png = out;
    if (rendered.size >= MAX_RENDERED) rendered.delete(rendered.keys().next().value!);
  }
  rendered.set(key, png);
  return new Response(png, { headers: { "Content-Type": "image/png", "Cache-Control": IMAGE_CACHE } });
}

export const C = {
  paper: "#f2efe8",
  card: "#fbfaf6",
  ink: "#15161b",
  muted: "#565964",
  line: "#dcd7cc",
  accent: "#0b6e69",
  accentSoft: "#dcebe8",
};

let fontsCache: Promise<{ name: string; data: Buffer; weight: 400 | 600 | 800 | 500; style: "normal" }[]> | null = null;

export function fonts() {
  const dir = join(process.cwd(), "assets/fonts");
  fontsCache ??= Promise.all([
    readFile(join(dir, "archivo-expanded-800.ttf")).then((data) => ({ name: "Archivo", data, weight: 800 as const, style: "normal" as const })),
    readFile(join(dir, "inter-400.ttf")).then((data) => ({ name: "Inter", data, weight: 400 as const, style: "normal" as const })),
    readFile(join(dir, "inter-600.ttf")).then((data) => ({ name: "Inter", data, weight: 600 as const, style: "normal" as const })),
    readFile(join(dir, "jetbrains-mono-500.ttf")).then((data) => ({ name: "Mono", data, weight: 500 as const, style: "normal" as const })),
  ]);
  return fontsCache;
}

export function Brand({ size = 30 }: { size?: number }) {
  const s = size;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: s * 0.45 }}>
      <div style={{ display: "flex", position: "relative", width: s, height: s, border: `${s * 0.09}px solid ${C.ink}`, borderRadius: s * 0.27 }}>
        <div style={{ position: "absolute", left: s * 0.55, top: s * 0.16, width: s * 0.26, height: s * 0.26, borderRadius: s, background: C.accent }} />
      </div>
      <div style={{ display: "flex", fontFamily: "Archivo", fontSize: s * 0.62, letterSpacing: 1, color: C.ink }}>PERFIL POLÍTICO</div>
    </div>
  );
}

/** Mapa economia × costumes, quadrado de lado `size`. */
export function MapBox({ r, size }: { r: Result; size: number }) {
  const pad = size * 0.06;
  const inner = size - 2 * pad;
  const p = (v: number) => pad + ((v + 100) / 200) * inner;
  const fs = Math.round(size * 0.032);
  const { economic: x, cultural: y } = r.alignment;
  return (
    <div style={{ display: "flex", position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", left: pad, top: pad, width: inner, height: inner, background: C.card, border: `2px solid ${C.line}`, borderRadius: size * 0.04 }} />
      <div style={{ position: "absolute", left: size / 2 - 1, top: pad, width: 2, height: inner, background: "#b9b3a6" }} />
      <div style={{ position: "absolute", left: pad, top: size / 2 - 1, width: inner, height: 2, background: "#b9b3a6" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: size, display: "flex", justifyContent: "center", fontSize: fs, color: C.muted }}>Conservador</div>
      <div style={{ position: "absolute", left: 0, top: size - fs * 1.3, width: size, display: "flex", justifyContent: "center", fontSize: fs, color: C.muted }}>Progressista</div>
      <div style={{ position: "absolute", left: pad + 10, top: size / 2 + 8, display: "flex", fontSize: fs, color: C.muted }}>Esquerda</div>
      <div style={{ position: "absolute", right: pad + 10, top: size / 2 + 8, display: "flex", fontSize: fs, color: C.muted }}>Direita</div>
      {mapRefs.map((m) => (
        <div key={m.name} style={{ position: "absolute", left: 0, top: 0, width: size, height: size, display: "flex" }}>
          <div style={{ position: "absolute", left: p(m.x) - 6, top: p(-m.y) - 6, width: 12, height: 12, borderRadius: 6, background: C.muted, opacity: 0.6 }} />
          {/* Perto da borda direita o nome vai acima do ponto, para não sair do mapa nem colidir. */}
          <div style={{ position: "absolute", display: "flex", fontSize: fs * 0.92, color: C.muted, ...(m.x > 80 ? { right: size - p(m.x) - 8, top: p(-m.y) - 14 - fs } : { left: p(m.x) + 14, top: p(-m.y) - fs * 0.62 }) }}>{m.short}</div>
        </div>
      ))}
      {x !== null && y !== null && (
        <div style={{ position: "absolute", left: p(x) - size * 0.045, top: p(-y) - size * 0.045, width: size * 0.09, height: size * 0.09, borderRadius: size, background: "rgba(11,110,105,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: size * 0.05, height: size * 0.05, borderRadius: size, background: C.accent, border: `4px solid ${C.card}` }} />
        </div>
      )}
    </div>
  );
}

export function Label({ children, size = 24 }: { children: string; size?: number }) {
  return <div style={{ display: "flex", fontFamily: "Mono", fontSize: size, letterSpacing: 2, color: C.muted }}>{children.toUpperCase()}</div>;
}

/** Eixo compacto para a imagem: nome, barra com o ponto e o polo para onde a pessoa pende. */
export function AxisMini({ name, poleA, poleB, score, width }: { name: string; poleA: string; poleB: string; score: number | null; width: number }) {
  const lean = score === null ? "Sem dados" : Math.abs(score) < 10 ? "Centro" : score < 0 ? poleA : poleB;
  const pos = score === null ? null : ((score + 100) / 200) * (width - 20) + 10;
  return (
    <div style={{ display: "flex", flexDirection: "column", width, gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ display: "flex", fontFamily: "Mono", fontSize: 17, letterSpacing: 1, color: C.muted }}>{name.toUpperCase()}</div>
      </div>
      <div style={{ display: "flex", position: "relative", height: 10, borderRadius: 5, background: "#e4e0d6" }}>
        {pos !== null && <div style={{ position: "absolute", left: Math.min(width / 2, pos), top: 0, width: Math.abs(pos - width / 2), height: 10, background: "rgba(11,110,105,0.35)" }} />}
        <div style={{ position: "absolute", left: width / 2 - 2, top: -8, width: 4, height: 26, borderRadius: 2, background: "rgba(21,22,27,0.7)" }} />
        {pos !== null && <div style={{ position: "absolute", left: pos - 11, top: -6, width: 22, height: 22, borderRadius: 11, background: C.accent, border: `3px solid ${C.paper}` }} />}
      </div>
      <div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: C.ink }}>{lean}</div>
    </div>
  );
}
