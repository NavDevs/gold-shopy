'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, ArrowLeft, Package, CreditCard } from 'lucide-react';
import { updateCartQuantity, removeFromCart } from '@/lib/cartUtils';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCart } from '@/context/CartContext';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  material: string;
  quantity: number;
}

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

const CartPage = () => {
  const { cartItems, refreshCart, forceRefresh } = useCart();
  
  // Filter out invalid items using the validation function
  const validCartItems = cartItems.filter(isValidCartItem);
  
  const handleUpdateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveFromCart(id);
      return;
    }
    
    await updateCartQuantity(id, newQuantity);
    await forceRefresh(); // Use force refresh to ensure UI updates
  };

  const handleRemoveFromCart = async (id: number) => {
    await removeFromCart(id);
    await forceRefresh(); // Use force refresh to ensure UI updates
  };

  const subtotal = validCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100000 ? 0 : 500;
  const tax = subtotal * 0.03;
  const total = subtotal + shipping + tax;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center mb-8">
            <Link href="/collections" className="flex items-center text-gray-600 hover:text-amber-600">
              <ArrowLeft size={20} className="mr-1" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="text-amber-600" size={32} />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your Shopping Cart</h1>
            <p className="text-lg text-gray-600">Review and manage your items before checkout</p>
          </div>

          {validCartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-12 text-center"
            >
              <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Cart is Empty</h2>
              <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
              <Link
                href="/collections"
                className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Cart ({validCartItems.length} {validCartItems.length === 1 ? 'Item' : 'Items'})
                  </h2>
                  
                  <div className="space-y-6">
                    {validCartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                      >
                        <div className="w-24 h-24 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/400x400/E5E7EB/1F2937?text=Product+Image';
                            }}
                          />
                        </div>
                        
                        <div className="ml-4 flex-grow">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{item.material} • {item.category}</p>
                          <p className="text-lg font-bold text-amber-600 mt-2">₹{item.price.toLocaleString()}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-l-lg"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-3 py-2 text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-r-lg"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500"
                            aria-label="Remove item"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString()}`}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">₹{tax.toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-amber-600">₹{total.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Link
                      href="/profile/checkout"
                      className="block w-full bg-amber-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors mt-6"
                    >
                      Proceed to Checkout
                    </Link>
                    
                    <Link
                      href="/collections"
                      className="block w-full text-center py-3 text-gray-600 hover:text-amber-600 transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CartPage;