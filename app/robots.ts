import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Resultados e convites (/r, /comparar) ficam fora dos buscadores pelo noindex de cada página, não por Disallow: o
// robots.txt bloquearia também os robôs de prévia de link (X, Telegram) de ler as meta tags.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` };
}
