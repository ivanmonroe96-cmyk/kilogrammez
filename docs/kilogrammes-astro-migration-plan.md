# Kilogrammes Astro Migration Plan

## Recommended Strategy

Rebuild Kilogrammes as an Astro-first frontend with server-rendered or offloaded commerce flows, while preserving the current URL structure wherever possible.

Preferred implementation path:

- Astro for the public website
- Headless WordPress for editorial content during phase 1
- Headless WooCommerce for products, pricing, cart, and customer data during phase 1
- A later optional phase to migrate content or commerce away from WordPress/WooCommerce if desired

This approach minimizes business risk because it preserves the existing product and content source systems while replacing the slow frontend.

## Goals

- Match the existing site closely in layout, page hierarchy, and merchandising
- Improve SEO hygiene and Core Web Vitals
- Reduce HTML, CSS, and JS overhead
- Preserve valuable URLs and rankings
- Build a maintainable component system instead of plugin-driven templates

## Architecture Overview

### Rendering Strategy

Use Astro in hybrid mode:

- Static prerender for homepage, static pages, blog posts, category pages, and product pages where possible
- Server rendering only for pages that require live session state or customer-specific data

Recommended route behavior:

- Prerendered: homepage, blog, posts, categories, products, legal pages, support pages, location pages
- SSR or edge-rendered: cart, account, checkout, search results if personalized

If the team wants the simplest frontend architecture, offload cart and checkout to the commerce backend while keeping the rest static.

## Project Structure

Recommended Astro structure:

```text
src/
  assets/
    fonts/
    icons/
    images/
  components/
    account/
    blog/
    cart/
    commerce/
    home/
    layout/
    location/
    seo/
    shop/
    ui/
  content/
    config.ts
  data/
    navigation/
    settings/
  layouts/
    BaseLayout.astro
    MarketingLayout.astro
    ShopLayout.astro
    ArticleLayout.astro
  lib/
    api/
      wordpress.ts
      woocommerce.ts
    seo/
      metadata.ts
      schema.ts
    utils/
      currency.ts
      urls.ts
  pages/
    index.astro
    blog/
      index.astro
      [slug].astro
    categorie-produit/
      [slug].astro
    produit/
      [slug].astro
    shop/
      [slug].astro
    boutique-cbd.astro
    contact.astro
    support.astro
    faq.astro
    safety.astro
    franchise-cbd.astro
    grossiste-cbd.astro
    affiliation.astro
    panier.astro
    commander.astro
    mon-compte.astro
    [...slug].astro
  styles/
    tokens.css
    global.css
    prose.css
public/
  favicon/
  robots.txt
  redirects.txt
scripts/
```

## Component Breakdown

### Layout Components

- `BaseLayout.astro`: global shell, metadata, fonts, analytics bootstrap, consent hooks
- `MarketingLayout.astro`: marketing pages and homepage
- `ShopLayout.astro`: catalog and product templates
- `ArticleLayout.astro`: blog/article pages with prose styling and article schema

### Reusable UI Components

- Header
- MegaNav
- Footer
- Breadcrumbs
- AnnouncementBar
- SectionHeader
- CTAButton
- RichTextRenderer
- TrustSignals
- ReviewSummary
- Pagination
- SEOHead

### Homepage Components

- Hero
- FeaturedCategories
- FeaturedProducts
- ValueProps
- BrandStory
- ReviewsStrip
- BlogHighlights
- NewsletterSignup
- StoreLocatorTeaser

### Catalog Components

- ProductGrid
- ProductCard
- CategoryHero
- CategoryFilters
- SortControl
- PriceBadge
- PromoBanner

### Product Components

- ProductGallery
- ProductInfo
- VariantSelector
- QuantitySelector
- AddToCart
- ProductAccordion
- ProductIngredients
- ProductReviews
- RelatedProducts
- ProductSchema

### Content Components

- ArticleHero
- ArticleMeta
- ArticleTOC
- ArticleContent
- RelatedArticles
- FAQBlock

### Store and Support Components

- StoreCard
- StoreDetail
- StoreMap
- SupportCard
- ContactForm

### Interactive Islands Only Where Needed

- Add-to-cart
- Cart drawer or mini-cart
- Currency switcher
- Account forms
- Search and filters if kept client-driven
- Newsletter form
- Review widgets

Everything else should render as static HTML.

## Data and Content Strategy

### Phase 1 Recommendation

Keep existing backend systems and expose data to Astro:

- WordPress for posts, pages, and possibly locations
- WooCommerce for catalog, pricing, inventory, cart, and checkout

Recommended API layer:

- WordPress REST API or WPGraphQL for content
- WooCommerce Store API or custom backend endpoints for commerce data

### Optional Phase 2

After launch stabilization:

- Move editorial content to a dedicated headless CMS such as Sanity or Storyblok if the team wants better editorial workflows
- Move commerce to Shopify, Medusa, Saleor, or keep WooCommerce if operationally preferred

### Content Models To Normalize

- `page`
- `post`
- `product`
- `productCategory`
- `blogCategory`
- `location`
- `siteSettings`
- `navigationMenu`
- `promotion`

### Product Data Requirements

Each product page should support:

- Name
- Slug
- Category membership
- Price and sale price
- Currency
- Availability
- SKU
- Description and specifications
- Gallery images
- SEO title and description overrides
- Related products
- Review aggregate
- Structured data fields

## Routing Plan

Preserve current route patterns whenever possible:

- `/`
- `/boutique-cbd/`
- `/blog/`
- `/produit/[slug]/`
- `/categorie-produit/[slug]/`
- `/<blog-post-slug>/`
- `/shop/[slug]/`
- Existing static pages at the same slugs

Use `301` redirects only when a page is intentionally merged, removed, or renamed.

### Dynamic Generation

Generate at build time from source APIs:

- Products
- Product categories
- Blog posts
- Blog categories if they stay public
- Store/location pages

### Catch-All Handling

Use a controlled fallback route for migration safety:

- `src/pages/[...slug].astro`

Purpose:

- Graceful handling of unmapped legacy URLs during the migration period
- Logging for missed routes
- Optional redirect lookup against a redirect manifest

## SEO Implementation Plan

### Metadata

Every route gets explicit metadata:

- Title
- Description
- Canonical
- Open Graph fields
- Twitter card fields
- Robots directives

### Schema

Use template-specific JSON-LD:

- `Organization`
- `WebSite`
- `BreadcrumbList`
- `Article` for blog posts
- `Product` with `Offer` and `AggregateRating` for product pages
- `FAQPage` where appropriate
- `LocalBusiness` for store pages

### Heading and Accessibility Rules

- Exactly one H1 per page
- Sequential heading hierarchy
- Descriptive alt text for meaningful images
- Keyboard-usable navigation and controls
- Visible focus states
- Semantic landmarks for header, nav, main, and footer

### Indexation Rules

Index:

- Homepage
- Category pages
- Product pages
- Blog index and blog posts
- Support and trust pages that serve SEO or user intent
- Store pages

Noindex:

- Cart
- Checkout
- Account pages
- Internal search results if thin or duplicate
- Any preview or temporary landing pages not meant for search

### Internal Linking

Add systematic linking between:

- Product categories and products
- Blog posts and products
- Blog posts and category pages
- Store pages and local-intent content
- Support content and transactional pages

### Sitemap Strategy

Generate first-party sitemaps from Astro build output:

- Static pages sitemap
- Products sitemap
- Categories sitemap
- Posts sitemap
- Locations sitemap

## Performance Plan

### Core Improvements

- Remove jQuery and plugin-driven frontend scripts from public pages
- Use Astro islands only where interactivity is required
- Self-host fonts and subset them
- Convert large images to modern formats and generate responsive sizes
- Eliminate WordPress theme CSS and plugin CSS dependencies from the frontend
- Defer or gate all analytics and marketing scripts behind consent where applicable

### Core Web Vitals Targets

- LCP under 2.5 seconds on major landing pages
- INP under 200 ms for key interactions
- CLS under 0.1

### Astro Best Practices To Apply

- Use `astro:assets` for image optimization
- Prefer static generation to server rendering whenever possible
- Keep client directives narrow and intentional
- Use route-level code splitting by default
- Load third-party widgets on user intent or after main content render

## Design Replication Approach

The goal is visual parity, not theme-code parity.

Approach:

- Extract typography, spacing, color, and grid patterns from the existing site
- Rebuild them as design tokens and reusable Astro components
- Mirror the current merchandising layout and navigation flow
- Keep the visual identity and recognizable composition, but implement it with clean CSS and minimal JavaScript

Do not port WordPress theme markup verbatim. Reconstruct the interface from audited design patterns.

## Asset Extraction Plan

### What To Capture

- Original product images
- Collection/category imagery
- Brand assets including logo and icons
- Location imagery if present
- Blog and editorial media
- Fonts currently used by the live site

### Asset Workflow

1. Export URL inventory from sitemaps.
2. Download HTML snapshots of all indexable pages.
3. Extract media URLs from the HTML.
4. Download original assets into a mirrored archive.
5. Remove WordPress thumbnail duplicates where originals exist.
6. Rebuild responsive derivatives during the Astro implementation.

The included script in `scripts/extract-kilogrammes-assets.sh` is designed for this phase.

## Migration Phases

### Phase 0. Discovery and Freeze

- Confirm backend decision
- Freeze URL strategy
- Export full content and asset inventory
- Identify pages to keep, merge, redirect, or noindex

### Phase 1. Foundation

- Initialize Astro project
- Implement global layout, design tokens, header, footer, and SEO utilities
- Configure content and commerce API clients
- Create redirect and sitemap generation pipelines

### Phase 2. Core Templates

- Homepage
- Static page template
- Product category template
- Product detail template
- Blog index and article template
- Store/location template

### Phase 3. Commerce Flows

- Cart behavior
- Account pages
- Checkout handoff or SSR flow
- Currency switching
- Promotions and discount behavior

### Phase 4. SEO Hardening

- Metadata parity checks
- Schema rollout
- Redirect verification
- Crawl validation
- Internal linking refinement

### Phase 5. Launch

- Staging crawl and QA
- Analytics and consent validation
- Performance testing
- Production deploy
- Post-launch monitoring

## QA and Acceptance Criteria

The migration should be considered complete when:

- Public URLs are either preserved or cleanly redirected
- The new pages visually match the current site closely
- Product, category, and blog templates are fully populated from source data
- Metadata parity is achieved or improved on key pages
- Cart/account/checkout flows work end-to-end
- Sitemaps and robots rules are correct
- Lighthouse and Core Web Vitals improve materially versus the current site

## Hosting Recommendation

### Recommended Options

- Vercel: strong default choice for Astro hybrid rendering and preview workflows
- Netlify: good alternative with solid build and edge support
- Cloudflare Pages: strong performance option if the team prefers edge-first deployment and can validate all runtime integrations

### Preferred Choice

If checkout and account flows require SSR or API proxying, choose Vercel or Netlify first for lower integration risk.

### CDN and Assets

- Serve optimized images through the hosting platform or a dedicated image CDN
- Use immutable caching for versioned assets
- Keep redirects and headers under version control

## Build and Deployment Workflow

1. Build Astro on every pull request.
2. Run type checks, linting, and route validation.
3. Run a crawl diff against the legacy site for key URLs.
4. Publish preview deployments for stakeholder review.
5. Deploy to production after redirect and SEO verification.
6. Submit the new sitemaps to search engines.
7. Monitor crawl errors, rankings, and conversion funnels.

## Recommended Next Build Package

The first implementation milestone should include:

- Astro project bootstrap
- Global layout and design system tokens
- Homepage
- One product category template
- One product detail template
- Blog article template
- Shared SEO utilities
- Asset ingestion pipeline

That package de-risks the architecture before the remaining 800+ URLs are migrated.