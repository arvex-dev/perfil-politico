import { ImageResponse } from "next/og";
import { Brand, C, Label, fonts } from "@/lib/og";

// Prévia de link da home (e das páginas sem imagem própria).
export const alt = "Perfil Político: onde você está na política brasileira?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.paper, color: C.ink, padding: 64, fontFamily: "Inter" }}>
        <Brand size={34} />
        <div style={{ display: "flex", fontFamily: "Archivo", fontSize: 76, lineHeight: 1.02, marginTop: 64, maxWidth: 980 }}>
          Onde você está na política brasileira?
        </div>
        <div style={{ display: "flex", fontSize: 30, color: C.muted, marginTop: 28 }}>
          12 eixos feitos para o Brasil · alinhamento, corrente e figuras mais parecidas
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
          <Label size={20}>Sem cadastro · nada fica guardado · código aberto</Label>
          <div style={{ display: "flex", fontFamily: "Archivo", fontSize: 30 }}>perfil.arvex.dev</div>
        </div>
      </div>
    ),
    { ...size, fonts: await fonts() },
  );
}
