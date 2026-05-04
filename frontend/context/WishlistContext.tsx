'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlist: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Sync wishlist from user data
  useEffect(() => {
    if (user?.wishlist) {
      setWishlist(user.wishlist);
    } else {
      setWishlist([]);
    }
  }, [user]);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        toast.error('Please login to save to wishlist');
        return;
      }

      try {
        const res = await authAPI.toggleWishlist(productId);
        setWishlist(res.data.wishlist);
        const action = res.data.message.includes('added') ? 'added to' : 'removed from';
        toast.success(`Product ${action} wishlist ♡`);
      } catch {
        toast.error('Failed to update wishlist');
      }
    },
    [isAuthenticated]
  );

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
