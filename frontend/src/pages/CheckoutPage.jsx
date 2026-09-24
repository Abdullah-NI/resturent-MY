import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, Phone, User, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CheckoutPage() {
  const { cartItems, subtotal, deliveryFee, total, clearCart, refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    phone: user?.phone ,
    street: user?.addresses?.[0]?.street,
    city: 'Deoband',
    state: 'Uttar Pradesh',
    pincode: '247554',
    paymentMethod: 'COD',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderPayload = {
        items: cartItems.map((i) => ({
          menuItem: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          portion: i.portion || '',
        })),
        subtotal,
        deliveryFee,
        total,
        customerName: formData.customerName,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const res = await api.post('/orders', orderPayload);
      if (res.data.success) {
        try {
          const guestOrders = JSON.parse(localStorage.getItem('skylounge_guest_orders') || '[]');
          if (res.data.order && res.data.order._id && !guestOrders.includes(res.data.order._id)) {
            guestOrders.unshift(res.data.order._id);
            localStorage.setItem('skylounge_guest_orders', JSON.stringify(guestOrders));
          }
        } catch (err) {
          console.error('Error saving guest order ID', err);
        }

        showToast('Order placed successfully!', 'success');
        clearCart();
        navigate(`/order-tracking?id=${res.data.order._id}`);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to place order.';
      showToast(errMsg, 'error');
      if (errMsg.includes('no longer available') || errMsg.includes('sold out')) {
        await refreshCart();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white">
          Delivery Checkout
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Complete your details to place your order with Sky Lounge</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact & Address Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl dark:shadow-2xl">
            <h2 className="font-heading text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <User className="w-5 h-5 text-burgundy-800 dark:text-gold-400" />
              <span>Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  disabled
                  value={formData.customerName} 
                  // onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  // placeholder="Enter full name"
                  //w-full bg-slate-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400
                  className="w-full bg-slate-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9760999444"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl dark:shadow-2xl">
            <h2 className="font-heading text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <MapPin className="w-5 h-5 text-burgundy-800 dark:text-gold-400" />
              <span>Delivery Address in Deoband</span>
            </h2>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Street / Landmark / House No.</label>
              <textarea
                rows="2"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Nearby Punjab National Bank, Teachers Colony, Railway Road"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">City</label>
                <input
                  type="text"
                  disabled
                  value={formData.city}
                  className="w-full bg-slate-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">State</label>
                <input
                  type="text"
                  disabled
                  value={formData.state}
                  className="w-full bg-slate-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Pincode</label>
                <input
                  type="text"
                  disabled
                  value={formData.pincode}
                  className="w-full bg-slate-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl dark:shadow-2xl">
            <h2 className="font-heading text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <CreditCard className="w-5 h-5 text-burgundy-800 dark:text-gold-400" />
              <span>Payment Option</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                  formData.paymentMethod === 'COD'
                    ? 'bg-burgundy-50 dark:bg-gold-500/10 border-burgundy-700 dark:border-gold-500 text-zinc-900 dark:text-white font-bold'
                    : 'bg-slate-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  formData.paymentMethod === 'COD' ? 'border-burgundy-700 dark:border-gold-400 bg-burgundy-700 dark:bg-gold-400' : 'border-zinc-400 dark:border-zinc-600'
                }`} />
                <div>
                  <span className="text-xs block font-bold text-zinc-900 dark:text-white">Cash on Delivery</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Pay cash upon delivery</span>
                </div>
              </label>

              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'Pay at Restaurant' })}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                  formData.paymentMethod === 'Pay at Restaurant'
                    ? 'bg-burgundy-50 dark:bg-gold-500/10 border-burgundy-700 dark:border-gold-500 text-zinc-900 dark:text-white font-bold'
                    : 'bg-slate-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  formData.paymentMethod === 'Pay at Restaurant' ? 'border-burgundy-700 dark:border-gold-400 bg-burgundy-700 dark:bg-gold-400' : 'border-zinc-400 dark:border-zinc-600'
                }`} />
                <div>
                  <span className="text-xs block font-bold text-zinc-900 dark:text-white">Pay at Restaurant</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Self pickup or dine-in</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary & Submit */}
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-gold-500/20 rounded-3xl p-6 space-y-6 shadow-xl dark:shadow-2xl h-fit">
          <h2 className="font-heading text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
            Review Items ({cartItems.length})
          </h2>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.cartKey} className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300">
                <span>
                  {item.quantity}x {item.name} {item.portion ? `(${item.portion})` : ''}
                </span>
                <span className="font-bold text-burgundy-800 dark:text-gold-400">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span className="text-zinc-900 dark:text-white font-bold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Delivery Charges</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 flex justify-between text-base font-bold text-zinc-900 dark:text-white">
              <span>Total Payable</span>
              <span className="text-burgundy-800 dark:text-gold-400 font-heading text-xl">₹{total}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-sm hover:brightness-110 shadow-gold transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Placing Order...' : 'Confirm & Place Order'}</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
