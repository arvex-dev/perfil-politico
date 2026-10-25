import { ImageResponse } from "next/og";
import { axes } from "@/lib/data";
import { buildResult } from "@/lib/result";
import { AxisMini, Brand, C, Label, MapBox, cachedPng, fonts, imageKey } from "@/lib/og";

// Imagem vertical 1080×1920 para stories e status do WhatsApp: alinhamento em destaque, mapa, corrente, figuras e os
// 12 eixos em grade. Depende só do código e de IMAGE_VERSION (na URL).
export async function GET(_req: Request, { params }: RouteContext<"/r/[code]/imagem">) {
  const { code } = await params;
  const r = buildResult(code);
  if (!r) return new Response("Resultado inválido", { status: 404 });
  const label = r.alignment.label;
  const colW = (1080 - 2 * 76 - 48) / 2;

  return cachedPng(imageKey("imagem", r.scores, r.mode), async () => new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.paper, color: C.ink, padding: "84px 76px 64px", fontFamily: "Inter" }}>
        <Brand size={36} />

        <div style={{ display: "flex", gap: 36, marginTop: 56, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 14 }}>
            <Label size={22}>Meu alinhamento político</Label>
            <div style={{ display: "flex", fontFamily: "Archivo", fontSize: label.length > 16 ? 54 : 78, lineHeight: 1.02 }}>{label}</div>
            <div style={{ display: "flex", fontSize: 26, color: C.muted, lineHeight: 1.35 }}>{r.alignment.detail}</div>
          </div>
          <MapBox r={r} size={440} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 40, padding: "28px 32px", background: C.card, border: `2px solid ${C.line}`, borderRadius: 28, gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Label size={18}>Corrente mais próxima</Label>
              <div style={{ display: "flex", fontFamily: "Archivo", fontSize: 40, lineHeight: 1.08, maxWidth: 720 }}>{r.ideology.target.name}</div>
            </div>
            <div style={{ display: "flex", fontFamily: "Mono", fontSize: 40 }}>{`${r.ideology.similarity}%`}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Label size={18}>Mais parecido com</Label>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 600 }}>{r.figures.map((f) => f.target.name).join(" · ")}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 44, gap: 22 }}>
          <Label size={20}>Meus 12 eixos</Label>
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: 48, rowGap: 40 }}>
            {axes.map((ax) => (
              <AxisMini key={ax.id} name={ax.name} poleA={ax.poleA} poleB={ax.poleB} score={r.scores[ax.id]} width={colW} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
          <div style={{ display: "flex", fontFamily: "Archivo", fontSize: 36 }}>perfilpolitico.arvex.dev</div>
          <div style={{ display: "flex", fontSize: 20, color: C.muted }}>Faça o seu · não é recomendação de voto</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts: await fonts(), },
  ));
}
