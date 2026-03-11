import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/components/ProductCard'

export interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    isOpen: boolean;
    toggleCart: () => void;
    getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            toggleCart: () => set({ isOpen: !get().isOpen }),

            addItem: (product) => {
                set((state) => {
                    const existingItem = state.items.find((item) => item.id === product.id);
                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                            isOpen: true, // Ouvre le tiroir quand on ajoute
                        };
                    }
                    return {
                        items: [...state.items, { ...product, quantity: 1 }],
                        isOpen: true,
                    };
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== productId),
                }));
            },

            updateQuantity: (productId, quantity) => {
                set((state) => ({
                    items: quantity > 0
                        ? state.items.map((item) =>
                            item.id === productId ? { ...item, quantity } : item
                        )
                        : state.items.filter((item) => item.id !== productId)
                }));
            },

            clearCart: () => set({ items: [] }),

            getCartTotal: () => {
                return get().items.reduce(
                    (total, item) => total + item.priceDZD * item.quantity,
                    0
                );
            },
        }),
        {
            name: 'soukdz-cart', // Clé dans le localStorage
        }
    )
);
