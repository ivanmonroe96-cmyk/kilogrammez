export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function normalizeWeightToken(value: string): string {
  return value.trim().toLowerCase().replace(/,/g, ".").replace(/(\d)-(\d)/g, "$1.$2");
}

export function parseWeightToGrams(value: string): number {
  const normalized = normalizeWeightToken(value);
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(kg|g|gr|mg)?/i);
  if (!match) return Number.POSITIVE_INFINITY;

  const amount = parseFloat(match[1]);
  const unit = (match[2] || "g").toLowerCase();

  if (unit === "kg") return amount * 1000;
  if (unit === "mg") return amount / 1000;
  return amount;
}

export function sortWeightOptions(options: string[]): string[] {
  return [...options].sort((left, right) => parseWeightToGrams(left) - parseWeightToGrams(right));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
