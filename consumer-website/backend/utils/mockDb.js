// Mock database for development purposes when MongoDB is not available

// Helper function to validate product ID
const isValidProductId = (id) => {
  return typeof id === 'number' && id > 0;
};

// Helper function to validate quantity
const isValidQuantity = (quantity) => {
  return typeof quantity === 'number' && quantity > 0 && Number.isInteger(quantity);
};

class MockDB {
  constructor() {
    this.data = {
      users: [],
      products: [],
      carts: [],
      wishlists: [],
      orders: []
    };
    this.nextId = 1;
  }

  // Generate unique ID
  generateId() {
    return this.nextId++;
  }

  // Generate order number
  generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}${random}`;
  }

  // Users
  createUser(userData) {
    const user = {
      _id: this.generateId(),
      ...userData,
      loginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.users.push(user);
    return user;
  }

  findUser(query) {
    return this.data.users.find(user => {
      return Object.keys(query).every(key => {
        // Special handling for email search
        if (key === 'email') {
          return user[key] && user[key].toLowerCase() === query[key].toLowerCase();
        }
        return user[key] === query[key];
      });
    });
  }

  getUserById(id) {
    return this.data.users.find(user => user._id === id);
  }

  updateUser(id, updateData) {
    const userIndex = this.data.users.findIndex(user => user._id === id);
    if (userIndex !== -1) {
      this.data.users[userIndex] = {
        ...this.data.users[userIndex],
        ...updateData,
        updatedAt: new Date()
      };
      return this.data.users[userIndex];
    }
    return null;
  }

  // Check if account is locked
  isAccountLocked(user) {
    return !!(user.lockUntil && user.lockUntil > Date.now());
  }

  // Increment login attempts
  incLoginAttempts(userId) {
    const user = this.getUserById(userId);
    if (!user) return null;

    // Reset attempts and lock info if lock has expired
    if (user.lockUntil && user.lockUntil < Date.now()) {
      user.loginAttempts = 1;
      delete user.lockUntil;
      return user;
    }

    // Increment attempts
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    // Lock account if we've reached max attempts and it's not already locked
    if (user.loginAttempts >= 5 && !this.isAccountLocked(user)) {
      user.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // Lock for 2 hours
    }

    user.updatedAt = new Date();
    return user;
  }

  // Reset login attempts
  resetLoginAttempts(userId) {
    const user = this.getUserById(userId);
    if (!user) return null;

    user.loginAttempts = 0;
    delete user.lockUntil;
    user.updatedAt = new Date();
    return user;
  }

  // Generate remember me token
  generateRememberToken(userId) {
    const user = this.getUserById(userId);
    if (!user) return null;

    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // Token expires in 30 days

    user.rememberToken = token;
    user.rememberTokenExpires = expires;
    user.updatedAt = new Date();

    return { token, expires };
  }

  // Find user by remember token
  findUserByRememberToken(token) {
    return this.data.users.find(user => 
      user.rememberToken === token && 
      user.rememberTokenExpires && 
      user.rememberTokenExpires > Date.now()
    );
  }

  // Products
  createProduct(productData) {
    const product = {
      _id: this.generateId(),
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.products.push(product);
    return product;
  }

  getProducts(query = {}) {
    return this.data.products.filter(product => {
      return Object.keys(query).every(key => {
        if (key === 'price') {
          // Handle price range queries
          if (query[key].$gte !== undefined && query[key].$lte !== undefined) {
            return product[key] >= query[key].$gte && product[key] <= query[key].$lte;
          }
          if (query[key].$gte !== undefined) {
            return product[key] >= query[key].$gte;
          }
          if (query[key].$lte !== undefined) {
            return product[key] <= query[key].$lte;
          }
        }
        if (typeof query[key] === 'string' && query[key].startsWith('/')) {
          // Handle regex queries
          const regex = new RegExp(query[key].slice(1, -1), 'i');
          return regex.test(product[key]);
        }
        return product[key] === query[key];
      });
    });
  }

  getProductById(id) {
    return this.data.products.find(product => product._id === id);
  }

  // Carts
  getCart(userId) {
    let cart = this.data.carts.find(c => c.userId === userId);
    if (!cart) {
      cart = {
        _id: this.generateId(),
        userId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.data.carts.push(cart);
    }
    
    // Filter out invalid items
    cart.items = cart.items.filter(item => 
      item && 
      isValidProductId(item.productId) && 
      isValidQuantity(item.quantity)
    );
    
    return cart;
  }

  addToCart(userId, productId, quantity = 1) {
    // Validate inputs
    if (!isValidProductId(productId)) {
      throw new Error('Invalid product ID');
    }
    
    if (!isValidQuantity(quantity)) {
      throw new Error('Invalid quantity');
    }
    
    const cart = this.getCart(userId);
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Check if product exists before adding
      const product = this.getProductById(productId);
      if (product) {
        cart.items.push({
          productId,
          quantity
        });
      }
    }
    
    cart.updatedAt = new Date();
    return cart;
  }

  removeFromCart(userId, productId) {
    // Validate inputs
    if (!isValidProductId(productId)) {
      throw new Error('Invalid product ID');
    }
    
    const cart = this.getCart(userId);
    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.updatedAt = new Date();
    return cart;
  }

  updateCartItem(userId, productId, quantity) {
    // Validate inputs
    if (!isValidProductId(productId)) {
      throw new Error('Invalid product ID');
    }
    
    if (!isValidQuantity(quantity) && quantity !== 0) {
      throw new Error('Invalid quantity');
    }
    
    const cart = this.getCart(userId);
    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex !== -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }
      cart.updatedAt = new Date();
    }
    
    return cart;
  }

  clearCart(userId) {
    const cart = this.getCart(userId);
    cart.items = [];
    cart.updatedAt = new Date();
    return cart;
  }

  // Wishlist
  getWishlist(userId) {
    let wishlist = this.data.wishlists.find(w => w.userId === userId);
    if (!wishlist) {
      wishlist = {
        _id: this.generateId(),
        userId,
        productIds: [], // Changed from 'items' to 'productIds' to match MongoDB schema
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.data.wishlists.push(wishlist);
    }
    return wishlist;
  }

  addToWishlist(userId, productId) {
    // Validate inputs
    if (!isValidProductId(productId)) {
      throw new Error('Invalid product ID');
    }
    
    const wishlist = this.getWishlist(userId);
    // Check if item already exists in wishlist
    if (!wishlist.productIds.includes(productId)) {
      // Check if product exists before adding
      const product = this.getProductById(productId);
      if (product) {
        wishlist.productIds.push(productId);
      }
    }
    
    wishlist.updatedAt = new Date();
    return wishlist;
  }

  removeFromWishlist(userId, productId) {
    // Validate inputs
    if (!isValidProductId(productId)) {
      throw new Error('Invalid product ID');
    }
    
    const wishlist = this.getWishlist(userId);
    wishlist.productIds = wishlist.productIds.filter(id => id !== productId);
    wishlist.updatedAt = new Date();
    return wishlist;
  }

  // Move item from wishlist to cart
  moveFromWishlistToCart(userId, productId) {
    // Validate inputs
    if (!isValidProductId(productId)) {
      throw new Error('Invalid product ID');
    }
    
    // Remove from wishlist
    const wishlist = this.removeFromWishlist(userId, productId);
    
    // Add to cart
    const cart = this.addToCart(userId, productId);
    
    return {
      success: true,
      wishlist,
      cart
    };
  }

  // Orders
  createOrder(orderData) {
    const order = {
      _id: this.generateId(),
      orderNumber: this.generateOrderNumber(),
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.orders.push(order);
    return order;
  }

  getOrdersByUserId(userId) {
    return this.data.orders.filter(order => order.userId === userId);
  }

  getOrderById(id) {
    return this.data.orders.find(order => order._id === id);
  }

  getUserOrders(userId) {
    return this.data.orders.filter(order => order.userId === userId);
  }

  // Seed database with sample data
  seedData() {
    // Clear existing data
    this.data.users = [];
    this.data.products = [];
    this.data.carts = [];
    this.data.wishlists = [];
    this.data.orders = [];
    
    // Reset ID counter
    this.nextId = 1;

    // Sample products
    const products = [
      {
        name: "Classic Gold Necklace",
        price: 125000,
        image: "https://via.placeholder.com/400x400/E5E7EB/1F2937?text=Classic+Gold+Necklace",
        category: "Necklaces",
        material: "Gold",
        rating: 4.8,
        reviews: 124,
        tags: ["classic", "everyday"]
      },
      {
        name: "Diamond Stud Earrings",
        price: 89000,
        image: "https://via.placeholder.com/400x400/E5E7EB/1F2937?text=Diamond+Stud+Earrings",
        category: "Earrings",
        material: "Gold",
        rating: 4.9,
        reviews: 98,
        tags: ["diamond", "stud"]
      },
      {
        name: "Rose Gold Bracelet",
        price: 75000,
        image: "https://via.placeholder.com/400x400/E5E7EB/1F2937?text=Rose+Gold+Bracelet",
        category: "Bracelets",
        material: "Rose Gold",
        rating: 4.7,
        reviews: 67,
        tags: ["rose gold", "trendy"]
      },
      {
        name: "White Gold Engagement Ring",
        price: 195000,
        image: "https://via.placeholder.com/400x400/E5E7EB/1F2937?text=White+Gold+Ring",
        category: "Rings",
        material: "White Gold",
        rating: 4.9,
        reviews: 156,
        tags: ["engagement", "diamond"]
      },
      {
        name: "Silver Cufflinks",
        price: 12000,
        image: "https://via.placeholder.com/400x400/E5E7EB/1F2937?text=Silver+Cufflinks",
        category: "Accessories",
        material: "Silver",
        rating: 4.5,
        reviews: 42,
        tags: ["formal", "accessory"]
      },
      {
        name: "Gold Pendant",
        price: 45000,
        image: "https://via.placeholder.com/400x400/E5E7EB/1F2937?text=Gold+Pendant",
        category: "Pendants",
        material: "Gold",
        rating: 4.6,
        reviews: 78,
        tags: ["pendant", "delicate"]
      },
      {
        name: "Platinum Wedding Band",
        price: 295000,
        image: "https://via.placeholder.com/400x400/E5E7EB/1F2937?text=Platinum+Wedding+Band",
        category: "Rings",
        material: "Platinum",
        rating: 4.6,
        reviews: 89,
        tags: ["wedding", "classic"]
      }
    ];

    // Insert products
    products.forEach(product => this.createProduct(product));

    console.log('Mock database seeded with sample data');
    return true;
  }
}

// Export singleton instance
module.exports = new MockDB();