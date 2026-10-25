import type { MetadataRoute } from "next";
import { ideologies } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/teste", "/teste/rapido", "/sobre", "/correntes", ...ideologies.map((i) => `/correntes/${i.id}`)];
  return pages.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "monthly", priority: path === "/" ? 1 : 0.6 }));
}
