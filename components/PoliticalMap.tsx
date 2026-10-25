// Mapa de dois eixos: economia (esquerda ↔ direita) e costumes (progressista ↔ conservador), com a pessoa e
// figuras de referência. SVG puro, renderizado no servidor.
import { mapRefs } from "@/lib/result";

const S = 320;
const P = 28;
const pos = (v: number) => P + ((v + 100) / 200) * (S - 2 * P);

export default function PoliticalMap({ x, y }: { x: number | null; y: number | null }) {
  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[380px] mx-auto block" role="img"
        aria-label={`Mapa político: você está em economia ${x ?? "sem dados"} e costumes ${y ?? "sem dados"}, de −100 a +100.`}>
        <rect x={P} y={P} width={S - 2 * P} height={S - 2 * P} rx="12" fill="var(--card)" stroke="var(--line)" />
        <line x1={S / 2} y1={P} x2={S / 2} y2={S - P} stroke="var(--muted)" strokeOpacity="0.5" />
        <line x1={P} y1={S / 2} x2={S - P} y2={S / 2} stroke="var(--muted)" strokeOpacity="0.5" />
        <text x={S / 2} y={P - 9} textAnchor="middle" fontSize="11" fill="var(--muted)">Conservador</text>
        <text x={S / 2} y={S - P + 18} textAnchor="middle" fontSize="11" fill="var(--muted)">Progressista</text>
        <text x={P - 6} y={S / 2} textAnchor="middle" fontSize="11" fill="var(--muted)" transform={`rotate(-90 ${P - 9} ${S / 2})`}>Esquerda</text>
        <text x={S - P + 9} y={S / 2} textAnchor="middle" fontSize="11" fill="var(--muted)" transform={`rotate(90 ${S - P + 9} ${S / 2})`}>Direita</text>
        {mapRefs.map((r) => (
          <g key={r.name}>
            <circle cx={pos(r.x)} cy={pos(-r.y)} r="3.5" fill="var(--muted)" opacity="0.7" />
            {/* Perto da borda direita o nome vai acima do ponto, alinhado à direita, para não sair do mapa nem colidir. */}
            <text x={pos(r.x) + (r.x > 80 ? 4 : 6)} y={pos(-r.y) + (r.x > 80 ? -7 : 3.5)} textAnchor={r.x > 80 ? "end" : "start"} fontSize="9.5" fill="var(--muted)">{r.short}</text>
          </g>
        ))}
        {x !== null && y !== null && (
          <g>
            <circle cx={pos(x)} cy={pos(-y)} r="11" fill="var(--accent)" opacity="0.18" />
            <circle cx={pos(x)} cy={pos(-y)} r="6.5" fill="var(--accent)" stroke="var(--card)" strokeWidth="2" />
            <text x={pos(x)} y={pos(-y) - 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink)">Você</text>
          </g>
        )}
      </svg>
      <figcaption className="text-xs text-muted text-center">
        Horizontal: média de economia, distribuição e trabalho. Vertical: costumes, religião, segurança e diversidade.
      </figcaption>
    </figure>
  );
}
