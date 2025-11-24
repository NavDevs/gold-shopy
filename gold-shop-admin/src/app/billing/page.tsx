'use client';

import React, { useState } from 'react';
import { Search, Plus, Printer, CreditCard, Wallet, Calendar, User, CheckCircle } from 'lucide-react';

interface BillingItem {
  id: number;
  name: string;
  sku: string;
  weight: string;
  purity: string;
  ratePerGram: number;
  makingCharges: number;
  quantity: number;
  totalPrice: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

const BillingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<BillingItem[]>([
    {
      id: 1,
      name: 'Classic Gold Chain Necklace',
      sku: 'GC-001',
      weight: '22.5g',
      purity: '22K',
      ratePerGram: 5200,
      makingCharges: 800,
      quantity: 1,
      totalPrice: 125300
    }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddItem = () => {
    const newItem: BillingItem = {
      id: items.length + 1,
      name: 'New Item',
      sku: 'NEW-' + (items.length + 1),
      weight: '0g',
      purity: '22K',
      ratePerGram: 0,
      makingCharges: 0,
      quantity: 1,
      totalPrice: 0
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
  };

  const gstRate = 3; // 3% GST
  const gstAmount = (calculateSubtotal() * gstRate) / 100;
  const totalAmount = calculateSubtotal() + gstAmount;

  const handlePlaceOrder = () => {
    if (!customer) {
      alert('Please select or add a customer before placing the order.');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one item to the order.');
      return;
    }

    // Validate that all items have valid data
    for (const item of items) {
      if (item.ratePerGram <= 0 || item.quantity <= 0) {
        alert('Please ensure all items have valid rates and quantities.');
        return;
      }
    }

    setLoading(true);
    
    // Simulate API call to place order
    setTimeout(() => {
      // Generate a random order number
      const newOrderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(newOrderNumber);
      setOrderPlaced(true);
      setLoading(false);
      
      // In a real application, you would send the order data to your backend here
      console.log('Order placed:', {
        customer,
        items,
        paymentMethod,
        totalAmount,
        orderNumber: newOrderNumber
      });
    }, 1500);
  };

  const handlePrintInvoice = () => {
    // In a real application, this would generate and print an invoice
    alert('Invoice would be printed in a real application');
  };

  const resetOrder = () => {
    setOrderPlaced(false);
    setOrderNumber('');
    setCustomer(null);
    setItems([
      {
        id: 1,
        name: 'Classic Gold Chain Necklace',
        sku: 'GC-001',
        weight: '22.5g',
        purity: '22K',
        ratePerGram: 5200,
        makingCharges: 800,
        quantity: 1,
        totalPrice: 125300
      }
    ]);
    setPaymentMethod('cash');
  };

  if (orderPlaced) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Confirmation</h1>
            <p className="mt-1 text-gray-600">Your order has been successfully placed</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been confirmed.</p>
          
          <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium text-amber-600">{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handlePrintInvoice}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Printer className="h-5 w-5 mr-2" />
              Print Invoice
            </button>
            <button
              onClick={resetOrder}
              className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
            >
              New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoicing</h1>
          <p className="mt-1 text-gray-600">Create invoices and process payments</p>
        </div>
        <div className="flex space-x-3">
          <button 
            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            onClick={handlePrintInvoice}
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Invoice
          </button>
          <button className="flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200">
            <CreditCard className="h-5 w-5 mr-2" />
            Process Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer and Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
            
            {!customer ? (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search customer by name or phone..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Or add new customer</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="customerPhone"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      onClick={() => setCustomer({
                        id: 1,
                        name: 'John Doe',
                        phone: '+91 98765 43210',
                        email: 'john@example.com',
                        address: '123 Main St, Mumbai'
                      })}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Add Customer
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                  <p className="text-gray-600">{customer.phone}</p>
                  {customer.email && <p className="text-gray-600">{customer.email}</p>}
                  {customer.address && <p className="text-gray-600">{customer.address}</p>}
                </div>
                <button
                  className="text-sm text-amber-600 hover:text-amber-800"
                  onClick={() => setCustomer(null)}
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Billing Items */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Items</h2>
                <button
                  onClick={handleAddItem}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight/Purity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate (₹/g)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Making Charges
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.sku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.weight}</div>
                        <div className="text-sm text-gray-500">{item.purity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                          value={item.ratePerGram}
                          onChange={(e) => {
                            const newRate = parseFloat(e.target.value) || 0;
                            const weightValue = parseFloat(item.weight) || 0;
                            const newTotal = (newRate * weightValue) + item.makingCharges;
                            setItems(items.map(i => 
                              i.id === item.id 
                                ? {...i, ratePerGram: newRate, totalPrice: newTotal} 
                                : i
                            ));
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                          value={item.makingCharges}
                          onChange={(e) => {
                            const newCharges = parseFloat(e.target.value) || 0;
                            const weightValue = parseFloat(item.weight) || 0;
                            const rateValue = item.ratePerGram || 0;
                            const newTotal = (rateValue * weightValue) + newCharges;
                            setItems(items.map(i => 
                              i.id === item.id 
                                ? {...i, makingCharges: newCharges, totalPrice: newTotal} 
                                : i
                            ));
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          className="w-16 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 1;
                            setItems(items.map(i => 
                              i.id === item.id ? {...i, quantity: newQty} : i
                            ));
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{(item.totalPrice * item.quantity).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{calculateSubtotal().toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <span className="text-gray-600">GST ({gstRate}%)</span>
                  <p className="text-xs text-gray-500">Includes making charges</p>
                </div>
                <span className="font-medium">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-amber-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Payment Method</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                      paymentMethod === 'cash'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <Wallet className="h-5 w-5 text-gray-600 mb-1" />
                    <span className="text-xs font-medium">Cash</span>
                  </button>
                  <button
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                      paymentMethod === 'card'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="h-5 w-5 text-gray-600 mb-1" />
                    <span className="text-xs font-medium">Card</span>
                  </button>
                </div>
              </div>
              
              <button 
                className={`w-full mt-6 bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors duration-200 ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;