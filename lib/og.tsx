// Peças das imagens geradas com next/og (Satori: só flexbox e posicionamento absoluto). Fontes TTF em assets/fonts
// (OFL), lidas do disco uma vez por processo; o Dockerfile copia a pasta para a imagem.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { mapRefs, type Result } from "./result";

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
      <div style={{ position: "absolute", left: size / 2 - 1, top: pad, width: 2, height: inner, background: C.line }} />
      <div style={{ position: "absolute", left: pad, top: size / 2 - 1, width: inner, height: 2, background: C.line }} />
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
