const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper function to validate product ID
const isValidObjectId = (id) => {
  return typeof id === 'string' && id.length > 0;
};

// Helper function to validate quantity
const isValidQuantity = (quantity) => {
  return typeof quantity === 'number' && quantity > 0 && Number.isInteger(quantity);
};

// Get user cart
const getCart = async (req, res) => {
  try {
    if (req.useMockDb && req.mockDb) {
      // Use mock database
      const cart = req.mockDb.getCart(req.user.id);
      
      // Populate product details and filter out invalid items
      const validItems = cart.items.filter(item => 
        item && 
        isValidObjectId(item.productId) && 
        isValidQuantity(item.quantity)
      );
      
      const populatedCart = {
        ...cart,
        items: validItems.map(item => ({
          productId: req.mockDb.getProductById(item.productId),
          quantity: item.quantity
        })).filter(item => item.productId) // Filter out items where product doesn't exist
      };
      
      return res.json(populatedCart);
    }
    
    let cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    
    if (!cart) {
      // Create a new empty cart if it doesn't exist
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }
    
    // Filter out invalid items from the cart
    const validItems = cart.items.filter(item => 
      item && 
      item.productId && 
      isValidQuantity(item.quantity)
    );
    
    // If we filtered out any items, update the cart
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Validate inputs
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    if (!isValidQuantity(quantity)) {
      return res.status(400).json({ message: 'Invalid quantity. Quantity must be a positive integer.' });
    }
    
    if (req.useMockDb && req.mockDb) {
      // Use mock database
      // Check if product exists
      const product = req.mockDb.getProductById(parseInt(productId));
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Add to cart
      const cart = req.mockDb.addToCart(req.user.id, parseInt(productId), quantity);
      
      // Populate product details and filter out invalid items
      const validItems = cart.items.filter(item => 
        item && 
        isValidObjectId(item.productId) && 
        isValidQuantity(item.quantity)
      );
      
      const populatedCart = {
        ...cart,
        items: validItems.map(item => ({
          productId: req.mockDb.getProductById(item.productId),
          quantity: item.quantity
        })).filter(item => item.productId) // Filter out items where product doesn't exist
      };
      
      return res.json(populatedCart);
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.productId.equals(productId));
    
    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ productId, quantity });
    }
    
    await cart.save();
    
    // Populate product details
    await cart.populate('items.productId');
    
    // Filter out invalid items from the response
    const validItems = cart.items.filter(item => 
      item && 
      item.productId && 
      isValidQuantity(item.quantity)
    );
    
    const responseCart = {
      ...cart.toObject(),
      items: validItems
    };
    
    res.json(responseCart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Validate inputs
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    if (!isValidQuantity(quantity) && quantity !== 0) {
      return res.status(400).json({ message: 'Invalid quantity. Quantity must be a non-negative integer.' });
    }
    
    if (req.useMockDb && req.mockDb) {
      // Use mock database
      const cart = req.mockDb.updateCartItem(req.user.id, parseInt(productId), quantity);
      
      // Populate product details and filter out invalid items
      const validItems = cart.items.filter(item => 
        item && 
        isValidObjectId(item.productId) && 
        (isValidQuantity(item.quantity) || item.quantity === 0)
      );
      
      const populatedCart = {
        ...cart,
        items: validItems.map(item => ({
          productId: req.mockDb.getProductById(item.productId),
          quantity: item.quantity
        })).filter(item => item.productId) // Filter out items where product doesn't exist
      };
      
      return res.json(populatedCart);
    }
    
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }
    
    await cart.save();
    
    // Populate product details
    await cart.populate('items.productId');
    
    // Filter out invalid items from the response
    const validItems = cart.items.filter(item => 
      item && 
      item.productId && 
      (isValidQuantity(item.quantity) || item.quantity === 0)
    );
    
    const responseCart = {
      ...cart.toObject(),
      items: validItems
    };
    
    res.json(responseCart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Validate inputs
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    if (req.useMockDb && req.mockDb) {
      // Use mock database
      const cart = req.mockDb.removeFromCart(req.user.id, parseInt(productId));
      
      // Populate product details and filter out invalid items
      const validItems = cart.items.filter(item => 
        item && 
        isValidObjectId(item.productId) && 
        isValidQuantity(item.quantity)
      );
      
      const populatedCart = {
        ...cart,
        items: validItems.map(item => ({
          productId: req.mockDb.getProductById(item.productId),
          quantity: item.quantity
        })).filter(item => item.productId) // Filter out items where product doesn't exist
      };
      
      return res.json(populatedCart);
    }
    
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => !item.productId.equals(productId));
    
    await cart.save();
    
    // Populate product details
    await cart.populate('items.productId');
    
    // Filter out invalid items from the response
    const validItems = cart.items.filter(item => 
      item && 
      item.productId && 
      isValidQuantity(item.quantity)
    );
    
    const responseCart = {
      ...cart.toObject(),
      items: validItems
    };
    
    res.json(responseCart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    if (req.useMockDb && req.mockDb) {
      // Use mock database
      const cart = req.mockDb.clearCart(req.user.id);
      
      // Populate product details and filter out invalid items
      const validItems = cart.items.filter(item => 
        item && 
        isValidObjectId(item.productId) && 
        isValidQuantity(item.quantity)
      );
      
      const populatedCart = {
        ...cart,
        items: validItems.map(item => ({
          productId: req.mockDb.getProductById(item.productId),
          quantity: item.quantity
        })).filter(item => item.productId) // Filter out items where product doesn't exist
      };
      
      return res.json(populatedCart);
    }
    
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    
    await cart.save();
    
    // Populate product details
    await cart.populate('items.productId');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};