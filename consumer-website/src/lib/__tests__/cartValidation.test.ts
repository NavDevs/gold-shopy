/**
 * @jest-environment jsdom
 */

import { isValidCartItem } from '../cartUtils';

describe('Cart Item Validation', () => {
  test('should validate correct cart items', () => {
    const validItem = {
      id: 1,
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold',
      quantity: 1
    };
    
    expect(isValidCartItem(validItem)).toBe(true);
  });

  test('should reject null or undefined items', () => {
    expect(isValidCartItem(null)).toBe(false);
    expect(isValidCartItem(undefined)).toBe(false);
  });

  test('should reject items with missing id', () => {
    const item = {
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold',
      quantity: 1
    };
    
    expect(isValidCartItem(item)).toBe(false);
  });

  test('should reject items with invalid id', () => {
    const item = {
      id: 'invalid',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold',
      quantity: 1
    };
    
    expect(isValidCartItem(item)).toBe(false);
  });

  test('should reject items with missing name', () => {
    const item = {
      id: 1,
      price: 100,
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold',
      quantity: 1
    };
    
    expect(isValidCartItem(item)).toBe(false);
  });

  test('should reject items with empty name', () => {
    const item = {
      id: 1,
      name: '',
      price: 100,
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold',
      quantity: 1
    };
    
    expect(isValidCartItem(item)).toBe(false);
  });

  test('should reject items with whitespace-only name', () => {
    const item = {
      id: 1,
      name: '   ',
      price: 100,
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold',
      quantity: 1
    };
    
    expect(isValidCartItem(item)).toBe(false);
  });

  test('should reject items with missing price', () => {
    const item = {
      id: 1,
      name: 'Test Product',
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold',
      quantity: 1
    };
    
    expect(isValidCartItem(item)).toBe(false);
  });

  test('should reject items with invalid price', () => {
    const item = {
      id: 1,
      name: 'Test Product',
      price: -50,
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold',
      quantity: 1
    };
    
    expect(isValidCartItem(item)).toBe(false);
  });

  test('should reject items with zero price', () => {
    const item = {
      id: 1,
      name: 'Test Product',
      price: 0,
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold',
      quantity: 1
    };
    
    expect(isValidCartItem(item)).toBe(false);
  });

  test('should reject items with missing quantity', () => {
    const item = {
      id: 1,
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold'
    };
    
    expect(isValidCartItem(item)).toBe(false);
  });

  test('should reject items with invalid quantity', () => {
    const item = {
      id: 1,
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold',
      quantity: -1
    };
    
    expect(isValidCartItem(item)).toBe(false);
  });

  test('should reject items with zero quantity', () => {
    const item = {
      id: 1,
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      category: 'Test',
      material: 'Gold',
      quantity: 0
    };
    
    expect(isValidCartItem(item)).toBe(false);
  });
});