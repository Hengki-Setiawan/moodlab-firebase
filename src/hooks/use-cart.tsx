"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { CartItem } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Effect to load cart from localStorage on client-side mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const storedItems = window.localStorage.getItem('cart');
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Error reading cart from localStorage', error);
    }
  }, []);

  // Effect to save cart to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem('cart', JSON.stringify(items));
      } catch (error) {
        console.error('Error writing cart to localStorage', error);
      }
    }
  }, [items, isMounted]);

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prevItems, item];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
  
  if (!isMounted) {
      // On the server and during initial client render, don't show the count
      const emptyValue = { ...value, items: [], totalItems: 0, totalPrice: 0 };
      return <CartContext.Provider value={emptyValue}>{children}</CartContext.Provider>;
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}