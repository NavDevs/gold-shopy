// Utility functions for cart and wishlist management

// Import API functions
import { cartApi, wishlistApi } from './api';

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

// Helper function to validate cart items
export const isValidCartItem = (item: any): item is CartItem => {
  return (
    item != null &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    item.name.trim() !== '' &&
    typeof item.price === 'number' &&
    item.price > 0 &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
};

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Redirect to login page
const redirectToLogin = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/signin';
  }
};

// Cart functions
export const getCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  const storedCart = localStorage.getItem('cart');
  console.log('Getting cart from localStorage:', storedCart); // Add logging
  if (storedCart) {
    try {
      const parsedCart = JSON.parse(storedCart);
      // Filter out invalid items
      if (Array.isArray(parsedCart)) {
        return parsedCart.filter(isValidCartItem);
      }
      return [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

export const getCartCount = (): number => {
  const cartItems = getCartItems();
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  console.log('Calculating cart count:', count); // Add logging
  return count;
};

export const addToCart = async (item: Omit<CartItem, 'quantity'>): Promise<void> => {
  console.log('Adding item to cart:', item); // Add logging
  if (typeof window === 'undefined') {
    console.log('Window is undefined, returning'); // Add logging
    return;
  }
  
  // Validate the item before adding
  if (!item || !item.id || !item.name || item.name.trim() === '' || !item.price || item.price <= 0) {
    console.error('Invalid item provided to addToCart:', item);
    return;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.log('User not authenticated'); // Add logging
    // Don't redirect to login automatically, just use localStorage
    // This prevents redirect loops when user is not logged in
  }
  
  const token = getAuthToken();
  console.log('User token:', token); // Add logging
  
  // If user is authenticated, use API
  if (token) {
    console.log('Using API to add item to cart'); // Add logging
    try {
      const response = await cartApi.addToCart(token, item.id.toString(), 1);
      console.log('API response:', response); // Add logging
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
      return;
    } catch (error) {
      console.error('Failed to add to cart via API, falling back to localStorage:', error);
    }
  }
  
  console.log('Using localStorage'); // Add logging
  // Use localStorage for both authenticated and non-authenticated users
  const cartItems = getCartItems();
  console.log('Current cart items from localStorage:', cartItems); // Add logging
  const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
  console.log('Existing item index:', existingItemIndex); // Add logging
  
  if (existingItemIndex >= 0) {
    cartItems[existingItemIndex].quantity += 1;
    console.log('Updated quantity of existing item'); // Add logging
  } else {
    cartItems.push({ ...item, quantity: 1 });
    console.log('Added new item to cart'); // Add logging
  }
  
  localStorage.setItem('cart', JSON.stringify(cartItems));
  console.log('Updated cart in localStorage:', cartItems); // Add logging
  
  // Dispatch custom event to notify other components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartUpdated'));
  }
};

export const updateCartQuantity = async (id: number, quantity: number): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  // Validate inputs
  if (typeof id !== 'number' || typeof quantity !== 'number') {
    console.error('Invalid parameters for updateCartQuantity:', { id, quantity });
    return;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.log('User not authenticated for cart update'); // Add logging
    // Don't redirect to login automatically, just use localStorage
    // This prevents redirect loops when user is not logged in
  }
  
  const token = getAuthToken();
  
  // If user is authenticated, use API
  if (token) {
    try {
      if (quantity <= 0) {
        await cartApi.removeFromCart(token, id.toString());
      } else {
        await cartApi.updateCartItem(token, id.toString(), quantity);
      }
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
      return;
    } catch (error) {
      console.error('Failed to update cart via API, falling back to localStorage:', error);
    }
  }
  
  // Use localStorage for both authenticated and non-authenticated users
  const cartItems = getCartItems();
  const itemIndex = cartItems.findIndex(item => item.id === id);
  
  if (itemIndex >= 0) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cartItems.splice(itemIndex, 1);
    } else {
      // Update quantity
      cartItems[itemIndex].quantity = quantity;
    }
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Dispatch custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }
};

export const removeFromCart = async (id: number): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  // Validate input
  if (typeof id !== 'number') {
    console.error('Invalid id for removeFromCart:', id);
    return;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.log('User not authenticated for cart removal'); // Add logging
    // Don't redirect to login automatically, just use localStorage
    // This prevents redirect loops when user is not logged in
  }
  
  const token = getAuthToken();
  
  // If user is authenticated, use API
  if (token) {
    try {
      await cartApi.removeFromCart(token, id.toString());
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
      return;
    } catch (error) {
      console.error('Failed to remove from cart via API, falling back to localStorage:', error);
    }
  }
  
  // Use localStorage for both authenticated and non-authenticated users
  const cartItems = getCartItems();
  const filteredItems = cartItems.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(filteredItems));
  
  // Dispatch custom event to notify other components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartUpdated'));
  }
};

// Wishlist functions
export const getWishlistItems = (): WishlistItem[] => {
  if (typeof window === 'undefined') return [];
  
  const storedWishlist = localStorage.getItem('wishlist');
  if (storedWishlist) {
    try {
      return JSON.parse(storedWishlist);
    } catch (e) {
      return [];
    }
  }
  return [];
};

export const getWishlistCount = (): number => {
  return getWishlistItems().length;
};

export const addToWishlist = async (item: WishlistItem): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  // Validate the item before adding
  if (!item || !item.id || !item.name || item.name.trim() === '' || !item.price || item.price <= 0) {
    console.error('Invalid item provided to addToWishlist:', item);
    return;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.log('User not authenticated for wishlist'); // Add logging
    // Don't redirect to login automatically, just use localStorage
    // This prevents redirect loops when user is not logged in
  }
  
  const token = getAuthToken();
  
  // If user is authenticated, use API
  if (token) {
    try {
      await wishlistApi.addToWishlist(token, item.id.toString());
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
      return;
    } catch (error) {
      console.error('Failed to add to wishlist via API, falling back to localStorage:', error);
    }
  }
  
  // Use localStorage for both authenticated and non-authenticated users
  const wishlistItems = getWishlistItems();
  const existingItemIndex = wishlistItems.findIndex(wishlistItem => wishlistItem.id === item.id);
  
  if (existingItemIndex < 0) {
    wishlistItems.push(item);
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    
    // Dispatch custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  }
};

export const removeFromWishlist = async (id: number): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  // Validate input
  if (typeof id !== 'number') {
    console.error('Invalid id for removeFromWishlist:', id);
    return;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.log('User not authenticated for wishlist removal'); // Add logging
    // Don't redirect to login automatically, just use localStorage
    // This prevents redirect loops when user is not logged in
  }
  
  const token = getAuthToken();
  
  // If user is authenticated, use API
  if (token) {
    try {
      await wishlistApi.removeFromWishlist(token, id.toString());
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
      return;
    } catch (error) {
      console.error('Failed to remove from wishlist via API, falling back to localStorage:', error);
    }
  }
  
  // Use localStorage for both authenticated and non-authenticated users
  const wishlistItems = getWishlistItems();
  const filteredItems = wishlistItems.filter(item => item.id !== id);
  localStorage.setItem('wishlist', JSON.stringify(filteredItems));
  
  // Dispatch custom event to notify other components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wishlistUpdated'));
  }
};

export const moveFromWishlistToCart = async (id: number): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  // Validate input
  if (typeof id !== 'number') {
    console.error('Invalid id for moveFromWishlistToCart:', id);
    return;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.log('User not authenticated for wishlist to cart move'); // Add logging
    // Don't redirect to login automatically, just use localStorage
    // This prevents redirect loops when user is not logged in
  }
  
  const token = getAuthToken();
  
  // If user is authenticated, use API
  if (token) {
    try {
      await wishlistApi.moveFromWishlistToCart(token, id.toString());
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('wishlistUpdated'));
        window.dispatchEvent(new Event('cartUpdated'));
      }
      return;
    } catch (error) {
      console.error('Failed to move from wishlist to cart via API, falling back to localStorage:', error);
    }
  }
  
  // Use localStorage for both authenticated and non-authenticated users
  // Get wishlist item
  const wishlistItems = getWishlistItems();
  const wishlistItem = wishlistItems.find(item => item.id === id);
  
  if (wishlistItem) {
    // Add to cart
    await addToCart({
      id: wishlistItem.id,
      name: wishlistItem.name,
      price: wishlistItem.price,
      image: wishlistItem.image,
      category: wishlistItem.category,
      material: wishlistItem.material
    });
    
    // Remove from wishlist
    await removeFromWishlist(id);
  }
};

// Test function
export const runTests = () => {
  // Mock localStorage for testing
  const mockStorage: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    }
  };
  
  // Mock window.localStorage
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
  });
  
  // Test data
  const testProduct = {
    id: 1,
    name: 'Test Gold Necklace',
    price: 150000,
    image: 'https://via.placeholder.com/400x400/D4AF37/FFFFFF?text=Gold+Necklace',
    category: 'Necklaces',
    material: 'Gold'
  };
  
  const testWishlistProduct = {
    id: 2,
    name: 'Test Diamond Ring',
    price: 250000,
    originalPrice: 300000,
    image: 'https://via.placeholder.com/400x400/E5E7EB/1F2937?text=Diamond+Ring',
    category: 'Rings',
    material: 'Diamond',
    rating: 4.8
  };
  
  // Manual test function
  const runTests = () => {
    console.log('Running cart and wishlist tests...');
    
    // Test addToCart
    addToCart(testProduct);
    console.log('Cart items after adding:', getCartItems());
    console.log('Cart count:', getCartCount());
    
    // Test updateCartQuantity
    updateCartQuantity(1, 3);
    console.log('Cart items after updating quantity:', getCartItems());
    
    // Test addToWishlist
    addToWishlist(testWishlistProduct);
    console.log('Wishlist items after adding:', getWishlistItems());
    console.log('Wishlist count:', getWishlistCount());
    
    // Test moveFromWishlistToCart
    moveFromWishlistToCart(2);
    console.log('Cart items after moving from wishlist:', getCartItems());
    console.log('Wishlist items after moving to cart:', getWishlistItems());
    
    // Test removeFromCart
    removeFromCart(1);
    console.log('Cart items after removing:', getCartItems());
    
    console.log('Tests completed!');
  };
  
  return runTests;
};