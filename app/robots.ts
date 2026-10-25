import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Resultados e convites (/r, /comparar) são pessoais: fora dos buscadores.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/r/", "/comparar/"] }, sitemap: `${SITE_URL}/sitemap.xml` };
}
