# Kilogrammes Site Analysis

## Executive Summary

The current Kilogrammes website is a WordPress + WooCommerce storefront with a custom Bubble theme, Flynt-based frontend assets, and a large amount of plugin-driven client-side behavior. It already has a substantial SEO footprint, but the frontend is heavy and plugin-saturated.

Observed characteristics:

- CMS: WordPress
- Commerce engine: WooCommerce
- SEO plugin: Rank Math PRO
- Performance plugin: WP Rocket
- Theme stack: Bubble theme with Flynt assets and Tailwind output
- Tracking and growth tooling: GTM, GA4, Meta Pixel, Klaviyo, Trustpilot, Pixel Manager Pro
- Commerce extensions: multi-currency, rewards, discounts, back-in-stock notifications

The homepage HTML alone is roughly 519 KB before the browser fetches linked CSS, JS, images, and third-party scripts. This is a clear opportunity for an Astro rebuild: move most pages to static output, reduce JavaScript to small islands, self-host assets, and preserve the SEO surface while simplifying the stack.

## URL Inventory

Sitemap-derived scope:

- Static and utility pages: 21
- Product pages: 252
- Blog posts: 575
- Total confirmed XML-sitemap URLs: 848

Child sitemaps discovered:

- `post-sitemap1.xml`
- `post-sitemap2.xml`
- `page-sitemap.xml`
- `product-sitemap.xml`
- `local-sitemap.xml`

Important note: the XML sitemaps do not appear to include all taxonomy pages. Category, blog category, and some store/location pages are discoverable from the homepage and HTML sitemap and should be handled in the migration.

## Primary Page Types

### 1. Homepage

Role:

- Brand landing page
- Primary navigation hub
- Entry point into product categories
- Merchandising and campaign surface

Observed SEO:

- Title: `Cannabis Shop: Producteur & Distributeur - THC/CBD premium`
- Description present
- Canonical present
- Open Graph and Twitter metadata present
- Schema present via Rank Math

Observed issues:

- Large HTML payload
- Large quantity of CSS and JS includes
- Multiple trackers and commerce scripts in the initial document

### 2. Shop Landing Page

Representative URL:

- `/boutique-cbd/`

Role:

- Storefront landing page
- Category discovery
- Promotional merchandising

Observed SEO:

- Title and description present
- Canonical present

Observed structural issue:

- Two H1 elements were detected on the page, which should be corrected in the Astro rebuild

### 3. Product Category Archives

Representative URL:

- `/categorie-produit/fleurs-cbd/`

Observed category URLs from navigation and sitemap sources:

- `/categorie-produit/abonnements/`
- `/categorie-produit/accessoires-cbd/`
- `/categorie-produit/best-sellers/`
- `/categorie-produit/bons-plans/`
- `/categorie-produit/champignons/`
- `/categorie-produit/cosmetique-cbd/`
- `/categorie-produit/edibles-cbd/`
- `/categorie-produit/equivalent-thc/`
- `/categorie-produit/extracts-cbd/`
- `/categorie-produit/fleurs-cbd/`
- `/categorie-produit/huiles-cbd/`
- `/categorie-produit/popcorns-cbd/`
- `/categorie-produit/resine-cbd-hash-cbg-pollen/`
- `/categorie-produit/trim-cbd/`

Role:

- SEO landing pages for product families
- Catalog browsing pages
- Internal linking hubs into product detail pages

### 4. Product Detail Pages

Representative URL:

- `/produit/skywalker-og/`

Observed SEO:

- Title and description present
- Canonical present
- Product page uses image-rich media gallery
- Reviews section present

Observed asset pattern:

- Product image originals and generated thumbnails are served from `/wp-content/uploads/...`
- Product media includes multiple gallery images per item

### 5. Blog and Editorial Pages

Representative URL:

- `/cbd-anxiete-et-sommeil-ce-que-revele-une-nouvelle-etude-scientifique/`

Role:

- Large editorial SEO surface
- Top-of-funnel acquisition and internal-linking support for commerce

Observed behavior:

- Standard article template with a single H1 and multiple H2 sections
- Canonical and description present

### 6. Account, Cart, and Checkout Pages

Observed URLs:

- `/mon-compte/`
- `/panier/`
- `/commander/`

Role:

- Customer authentication and purchase flow

Migration implication:

- These pages should not be treated like simple static pages
- They either require Astro server rendering, a headless commerce checkout handoff, or continued backend ownership by WooCommerce/Shopify/another commerce platform

### 7. Support and Static Content

Observed URLs:

- `/contact/`
- `/support/`
- `/faq/`
- `/safety/`
- `/remboursements_retours/`
- `/conditions-generales-de-ventes/`
- `/rgpd/`
- `/franchise-cbd/`
- `/grossiste-cbd/`
- `/affiliation/`

Role:

- Trust, legal compliance, support, and B2B growth

### 8. Location and Store Pages

Observed URLs from homepage links:

- `/shop/amiens/`
- `/shop/cambrai/`
- `/shop/lille/`
- `/shop/saint-etienne/`
- `/shop/toulouse/`

Observed local sitemap behavior:

- `local-sitemap.xml` points to a KML file instead of normal page URLs

Migration implication:

- Local/store pages likely need manual inventory validation beyond XML sitemaps

## Navigation and Information Architecture

High-value navigation groups inferred from the homepage:

- Shop
- Blog
- Category archives
- Support and contact
- Account and cart
- B2B and affiliate pages
- Physical store pages

The current site mixes these concerns:

- Commerce browsing
- Content marketing
- Franchise/wholesale acquisition
- Customer-service pages
- Store/location discovery

The Astro rebuild should preserve that structure, but separate concerns more cleanly in layouts, data sources, and navigation models.

## SEO Review

### Strengths

- Canonical URLs are present
- Titles and descriptions are present on sampled pages
- Open Graph and Twitter metadata are present
- Schema markup is present
- The site has a large amount of content and many indexable landing pages
- XML sitemaps exist

### Weaknesses and Risks

- Homepage payload is large
- Frontend depends on many WordPress plugins and third-party scripts
- The shop landing page has more than one H1
- Cart and account pages appear in the page sitemap and should likely be `noindex`
- Category pages are not clearly represented in XML sitemaps, which can weaken discoverability
- Multi-currency currently relies on query parameters such as `?_amc-currency=EUR`, which is not ideal for clean URL strategy
- Existing schema is generic plugin-generated markup; the Astro rebuild can provide tighter, page-type-specific JSON-LD
- There is likely a large long-tail of older editorial pages that should be audited for quality, duplication, or pruning

### Immediate SEO Opportunities In Astro

- Remove plugin bloat from the initial document
- Use per-template metadata generation
- Add explicit breadcrumb schema
- Add robust product schema with offer, price, availability, and review data
- Mark cart, checkout, and account flows as `noindex, nofollow`
- Emit clean XML sitemaps for all intended indexable routes
- Standardize headings to exactly one H1 per page
- Improve internal linking between posts, categories, products, and store pages

## Asset and Media Findings

Primary asset source:

- `/wp-content/uploads/`

Observed asset types:

- Product photography
- Promotional imagery
- Brand logo SVG
- Storefront submenu imagery
- Video placeholders and possible embedded YouTube content
- Theme fonts under the current WordPress theme

Observed examples:

- Product OG image: `/wp-content/uploads/2026/03/SKYWALKER_OG_CBD_001.jpg`
- Logo: `/wp-content/uploads/2022/10/Logo_kilogrammes-1.svg`

Migration implications:

- All media should be mirrored into a controlled asset pipeline before rebuild work starts
- WordPress-generated thumbnails should not be migrated blindly; keep originals and regenerate responsive variants in Astro
- Fonts should be self-hosted under the Astro project to remove theme coupling

## Functional Dependencies To Replace Or Reconsider

Observed from markup and scripts:

- WooCommerce catalog, cart, and checkout
- Customer accounts
- Multi-currency support
- Discounts and promotions
- Loyalty and rewards
- Trustpilot widgets
- Klaviyo integration
- Cookie consent
- Analytics and marketing pixels
- Search action/schema

Migration recommendation:

- Keep only business-critical integrations
- Re-add third-party scripts with consent gating and lazy loading
- Replace plugin-based frontend behavior with small targeted components

## Recommended Migration Scope Breakdown

### Must Replicate

- Homepage
- Shop landing page
- Product category pages
- Product detail pages
- Blog index and posts
- Static trust and legal pages
- Contact/support pages
- Store/location pages
- Cart/account/checkout entry points

### Should Improve

- Metadata quality
- Schema specificity
- Heading hierarchy
- Internal linking
- Asset optimization
- JavaScript budget
- Third-party loading strategy

### Should Audit Before Rebuilding Blindly

- Thin or duplicate blog posts
- Unclear SEO landing pages with overlapping intent
- Indexed utility pages
- Currency query-string behavior
- Legacy campaign pages such as landing pages and promo pages

## Technology Recommendation Summary

Recommended target architecture:

- Astro frontend
- Headless data source for content and commerce
- Static generation for public marketing, content, category, and most product pages
- SSR or external checkout ownership for cart/account/checkout flows

Lowest-risk migration path:

- Keep WordPress and WooCommerce as backend systems temporarily
- Build Astro as the new frontend layer
- Consume content and product data through APIs
- Migrate or replace backend systems after the frontend is stable

## Open Questions

- Should the new site keep WooCommerce as the backend, or is a commerce-platform change acceptable?
- Does the rebuild need customer accounts and checkout inside Astro, or is a hosted/offloaded checkout acceptable?
- Which old blog posts should be preserved as-is, refreshed, merged, redirected, or pruned?
- Is multi-language or only French required in the rebuild?
- Are location pages managed manually, or should they become structured CMS entries?