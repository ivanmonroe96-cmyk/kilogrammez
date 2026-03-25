/**
 * Client-side cart manager using localStorage.
 *
 * Cart items are stored in localStorage under `kg_cart` as a JSON array.
 * The cart count is mirrored to `kg_cart_count` for the header badge.
 *
 * This module is intended for use in <script> tags (client-side only).
 */

export interface CartItem {
  productId: number;
  name: string;
  slug: string;
  price: string;
  image: string;
  quantity: number;
  variation?: string; // e.g. "3.5g"
}

const CART_KEY = "kg_cart";
const COUNT_KEY = "kg_cart_count";

/* ------------------------------------------------------------------ */
/*  Read / Write                                                      */
/* ------------------------------------------------------------------ */

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  const total = items.reduce((sum, i) => sum + i.quantity, 0);
  localStorage.setItem(COUNT_KEY, String(total));
  // Dispatch a custom event so the header badge can react
  window.dispatchEvent(new CustomEvent("kg:cart-updated", { detail: { count: total, items } }));
}

/* ------------------------------------------------------------------ */
/*  Cart operations                                                   */
/* ------------------------------------------------------------------ */

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1): CartItem[] {
  const cart = getCart();

  const existing = cart.find(
    (c) => c.productId === item.productId && c.variation === item.variation,
  );

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...item, quantity: qty });
  }

  saveCart(cart);
  return cart;
}

export function updateQuantity(productId: number, variation: string | undefined, qty: number): CartItem[] {
  let cart = getCart();

  if (qty <= 0) {
    cart = cart.filter(
      (c) => !(c.productId === productId && c.variation === variation),
    );
  } else {
    const item = cart.find(
      (c) => c.productId === productId && c.variation === variation,
    );
    if (item) item.quantity = qty;
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: number, variation?: string): CartItem[] {
  const cart = getCart().filter(
    (c) => !(c.productId === productId && c.variation === variation),
  );
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
}
