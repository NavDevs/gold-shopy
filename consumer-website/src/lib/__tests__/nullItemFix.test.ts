/**
 * @jest-environment jsdom
 */

import { getCartItems } from '../cartUtils';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('Null Item Fix', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should filter out null items from cart', () => {
    // Set up localStorage with some valid and invalid items
    const cartWithNullItems = [
      {
        id: 1,
        name: 'Valid Product',
        price: 100,
        image: 'test.jpg',
        category: 'Test',
        material: 'Gold',
        quantity: 1
      },
      null, // This should be filtered out
      undefined, // This should be filtered out
      {
        id: 2,
        name: '', // Invalid name
        price: 50,
        image: 'test2.jpg',
        category: 'Test',
        material: 'Silver',
        quantity: 2
      },
      {
        id: 3,
        name: 'Another Valid Product',
        price: 0, // Invalid price
        image: 'test3.jpg',
        category: 'Test',
        material: 'Platinum',
        quantity: 1
      }
    ];
    
    localStorage.setItem('cart', JSON.stringify(cartWithNullItems));
    
    const cartItems = getCartItems();
    
    // Should only have 1 valid item
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0]).toEqual({
      id: 1,
      name: 'Valid Product',
      price: 100,
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold',
      quantity: 1
    });
  });

  test('should handle completely invalid cart data', () => {
    // Set up localStorage with completely invalid data
    localStorage.setItem('cart', 'not even json');
    
    const cartItems = getCartItems();
    
    // Should return empty array
    expect(cartItems).toHaveLength(0);
  });

  test('should handle empty cart', () => {
    // No cart in localStorage
    const cartItems = getCartItems();
    
    // Should return empty array
    expect(cartItems).toHaveLength(0);
  });
});