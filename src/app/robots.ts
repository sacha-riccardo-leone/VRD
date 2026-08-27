import type { MetadataRoute } from "next";

/**
 * Blanket disallow while this is an unapproved speculative demo.
 * See the note in app/layout.tsx before changing this.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
