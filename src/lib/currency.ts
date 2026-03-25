/**
 * Client-side currency conversion utilities.
 *
 * All product prices are stored in EUR. When a user selects a different
 * currency via the CurrencySwitcher, we convert on-the-fly using fixed
 * exchange rates (updated periodically).
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;   // 1 EUR = rate units of this currency
  locale: string; // for Intl.NumberFormat
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  EUR: { code: "EUR", symbol: "€",  rate: 1,     locale: "fr-FR" },
  CZK: { code: "CZK", symbol: "Kč", rate: 25.30, locale: "cs-CZ" },
  PLN: { code: "PLN", symbol: "zł", rate: 4.28,  locale: "pl-PL" },
  SEK: { code: "SEK", symbol: "kr", rate: 11.20, locale: "sv-SE" },
};

/** Get the currently selected currency code from localStorage */
export function getActiveCurrency(): CurrencyInfo {
  try {
    const raw = localStorage.getItem("kg_currency");
    if (raw) {
      const { code } = JSON.parse(raw);
      if (code && CURRENCIES[code]) return CURRENCIES[code];
    }
  } catch {}
  return CURRENCIES.EUR;
}

/** Convert EUR price to the target currency */
export function convertPrice(eurPrice: number, currency?: CurrencyInfo): number {
  const cur = currency ?? getActiveCurrency();
  return eurPrice * cur.rate;
}

/** Format a price in the given (or active) currency */
export function formatPrice(eurPrice: number, currency?: CurrencyInfo): string {
  const cur = currency ?? getActiveCurrency();
  const converted = eurPrice * cur.rate;
  return new Intl.NumberFormat(cur.locale, {
    style: "currency",
    currency: cur.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
}

/**
 * Apply currency conversion to all elements with [data-price-eur].
 * Each element should have: data-price-eur="12.50"
 * The element's textContent will be replaced with the formatted price.
 */
export function updateAllPrices(): void {
  const cur = getActiveCurrency();
  document.querySelectorAll<HTMLElement>("[data-price-eur]").forEach((el) => {
    const eur = parseFloat(el.dataset.priceEur || "0");
    el.textContent = formatPrice(eur, cur);
  });
}
