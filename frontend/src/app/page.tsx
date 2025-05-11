'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Product {
  code: string;
  name: string;
  unit_price: number;
  discounts: {
    quantity: number;
    discount_price: number;
  }[];
}

interface CartItem {
  code: string;
  quantity: number;
}

interface Discount {
  quantity: number;
  discount_price: number;
}

interface RawProduct {
  code: string;
  name: string;
  unit_price: string | number;
  discounts: Discount[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pattern, setPattern] = useState<string>('');

  const calculateTotal = useCallback(async () => {
    if (cart.length === 0) {
      setTotal(0);
      return;
    }

    try {
      // Convert cart items to array of codes
      const items = cart.flatMap(item => Array(item.quantity).fill(item.code));
      const response = await axios.post(`${API_BASE_URL}/api/checkout/`, {
        items: items,
      });
      setTotal(Number(response.data.total_price));
    } catch (error) {
      console.error('Error calculating total:', error);
      setError('Failed to calculate total. Please try again.');
    }
  }, [cart]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/`);
      const processedProducts = response.data.map((product: RawProduct) => ({
        ...product,
        unit_price: Number(product.unit_price),
        discounts: product.discounts.map((discount: Discount) => ({
          ...discount,
          discount_price: Number(discount.discount_price)
        }))
      }));
      setProducts(processedProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  const addToCart = (code: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.code === code);
      if (existingItem) {
        return prevCart.map(item =>
          item.code === code
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { code, quantity: 1 }];
    });
    setError(null);
  };

  const removeFromCart = (code: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.code === code);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.code === code
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart.filter(item => item.code !== code);
    });
    setError(null);
  };

  const handlePatternSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const items = pattern.split('').filter(char =>
      products.some(product => product.code === char)
    );

    // Reset cart and add new items
    setCart(items.reduce((acc: CartItem[], code) => {
      const existingItem = acc.find(item => item.code === code);
      if (existingItem) {
        return acc.map(item =>
          item.code === code
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...acc, { code, quantity: 1 }];
    }, []));

    setPattern('');
  };

  const calculateDiscount = (product: Product, quantity: number) => {
    if (!product.discounts || product.discounts.length === 0) return 0;

    const discount = product.discounts[0];
    if (quantity >= discount.quantity) {
      const regularPrice = quantity * product.unit_price;
      const discountedPrice = (Math.floor(quantity / discount.quantity) * discount.discount_price) +
        ((quantity % discount.quantity) * product.unit_price);
      return regularPrice - discountedPrice;
    }
    return 0;
  };

  const calculateItemTotal = (product: Product, quantity: number) => {
    const regularPrice = quantity * product.unit_price;
    const discount = calculateDiscount(product, quantity);
    return {
      regularPrice,
      discount,
      finalPrice: regularPrice - discount
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Checkout System
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-600">
            Browse our products and enjoy special discounts
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products Section */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-gray-900">Available Products</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {products.map((product) => (
                <div
                  key={product.code}
                  className="p-6 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">Product Code: {product.code}</p>
                      <p className="mt-2 text-xl font-bold text-gray-900">
                        ${product.unit_price.toFixed(2)}
                      </p>
                      {product.discounts && product.discounts.length > 0 && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Special Offer: {product.discounts[0].quantity} for ${product.discounts[0].discount_price.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product.code)}
                      className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
            </div>
            <div className="p-6">
              {/* Pattern Input */}
              <div className="mb-6">
                <form onSubmit={handlePatternSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value.toUpperCase())}
                    placeholder="Enter product codes (e.g., AABBC)"
                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Pattern
                  </button>
                </form>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                  <p className="mt-1 text-sm text-gray-500">Start adding some products to your cart!</p>
                </div>
              ) : (
                <>
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-200">
                      {cart.map((item) => {
                        const product = products.find((p) => p.code === item.code);
                        if (!product) return null;
                        const { regularPrice, discount, finalPrice } = calculateItemTotal(product, item.quantity);

                        return (
                          <li key={item.code} className="py-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-base font-medium text-gray-900">
                                      {product.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                      Product Code: {product.code}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => removeFromCart(item.code)}
                                        className="p-1 rounded-full hover:bg-gray-100"
                                      >
                                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                      </button>
                                      <span className="text-lg font-medium">{item.quantity}</span>
                                      <button
                                        onClick={() => addToCart(item.code)}
                                        className="p-1 rounded-full hover:bg-gray-100"
                                      >
                                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => setCart(cart.filter(i => i.code !== item.code))}
                                      className="text-sm font-medium text-red-600 hover:text-red-500"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                  <div className="flex justify-between">
                                    <span>Regular Price:</span>
                                    <span>${regularPrice.toFixed(2)}</span>
                                  </div>
                                  {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                      <span>Discount:</span>
                                      <span>-${discount.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between font-medium">
                                    <span>Item Total:</span>
                                    <span>${finalPrice.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="mt-8 border-t border-gray-200 pt-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-base font-medium text-gray-900">
                        <h3>Subtotal</h3>
                        <p>${total.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between text-base font-medium text-gray-900">
                        <h3>Total Savings</h3>
                        <p className="text-green-600">
                          -${cart.reduce((acc, item) => {
                            const product = products.find(p => p.code === item.code);
                            return acc + (product ? calculateDiscount(product, item.quantity) : 0);
                          }, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xl font-bold text-gray-900">
                        <h3>Final Total</h3>
                        <p>${total.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={() => setCart([])}
                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
