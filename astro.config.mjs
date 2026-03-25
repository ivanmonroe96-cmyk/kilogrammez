import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

const NON_CANONICAL_SITEMAP_PATHS = new Set([
  "/affiliation/",
  "/commander/",
  "/conditions-generales-de-ventes/",
  "/contact/",
  "/grossiste-cbd/",
  "/kilogramme-shop/",
  "/mon-compte/",
  "/panier/",
  "/processus-editorial/",
  "/remboursements_retours/",
  "/rgpd/",
  "/safety/",
  "/support/",
]);

export default defineConfig({
  site: "https://kilogramme-shop.com",
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => {
        const pathname = new URL(page, "https://kilogramme-shop.com").pathname;
        const normalizedPath = pathname.endsWith("/") ? pathname : `${pathname}/`;

        return (
          !page.includes("/panier") &&
          !page.includes("/commander") &&
          !page.includes("/mon-compte") &&
          !NON_CANONICAL_SITEMAP_PATHS.has(normalizedPath)
        );
      },
    }),
  ],
  i18n: {
    defaultLocale: "fr",
    locales: ["fr"],
  },
  image: {
    domains: ["kilogramme-shop.com"],
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
