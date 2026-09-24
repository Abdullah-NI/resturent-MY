import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);

  // Fetch authenticated user's cart from backend on mount or user switch
  useEffect(() => {
    let isMounted = true;

    const fetchBackendCart = async () => {
      if (!user) {
        if (isMounted) {
          setCartItems([]);
          setLoadingCart(false);
        }
        return;
      }

      try {
        setLoadingCart(true);
        const res = await api.get('/cart');
        if (isMounted && res.data.success && Array.isArray(res.data.items)) {
          setCartItems(res.data.items);
          localStorage.setItem(`skylounge_cart_${user._id}`, JSON.stringify(res.data.items));
        }
      } catch (err) {
        console.error('Failed to load cart from backend:', err);
        if (isMounted && user._id) {
          const saved = localStorage.getItem(`skylounge_cart_${user._id}`);
          if (saved) {
            try {
              setCartItems(JSON.parse(saved));
            } catch (e) {
              setCartItems([]);
            }
          }
        }
      } finally {
        if (isMounted) setLoadingCart(false);
      }
    };

    fetchBackendCart();

    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  // Sync cart helper for local state, user localStorage, and backend
  const updateAndSyncCart = async (newItems) => {
    setCartItems(newItems);

    if (user?._id) {
      localStorage.setItem(`skylounge_cart_${user._id}`, JSON.stringify(newItems));
      try {
        await api.post('/cart', { items: newItems });
      } catch (err) {
        console.error('Failed to sync cart to backend:', err);
      }
    }
  };

  const addToCart = async (item, quantity = 1, selectedPortion = '') => {
    if (!user) {
      showToast('Please sign in to add items to your cart.', 'info');
      navigate('/login', { state: { from: location } });
      return false;
    }

    if (item.isAvailable === false) {
      showToast(`Sorry, ${item.name} is currently sold out!`, 'error');
      return false;
    }

    const itemKey = `${item._id}-${selectedPortion}`;
    const price = selectedPortion && item.priceOptions?.length
      ? item.priceOptions.find((p) => p.portion === selectedPortion)?.price || item.price
      : item.price;

    const existingIndex = cartItems.findIndex((i) => i.cartKey === itemKey);
    let updatedItems = [];

    if (existingIndex > -1) {
      updatedItems = cartItems.map((i, idx) =>
        idx === existingIndex ? { ...i, quantity: i.quantity + quantity } : i
      );
      showToast(`Updated ${item.name} quantity in cart!`, 'success');
    } else {
      updatedItems = [
        ...cartItems,
        {
          cartKey: itemKey,
          _id: item._id,
          name: item.name,
          price,
          image: getImageUrl(item.image),
          quantity,
          portion: selectedPortion,
          category: typeof item.category === 'object' ? item.category?.name : item.category || '',
        },
      ];
      showToast(`Added ${item.name} to cart!`, 'success');
    }

    await updateAndSyncCart(updatedItems);
    return true;
  };

  const removeFromCart = async (cartKey) => {
    const updatedItems = cartItems.filter((i) => i.cartKey !== cartKey);
    showToast('Item removed from cart', 'info');
    await updateAndSyncCart(updatedItems);
  };

  const updateQuantity = async (cartKey, delta) => {
    if (!user) {
      showToast('Please sign in to modify cart.', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }

    const updatedItems = cartItems
      .map((item) => {
        if (item.cartKey === cartKey) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);

    await updateAndSyncCart(updatedItems);
  };

  const refreshCart = async () => {
    if (!user) return;
    try {
      setLoadingCart(true);
      const res = await api.get('/cart');
      if (res.data.success && Array.isArray(res.data.items)) {
        setCartItems(res.data.items);
        localStorage.setItem(`skylounge_cart_${user._id}`, JSON.stringify(res.data.items));
      }
    } catch (err) {
      console.error('Failed to refresh cart from backend:', err);
    } finally {
      setLoadingCart(false);
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user?._id) {
      localStorage.removeItem(`skylounge_cart_${user._id}`);
      try {
        await api.delete('/cart');
      } catch (err) {
        console.error('Failed to clear backend cart:', err);
      }
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loadingCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        subtotal,
        deliveryFee,
        total,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
