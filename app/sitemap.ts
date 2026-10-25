import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/teste", "/teste/rapido", "/sobre"].map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "monthly" }));
}
