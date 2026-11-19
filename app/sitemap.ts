import type { MetadataRoute } from "next";

const siteUrl = "https://motion-designer-tau.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/work`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
