import { ImageResponse } from "next/og";
import { buildResult } from "@/lib/result";
import { Brand, C, Label, MapBox, fonts } from "@/lib/og";

// Imagem vertical 1080×1920 para stories e status do WhatsApp. Depende só do código, então o cache é longo.
export async function GET(_req: Request, { params }: RouteContext<"/r/[code]/imagem">) {
  const { code } = await params;
  const r = buildResult(code);
  if (!r) return new Response("Resultado inválido", { status: 404 });
  const label = r.alignment.label;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.paper, color: C.ink, padding: "96px 84px 80px", fontFamily: "Inter" }}>
        <Brand size={40} />

        <div style={{ display: "flex", flexDirection: "column", marginTop: 80, gap: 18 }}>
          <Label size={26}>Meu alinhamento político</Label>
          <div style={{ display: "flex", fontFamily: "Archivo", fontSize: label.length > 16 ? 70 : 104, lineHeight: 1.02 }}>{label}</div>
          <div style={{ display: "flex", fontSize: 34, color: C.muted, lineHeight: 1.35 }}>{r.alignment.detail}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 56 }}>
          <MapBox r={r} size={740} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 56, gap: 14 }}>
          <Label size={24}>Corrente mais próxima</Label>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ display: "flex", fontFamily: "Archivo", fontSize: 50, maxWidth: 760, lineHeight: 1.08 }}>{r.ideology.target.name}</div>
            <div style={{ display: "flex", fontFamily: "Mono", fontSize: 44 }}>{`${r.ideology.similarity}%`}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 40, gap: 14 }}>
          <Label size={24}>Mais parecido com</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {r.figures.map((f) => (
              <div key={f.target.id} style={{ display: "flex", gap: 12, alignItems: "center", background: C.card, border: `2px solid ${C.line}`, borderRadius: 999, padding: "12px 24px", fontSize: 32 }}>
                <span style={{ fontWeight: 600 }}>{f.target.name}</span>
                <span style={{ fontFamily: "Mono", color: C.muted, fontSize: 28 }}>{`${f.similarity}%`}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 10 }}>
          <div style={{ display: "flex", fontFamily: "Archivo", fontSize: 40 }}>perfil.arvex.dev</div>
          <div style={{ display: "flex", fontSize: 24, color: C.muted }}>Faça o seu · 12 eixos feitos para o Brasil · não é recomendação de voto</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts: await fonts(), headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
