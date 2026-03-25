# Responsive QA Checklist

Use this checklist to manually verify the storefront at these viewport widths:

- 320
- 375
- 390
- 768
- 1024
- 1440

Test in this order:

1. Homepage
2. Product page
3. Cart
4. Checkout
5. Category page
6. Delivery landing page
7. Delivery city page
8. Blog index
9. Blog article
10. Support
11. Safety
12. Contact
13. Refunds
14. RGPD

## Global Checks

Run these checks on every page:

- No horizontal page scroll.
- No clipped headings or CTA labels.
- No buttons touching viewport edges.
- No text overlapping images or other content.
- No cards with obviously broken spacing or uneven vertical rhythm.
- No images cropped in a way that hides the main subject.
- Tap targets remain usable on mobile.
- Sticky elements do not cover content.
- Drawer, overlays, and menus open and close cleanly.

## Defect Tags

Use these defect tags when reporting issues:

- `line-break`
- `whitespace`
- `card-balance`
- `image-crop`
- `button-alignment`
- `overflow`
- `tap-target`
- `sticky-overlap`
- `menu-drawer`
- `form-layout`

## Reporting Format

Use this format for each issue:

```text
Page:
Viewport:
Component:
Tag:
Issue:
Suggested fix:
```

Example:

```text
Page: /panier/
Viewport: 320
Component: cart item actions
Tag: button-alignment
Issue: remove button wraps under quantity controls and leaves awkward gap
Suggested fix: stack price and remove action vertically on smallest screens
```

## 1. Homepage

Route:

- `/`

Check these components:

- Hero title wraps cleanly without orphan words.
- Hero description has comfortable line length at 320 and 375.
- Hero image does not overpower text or push CTA too low.
- Product carousels show partial next card cleanly without clipped content.
- Carousel card widths feel intentional at 320 and 390.
- Category tiles do not create awkward empty gaps.
- Category tile labels remain readable over images.
- Brand story buttons group correctly on 320 and 375.
- Review cards do not crop author/product links poorly.
- FAQ rows do not force icon wrapping.
- SEO content block maintains readable rhythm and does not feel too dense.
- Footer newsletter form stacks cleanly and remains balanced.

## 2. Product Page

Route:

- `/produit/{slug}/`

Suggested sample products:

- `/produit/amnesia-haze-cbd/`
- `/produit/purple-haze-cbd/`

Check these components:

- Product title wraps cleanly at 320.
- Gallery image remains centered with no awkward crop.
- Thumbnail row stays aligned and tappable.
- Price block wraps cleanly when sale and regular prices are both visible.
- Quantity control stays on one logical row or stacked layout without crowding.
- Total amount block stays visually tied to quantity.
- Variation buttons wrap neatly with even spacing.
- Add-to-cart block feels balanced with quantity and price context.
- Description content does not create page overflow.
- Related products grid feels balanced on narrow screens.

## 3. Cart

Route:

- `/panier/`

Check these components:

- Cart rows stack cleanly at 320.
- Product image, title, unit price, total, quantity, and remove action all remain visible.
- Quantity controls remain tappable without accidental overlap.
- Summary CTA group has consistent spacing.
- Empty state spacing does not feel oversized.

## 4. Checkout

Route:

- `/commander/`

Check these components:

- Step indicator wraps cleanly at 320 and 375.
- Delivery cards stack with price and content aligned.
- Payment cards stack without cramping the icons.
- Card form fields remain readable and aligned.
- Inline quantity controls in summary remain usable on mobile.
- Summary prices align correctly after quantity changes.
- Sticky summary behaves correctly only on larger screens.
- Confirmation step CTA buttons group cleanly.

## 5. Category Page

Route:

- `/categorie-produit/{slug}/`

Suggested sample categories:

- `/categorie-produit/fleurs-cbd/`
- `/categorie-produit/resine-cbd-hash-cbg-pollen/`

Check these components:

- Hero title and description feel balanced on 320 and 375.
- Description HTML does not create broken wrapping.
- Product grid rhythm feels even across rows.
- No card-height imbalance that looks visually broken.

## 6. Delivery Landing Page

Route:

- `/shop/`

Check these components:

- Hero heading and intro paragraph scale properly on 320.
- Country badges wrap cleanly.
- City cards keep equal spacing and readable titles.
- Guide cards do not produce uneven heights that look broken.
- Final CTA has enough spacing below the grid.

## 7. Delivery City Page

Route:

- `/shop/{slug}/`

Suggested samples:

- `/shop/paris/`
- `/shop/livraison-cbd-rome/`

Check these components:

- Breadcrumb stays readable on 320.
- Intro content and aside card form a clean stack.
- Delivery info cards have balanced heights.
- Featured products grid does not feel cramped.
- FAQ cards remain readable and do not jump in height awkwardly.

## 8. Blog Index

Route:

- `/blog/`

Check these components:

- Card titles do not create ugly multi-line breaks.
- Excerpts clamp cleanly.
- Card image crops look intentional.
- Pagination stays usable and not overcrowded on mobile.

## 9. Blog Article

Route:

- `/blog/{slug}/`

Suggested samples:

- `/blog/comment-choisir-une-huile-cbd/`
- `/blog/resine-cbd-vs-fleur-cbd/`

Check these components:

- Article title wraps cleanly.
- Metadata row does not feel cramped.
- Featured image crop looks correct.
- Long paragraphs keep readable line length.
- Embedded tables, code, images, or iframes do not cause horizontal overflow.
- Editorial method and recommended guides sections feel balanced.

## 10. Support

Route:

- `/support/`

Check these components:

- Intro copy does not create excess whitespace.
- FAQ accordion summary rows stay aligned.
- Support CTA card has balanced spacing.

## 11. Safety

Route:

- `/safety/`

Check these components:

- Long-form prose remains readable at 320.
- Inline links do not cause awkward wrapping.
- FAQ detail rows stay aligned and readable.

## 12. Contact

Route:

- `/contact/`

Check these components:

- Name and email fields stack neatly.
- Labels and input spacing feel even.
- Submit button width feels intentional on mobile.
- No form control triggers layout shift when focused.

## 13. Refunds

Route:

- `/remboursements_retours/`

Check these components:

- Heading wraps cleanly.
- Ordered list spacing is readable on narrow screens.
- Paragraph rhythm does not look too dense.

## 14. RGPD

Route:

- `/rgpd/`

Check these components:

- Long legal heading remains balanced.
- Dense legal paragraphs keep good spacing.
- No awkward link wrapping or overflow.

## Priority Order For Fixes

If you find multiple issues, fix them in this order:

1. Overflow or hidden content
2. Broken controls or blocked actions
3. Bad image crops on core commerce pages
4. CTA/button alignment issues
5. Awkward line breaks in headings
6. Whitespace and card-balance polish