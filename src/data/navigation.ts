import { getCategoryUrl, staticPageSlugs } from "@lib/seo/focusKeywords";

export const mainNav = [
  {
    label: "Shop",
    href: "/boutique-cbd/",
    children: [
      { label: "Fleurs CBD", href: getCategoryUrl({ slug: "fleurs-cbd", name: "Fleurs CBD" }) },
      { label: "Hash", href: getCategoryUrl({ slug: "resine-cbd-hash-cbg-pollen", name: "Hash CBD" }) },
      { label: "SIMILI-THC", href: getCategoryUrl({ slug: "equivalent-thc", name: "Simili-THC" }) },
      { label: "Extracts", href: getCategoryUrl({ slug: "extracts-cbd", name: "Extracts CBD" }) },
      { label: "Trim", href: getCategoryUrl({ slug: "trim-cbd", name: "Trim CBD" }) },
      { label: "Popcorn", href: getCategoryUrl({ slug: "popcorns-cbd", name: "Popcorn CBD" }) },
      { label: "Edibles", href: getCategoryUrl({ slug: "edibles-cbd", name: "Edibles CBD" }) },
      { label: "Cosmétiques", href: getCategoryUrl({ slug: "cosmetique-cbd", name: "Cosmétiques CBD" }) },
      { label: "Accessoires", href: getCategoryUrl({ slug: "accessoires-cbd", name: "Accessoires CBD" }) },
      { label: "Huiles CBD", href: getCategoryUrl({ slug: "huiles-cbd", name: "Huiles CBD" }) },
      { label: "Champignons", href: getCategoryUrl({ slug: "champignons", name: "Champignons" }) },
      { label: "Bons plans", href: getCategoryUrl({ slug: "bons-plans", name: "Bons Plans" }), highlight: true },
    ],
  },
  { label: "Abonnements", href: getCategoryUrl({ slug: "abonnements", name: "Abonnements" }) },
  { label: "Blog", href: "/blog/" },
  { label: "Contact", href: `/${staticPageSlugs.contact}/` },
  { label: "Pro", href: "https://b2b.kilogramme-shop.com/", external: true },
  { label: "Franchise", href: "/franchise-cbd/" },
] as const;

export const footerNav = {
  company: [
    { label: "Support", href: `/${staticPageSlugs.support}/` },
    { label: "Affiliation", href: `/${staticPageSlugs.affiliation}/` },
    { label: "Ouvrir un shop", href: "/franchise-cbd/" },
    { label: "B2B", href: `/${staticPageSlugs.wholesale}/` },
  ],
  trust: [
    { label: "Safety", href: `/${staticPageSlugs.safety}/` },
    { label: "Processus éditorial", href: `/${staticPageSlugs.editorial}/` },
    { label: "Contact", href: `/${staticPageSlugs.contact}/` },
    { label: "Livraison Europe", href: `/${staticPageSlugs.delivery}/` },
  ],
  legal: [
    { label: "CGV", href: "/conditions-generales-de-ventes/" },
    { label: "RGPD", href: "/rgpd/" },
    { label: "Remboursements", href: "/remboursements_retours/" },
    { label: "Safety", href: `/${staticPageSlugs.safety}/` },
  ],
  categories: [
    { label: "Fleurs CBD", href: getCategoryUrl({ slug: "fleurs-cbd", name: "Fleurs CBD" }) },
    { label: "Hash CBD", href: getCategoryUrl({ slug: "resine-cbd-hash-cbg-pollen", name: "Hash CBD" }) },
    { label: "Huiles CBD", href: getCategoryUrl({ slug: "huiles-cbd", name: "Huiles CBD" }) },
    { label: "Edibles", href: getCategoryUrl({ slug: "edibles-cbd", name: "Edibles CBD" }) },
    { label: "Best Sellers", href: getCategoryUrl({ slug: "best-sellers", name: "Best Sellers" }) },
  ],
  guides: [
    { label: "Choisir un grossiste CBD", href: "/blog/comment-choisir-un-grossiste-cbd/" },
    { label: "Comprendre le trim CBD", href: "/blog/quest-ce-que-le-trim-cbd/" },
    { label: "Différence THC et THCP", href: "/blog/difference-entre-thc-et-thcp/" },
    { label: "Amnesia Haze CBD", href: "/blog/amnesia-haze-cbd-effets-aromes-differences/" },
    { label: "CBD en Italie : est-ce légal ?", href: "/blog/cbd-est-il-legal-en-italie/" },
    { label: "Comment choisir une huile CBD", href: "/blog/comment-choisir-une-huile-cbd/" },
    { label: "Résine CBD vs fleur CBD", href: "/blog/resine-cbd-vs-fleur-cbd/" },
  ],
  social: {
    instagram: "https://www.instagram.com/kilogrammes__/",
  },
} as const;

export interface DeliveryLocation {
  name: string;
  slug: string;
  country: string;
  countryCode: string;
  description: string;
}

export const deliveryCountries = [
  { name: "France", code: "FR", flag: "🇫🇷" },
  { name: "Belgique", code: "BE", flag: "🇧🇪" },
  { name: "Suisse", code: "CH", flag: "🇨🇭" },
  { name: "Luxembourg", code: "LU", flag: "🇱🇺" },
  { name: "Monaco", code: "MC", flag: "🇲🇨" },
  { name: "Italie", code: "IT", flag: "🇮🇹" },
] as const;

export const deliveryLocations: DeliveryLocation[] = [
  { name: "Paris", slug: "paris", country: "France", countryCode: "FR", description: "Livraison CBD à Paris et en Île-de-France. Commandez en ligne et recevez vos produits CBD premium directement chez vous." },
  { name: "Marseille", slug: "marseille", country: "France", countryCode: "FR", description: "Livraison CBD à Marseille et dans les Bouches-du-Rhône. Produits CBD de qualité livrés rapidement à votre porte." },
  { name: "Lyon", slug: "lyon", country: "France", countryCode: "FR", description: "Livraison CBD à Lyon et dans le Rhône. Fleurs, hash, huiles et edibles CBD livrés chez vous." },
  { name: "Bruxelles", slug: "bruxelles", country: "Belgique", countryCode: "BE", description: "Livraison CBD à Bruxelles et en Belgique. Votre dispensaire en ligne préféré livre directement chez vous." },
  { name: "Anvers", slug: "anvers", country: "Belgique", countryCode: "BE", description: "Livraison CBD à Anvers. Commandez vos produits CBD premium et recevez-les rapidement en Belgique." },
  { name: "Genève", slug: "geneve", country: "Suisse", countryCode: "CH", description: "Livraison CBD à Genève et en Suisse romande. Produits CBD premium livrés directement à votre domicile." },
  { name: "Zurich", slug: "zurich", country: "Suisse", countryCode: "CH", description: "Livraison CBD à Zurich. Commandez en ligne et recevez vos produits CBD de qualité en Suisse." },
  { name: "Bâle", slug: "bale", country: "Suisse", countryCode: "CH", description: "Livraison CBD à Bâle. Fleurs, résines et huiles CBD premium livrés chez vous en Suisse." },
  { name: "Berne", slug: "berne", country: "Suisse", countryCode: "CH", description: "Livraison CBD à Berne et dans le canton. Votre dispensaire en ligne favori livre dans toute la Suisse." },
  { name: "Rome", slug: "rome", country: "Italie", countryCode: "IT", description: "Consegna CBD a Roma. Ordina online e ricevi i migliori prodotti CBD direttamente a casa tua." },
  { name: "Milan", slug: "milan", country: "Italie", countryCode: "IT", description: "Consegna CBD a Milano. Prodotti CBD premium consegnati rapidamente a domicilio." },
  { name: "Bologne", slug: "bologne", country: "Italie", countryCode: "IT", description: "Consegna CBD a Bologna. Fiori, hash, oli CBD di qualità consegnati a casa tua." },
  { name: "Luxembourg", slug: "luxembourg", country: "Luxembourg", countryCode: "LU", description: "Livraison CBD à Luxembourg-Ville et au Grand-Duché. Produits CBD premium livrés chez vous." },
  { name: "Monaco", slug: "monaco", country: "Monaco", countryCode: "MC", description: "Livraison CBD à Monaco. Produits CBD de qualité premium livrés directement à votre domicile." },
];
