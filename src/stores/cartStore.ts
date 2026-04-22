import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storefrontApiRequest, ShopifyProduct } from "@/lib/shopify";

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } } }
      userErrors { field message }
    }
  }`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } userErrors { field message } }
  }`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } }
  }`;

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

type UE = Array<{ field: string[] | null; message: string }>;
function isCartNotFound(errs: UE): boolean {
  return errs.some((e) => e.message.toLowerCase().includes("cart not found") || e.message.toLowerCase().includes("does not exist"));
}

async function createShopifyCart(item: CartItem) {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });
  if (data?.data?.cartCreate?.userErrors?.length) return null;
  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;
  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;
  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

async function addLine(cartId: string, item: CartItem) {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });
  const errs: UE = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFound(errs)) return { success: false, cartNotFound: true };
  if (errs.length) return { success: false };
  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find((l: { node: { merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: newLine?.node?.id as string | undefined };
}

async function updateLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, { cartId, lines: [{ id: lineId, quantity }] });
  const errs: UE = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFound(errs)) return { success: false, cartNotFound: true };
  return { success: errs.length === 0 };
}

async function removeLine(cartId: string, lineId: string) {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: [lineId] });
  const errs: UE = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFound(errs)) return { success: false, cartNotFound: true };
  return { success: errs.length === 0 };
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  pendingVariants: string[];
  lastAddedAt: number;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  isPending: (variantId: string) => boolean;
}

const setPending = (set: (fn: (s: CartStore) => Partial<CartStore>) => void, variantId: string, on: boolean) => {
  set((s) => ({
    pendingVariants: on
      ? [...s.pendingVariants, variantId]
      : s.pendingVariants.filter((v) => v !== variantId),
  }));
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      pendingVariants: [],
      lastAddedAt: 0,

      isPending: (variantId) => get().pendingVariants.includes(variantId),

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existing = items.find((i) => i.variantId === item.variantId);
        setPending(set, item.variantId, true);
        // Optimistic UI: bump quantity / insert immediately
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
            lastAddedAt: Date.now(),
          });
        } else {
          set({
            items: [...get().items, { ...item, lineId: null }],
            lastAddedAt: Date.now(),
          });
        }

        try {
          if (!cartId) {
            const result = await createShopifyCart({ ...item, lineId: null });
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: get().items.map((i) =>
                  i.variantId === item.variantId ? { ...i, lineId: result.lineId } : i
                ),
              });
            } else {
              // rollback
              set({ items: get().items.filter((i) => i.variantId !== item.variantId) });
            }
          } else if (existing) {
            if (!existing.lineId) return;
            const newQty = existing.quantity + item.quantity;
            const r = await updateLine(cartId, existing.lineId, newQty);
            if (!r.success) {
              if (r.cartNotFound) clearCart();
              else
                set({
                  items: get().items.map((i) =>
                    i.variantId === item.variantId ? { ...i, quantity: existing.quantity } : i
                  ),
                });
            }
          } else {
            const r = await addLine(cartId, { ...item, lineId: null });
            if (r.success) {
              set({
                items: get().items.map((i) =>
                  i.variantId === item.variantId ? { ...i, lineId: r.lineId ?? null } : i
                ),
              });
            } else {
              if (r.cartNotFound) clearCart();
              else set({ items: get().items.filter((i) => i.variantId !== item.variantId) });
            }
          }
        } finally {
          setPending(set, item.variantId, false);
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        const prevQty = item.quantity;
        // Optimistic
        set({ items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)) });
        setPending(set, variantId, true);
        try {
          const r = await updateLine(cartId, item.lineId, quantity);
          if (!r.success) {
            if (r.cartNotFound) clearCart();
            else
              set({
                items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity: prevQty } : i)),
              });
          }
        } finally {
          setPending(set, variantId, false);
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        const snapshot = items;
        // Optimistic
        const next = items.filter((i) => i.variantId !== variantId);
        set({ items: next });
        setPending(set, variantId, true);
        try {
          const r = await removeLine(cartId, item.lineId);
          if (r.success) {
            if (get().items.length === 0) clearCart();
          } else if (r.cartNotFound) {
            clearCart();
          } else {
            set({ items: snapshot });
          }
        } finally {
          setPending(set, variantId, false);
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null, pendingVariants: [] }),
      getCheckoutUrl: () => get().checkoutUrl,

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) clearCart();
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, cartId: s.cartId, checkoutUrl: s.checkoutUrl }),
    }
  )
);
