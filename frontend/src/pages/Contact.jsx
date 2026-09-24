import React, { useState } from 'react';
import { MapPin, Phone, Clock, Mail, ExternalLink, Send, Sparkles } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Sky+Lounge+Restaurant+Deoband+Opposite+Punjab+National+Bank";
  const whatsappUrl = "https://wa.me/919760999444?text=Hello%20Sky%20Lounge%20Restaurant,%20I%20have%20an%20inquiry.";

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      showToast('Thank you! Your message has been sent to Sky Lounge management.', 'success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-burgundy-50 dark:bg-gold-500/10 border border-burgundy-200 dark:border-gold-500/30 text-burgundy-800 dark:text-gold-400 text-xs font-bold uppercase tracking-widest">
          <Phone className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white">
          Contact Sky Lounge Restaurant
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
          Have a question about our menu, private group dining, or home delivery? We are always here to serve you!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-gold-500/20 rounded-3xl p-8 space-y-6 shadow-xl dark:shadow-2xl">
            <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white border-l-3 border-burgundy-700 dark:border-gold-500 pl-3">
              Sky Lounge Restaurant
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-burgundy-50 dark:bg-gold-500/10 border border-burgundy-200 dark:border-gold-500/30 text-burgundy-800 dark:text-gold-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">Location Address</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    2nd Floor, Opposite Punjab National Bank, Railway Road, Teachers Colony, Deoband - 247554, Uttar Pradesh, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-burgundy-50 dark:bg-gold-500/10 border border-burgundy-200 dark:border-gold-500/30 text-burgundy-800 dark:text-gold-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">Phone</h4>
                  <a href="tel:9760999444" className="text-burgundy-800 dark:text-gold-400 font-bold hover:underline">
                    +91 9760999444
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-burgundy-50 dark:bg-gold-500/10 border border-burgundy-200 dark:border-gold-500/30 text-burgundy-800 dark:text-gold-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">Opening Hours</h4>
                  <p className="text-zinc-600 dark:text-zinc-400">Every day: 12:00 PM – 10:30 PM</p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <a
                href="tel:9760999444"
                className="px-5 py-2.5 rounded-full bg-gold-400 text-zinc-950 font-bold text-xs flex items-center gap-2 hover:bg-gold-300 transition-all shadow-gold"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-lg"
              >
                <FaWhatsapp className="w-4 h-4" />
                WhatsApp Us
              </a>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                <ExternalLink className="w-4 h-4 text-burgundy-800 dark:text-gold-400" />
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl space-y-6">
          <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Your Message</label>
              <textarea
                rows="4"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we assist you?"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-xs hover:brightness-110 shadow-gold transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending...' : 'Submit Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
