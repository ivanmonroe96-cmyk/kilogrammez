const SITE_URL = "https://kilogrammes.com";
const SITE_NAME = "Kilogrammes";
const LOGO_URL = `${SITE_URL}/images/logo-kilogrammes.svg`;

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
      contentUrl: LOGO_URL,
    },
    description: "Kilogrammes est le leader européen du cannabis légal et récréatif depuis 2016. Producteur et distributeur de CBD premium : fleurs, hash, huiles, edibles et accessoires.",
    foundingDate: "2016",
    sameAs: [
      "https://www.instagram.com/kilogrammes__/",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Dělnická 776/5",
      addressLocality: "Prague 7 - Holešovice",
      addressRegion: "Prague",
      postalCode: "170 00",
      addressCountry: "CZ",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["French", "English"],
      url: `${SITE_URL}/contact/`,
    },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "fr-FR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?s={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  url: string;
  description: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}) {
  return {
    "@type": "Article",
    headline: opts.title,
    url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    description: opts.description,
    ...(opts.image && { image: opts.image }),
    ...(opts.publishedTime && { datePublished: opts.publishedTime }),
    ...(opts.modifiedTime && { dateModified: opts.modifiedTime }),
    ...(opts.author && {
      author: { "@type": "Person", name: opts.author },
    }),
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "fr-FR",
  };
}

export function productSchema(opts: {
  name: string;
  url: string;
  description: string;
  image?: string;
  sku?: string;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  ratingValue?: number;
  reviewCount?: number;
}) {
  const schema: Record<string, unknown> = {
    "@type": "Product",
    name: opts.name,
    url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    description: opts.description,
    ...(opts.image && { image: opts.image }),
    ...(opts.sku && { sku: opts.sku }),
    offers: {
      "@type": "Offer",
      price: opts.price,
      priceCurrency: opts.currency ?? "EUR",
      availability: `https://schema.org/${opts.availability ?? "InStock"}`,
      url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    },
  };

  if (opts.ratingValue && opts.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: opts.ratingValue,
      reviewCount: opts.reviewCount,
    };
  }

  return schema;
}

export function localBusinessSchema(opts: {
  name: string;
  url: string;
  address: string;
  city: string;
  postalCode?: string;
  image?: string;
}) {
  return {
    "@type": "LocalBusiness",
    name: opts.name,
    url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    ...(opts.image && { image: opts.image }),
    address: {
      "@type": "PostalAddress",
      streetAddress: opts.address,
      addressLocality: opts.city,
      ...(opts.postalCode && { postalCode: opts.postalCode }),
    },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function collectionPageSchema(opts: {
  name: string;
  url: string;
  description: string;
  image?: string;
  numberOfItems?: number;
}) {
  return {
    "@type": "CollectionPage",
    name: opts.name,
    url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    description: opts.description,
    ...(opts.image && { image: opts.image }),
    ...(opts.numberOfItems && { numberOfItems: opts.numberOfItems }),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "fr-FR",
  };
}

export function buildJsonLd(schemas: Record<string, unknown>[]) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": schemas,
  });
}
