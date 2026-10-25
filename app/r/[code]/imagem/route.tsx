import { ImageResponse } from "next/og";
import { axes } from "@/lib/data";
import { buildResult } from "@/lib/result";

// Imagem vertical 1080×1920 (stories e status do WhatsApp), gerada a partir do código da URL. O resultado depende
// só do código, então o cache pode ser longo.
export async function GET(_req: Request, { params }: RouteContext<"/r/[code]/imagem">) {
  const { code } = await params;
  const r = buildResult(code);
  if (!r) return new Response("Resultado inválido", { status: 404 });

  const ink = "#1b1d24";
  const muted = "#5f6472";
  const accent = "#3d4ed8";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f7f7f5",
          color: ink,
          padding: "90px 80px 70px",
          fontSize: 30,
        }}
      >
        <div style={{ display: "flex", fontSize: 32, color: muted }}>Meu perfil político</div>
        <div style={{ display: "flex", fontSize: 78, fontWeight: 700, lineHeight: 1.05, marginTop: 14 }}>
          {r.ideology.target.name}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: muted, marginTop: 18 }}>
          {`Mais perto de: ${r.figures.map((f) => f.target.name).join(", ")}`}
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 60, gap: 44 }}>
          {axes.map((ax) => {
            const s = r.scores[ax.id];
            const pos = s === null ? 50 : (s + 100) / 2;
            return (
              <div key={ax.id} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 27, color: muted }}>
                  <span style={{ color: s !== null && s < -10 ? ink : muted }}>{ax.poleA}</span>
                  <span style={{ color: s !== null && s > 10 ? ink : muted }}>{ax.poleB}</span>
                </div>
                <div style={{ display: "flex", position: "relative", height: 18, marginTop: 8, borderRadius: 9, background: "#e2e3e8" }}>
                  <div style={{ position: "absolute", left: 459, top: 0, width: 2, height: 18, background: "#b9bcc6" }} />
                  {s !== null && (
                    <div
                      style={{
                        position: "absolute",
                        left: `${pos}%`,
                        top: -7,
                        width: 32,
                        height: 32,
                        marginLeft: -16,
                        borderRadius: 16,
                        background: accent,
                        border: "4px solid #f7f7f5",
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 8 }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>Faça o seu: perfil.arvex.dev</div>
          <div style={{ display: "flex", fontSize: 22, color: muted }}>
            12 eixos calibrados para o Brasil · protótipo sem validação estatística · não é recomendação de voto
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
