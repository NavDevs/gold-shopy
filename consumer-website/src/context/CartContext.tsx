'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartApi, wishlistApi } from '@/lib/api';
import { getCartItems, getWishlistItems, runTests } from '@/lib/cartUtils';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  material: string;
  quantity: number;
}

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  material: string;
  rating: number;
}

interface CartContextType {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  getCartCount: () => number;
  getWishlistCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to validate cart items
const isValidCartItem = (item: any): item is CartItem => {
  return (
    item &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    item.name.trim() !== '' &&
    typeof item.price === 'number' &&
    item.price > 0 &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
};

// Helper function to validate wishlist items
const isValidWishlistItem = (item: any): item is WishlistItem => {
  return (
    item &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    item.name.trim() !== '' &&
    typeof item.price === 'number' &&
    item.price > 0
  );
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Get cart count
  const getCartCount = (): number => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Get wishlist count
  const getWishlistCount = (): number => {
    return wishlistItems.length;
  };

  // Refresh cart from API or localStorage
  const refreshCart = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Refreshing cart, isAuthenticated:', isAuthenticated, 'user:', user);
      if (isAuthenticated && user?.token) {
        // User is authenticated, fetch from API
        try {
          const response = await cartApi.getCart(user.token);
          console.log('Cart API response:', response);
          
          // Handle different response formats
          let cartData: any = response;
          if (response.cart) {
            cartData = response.cart;
          } else if (response.data) {
            cartData = response.data;
          }
          
          // Process items to ensure correct format
          let items: CartItem[] = [];
          if (Array.isArray(cartData)) {
            // Filter out invalid items
            items = cartData.filter(isValidCartItem);
          } else if (cartData.items && Array.isArray(cartData.items)) {
            // Transform items from API format to our format
            items = cartData.items
              .map((item: any) => {
                // Handle different API response formats
                const productId = item.productId?._id || item.productId?.id || item.productId;
                const productName = item.productId?.name || item.name || 'Unknown Product';
                const productPrice = item.productId?.price || item.price || 0;
                const productImage = item.productId?.image || item.image || '';
                const productCategory = item.productId?.category || item.category || 'Jewelry';
                const productMaterial = item.productId?.material || item.material || 'Gold';
                
                return {
                  id: typeof productId === 'string' ? parseInt(productId) : productId,
                  name: productName,
                  price: productPrice,
                  image: productImage,
                  category: productCategory,
                  material: productMaterial,
                  quantity: item.quantity || 1
                };
              })
              .filter(isValidCartItem); // Filter out invalid items after transformation
          }
          
          console.log('Processed cart items:', items);
          setCartItems(items);
        } catch (apiError) {
          console.error('Failed to fetch cart from API, falling back to localStorage:', apiError);
          // Fallback to localStorage with validation
          const localStorageItems = getCartItems().filter(isValidCartItem);
          setCartItems(localStorageItems);
        }
      } else {
        // User not authenticated, use localStorage
        console.log('User not authenticated, using localStorage for cart');
        const localStorageItems = getCartItems().filter(isValidCartItem);
        setCartItems(localStorageItems);
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh wishlist from API or localStorage
  const refreshWishlist = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Refreshing wishlist, isAuthenticated:', isAuthenticated, 'user:', user); // Add logging
      if (isAuthenticated && user?.token) {
        // User is authenticated, fetch from API
        try {
          const response = await wishlistApi.getWishlist(user.token);
          console.log('Wishlist API response:', response); // Add logging
          
          // Handle different response formats
          let wishlistData: any = response;
          if (response.wishlist) {
            wishlistData = response.wishlist;
          } else if (response.data) {
            wishlistData = response.data;
          }
          
          // Process items to ensure correct format
          let items: WishlistItem[] = [];
          if (Array.isArray(wishlistData)) {
            // Filter out invalid items
            items = wishlistData.filter(isValidWishlistItem);
          } else if (wishlistData.productIds && Array.isArray(wishlistData.productIds)) {
            // Transform items from API format to our format
            items = wishlistData.productIds
              .map((product: any) => {
                return {
                  id: typeof product._id === 'string' ? parseInt(product._id) : product._id,
                  name: product.name || 'Unknown Product',
                  price: product.price || 0,
                  originalPrice: product.originalPrice,
                  image: product.image || '',
                  category: product.category || 'Jewelry',
                  material: product.material || 'Gold',
                  rating: product.rating || 0
                };
              })
              .filter(isValidWishlistItem); // Filter out invalid items after transformation
          } else if (Array.isArray(wishlistData.productIds)) {
            // Handle case where productIds is an array of IDs
            items = wishlistData.productIds
              .map((id: any) => {
                return {
                  id: typeof id === 'string' ? parseInt(id) : id,
                  name: `Product ${id}`,
                  price: 0,
                  image: '',
                  category: 'Jewelry',
                  material: 'Gold',
                  rating: 0
                };
              })
              .filter(isValidWishlistItem); // Filter out invalid items after transformation
          }
          
          console.log('Processed wishlist items:', items); // Add logging
          setWishlistItems(items);
        } catch (apiError) {
          console.error('Failed to fetch wishlist from API, falling back to localStorage:', apiError);
          // Fallback to localStorage
          setWishlistItems(getWishlistItems());
        }
      } else {
        // User not authenticated, use localStorage
        console.log('User not authenticated, using localStorage for wishlist'); // Add logging
        setWishlistItems(getWishlistItems());
      }
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Force refresh both cart and wishlist
  const forceRefresh = async () => {
    await Promise.all([refreshCart(), refreshWishlist()]);
  };

  // Sync localStorage to database when user logs in
  const syncLocalStorageToDatabase = async () => {
    if (!isAuthenticated || !user?.token) return;
    
    try {
      const localCartItems = getCartItems().filter(isValidCartItem);
      const localWishlistItems = getWishlistItems();
      
      // Sync cart items
      for (const item of localCartItems) {
        try {
          await cartApi.addToCart(user.token, item.id.toString(), item.quantity);
        } catch (error) {
          console.error(`Failed to sync cart item ${item.id} to database:`, error);
        }
      }
      
      // Sync wishlist items
      for (const item of localWishlistItems) {
        try {
          await wishlistApi.addToWishlist(user.token, item.id.toString());
        } catch (error) {
          console.error(`Failed to sync wishlist item ${item.id} to database:`, error);
        }
      }
      
      // Clear localStorage after successful sync
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      
      // Refresh cart and wishlist from database
      await refreshCart();
      await refreshWishlist();
    } catch (error) {
      console.error('Failed to sync localStorage to database:', error);
    }
  };

  // Initialize cart and wishlist
  useEffect(() => {
    refreshCart();
    refreshWishlist();
  }, []);

  // Listen for user login event
  useEffect(() => {
    const handleUserLogin = () => {
      syncLocalStorageToDatabase();
    };

    window.addEventListener('userLoggedIn', handleUserLogin);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
    };
  }, [isAuthenticated, user]);

  // Listen for cart and wishlist update events
  useEffect(() => {
    const handleCartUpdate = () => {
      refreshCart();
    };

    const handleWishlistUpdate = () => {
      refreshWishlist();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      wishlistItems, 
      refreshCart, 
      refreshWishlist, 
      forceRefresh,
      getCartCount,
      getWishlistCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};