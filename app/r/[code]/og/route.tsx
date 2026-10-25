import { ImageResponse } from "next/og";
import { buildResult } from "@/lib/result";
import { Brand, C, IMAGE_CACHE, Label, MapBox, fonts } from "@/lib/og";

// Prévia de link 1200×630 (WhatsApp, X, Telegram cortam imagens verticais na prévia).
export async function GET(_req: Request, { params }: RouteContext<"/r/[code]/og">) {
  const { code } = await params;
  const r = buildResult(code);
  if (!r) return new Response("Resultado inválido", { status: 404 });
  const label = r.alignment.label;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.paper, color: C.ink, padding: 56, gap: 48, fontFamily: "Inter" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Brand size={30} />
          <div style={{ display: "flex", flexDirection: "column", marginTop: 54, gap: 12 }}>
            <Label size={18}>Meu alinhamento político</Label>
            <div style={{ display: "flex", fontFamily: "Archivo", fontSize: label.length > 16 ? 46 : 66, lineHeight: 1.04 }}>{label}</div>
            <div style={{ display: "flex", fontSize: 24, color: C.muted, marginTop: 6 }}>{`Corrente: ${r.ideology.target.name} (${r.ideology.similarity}%)`}</div>
            <div style={{ display: "flex", fontSize: 24, color: C.muted }}>{`Mais parecido com: ${r.figures.map((f) => f.target.name).slice(0, 2).join(", ")}`}</div>
          </div>
          <div style={{ display: "flex", marginTop: "auto", fontFamily: "Archivo", fontSize: 26 }}>Faça o seu: perfil.arvex.dev</div>
        </div>
        <MapBox r={r} size={518} />
      </div>
    ),
    { width: 1200, height: 630, fonts: await fonts(), headers: { "Cache-Control": IMAGE_CACHE } },
  );
}
