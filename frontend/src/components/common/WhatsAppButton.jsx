import React from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaPhone } from 'react-icons/fa';

export default function WhatsAppButton() {
  const whatsappUrl = "https://wa.me/919760999444";

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
      {/* WhatsApp Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-13 h-13 rounded-full bg-emerald-600 text-white shadow-2xl flex items-center justify-center relative group border-2 border-emerald-400 p-3"
        aria-label="Order via WhatsApp"
      >
        <span className="absolute -top-8 left-0 bg-zinc-900 text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-emerald-500/30">
          WhatsApp
        </span>
        <FaWhatsapp className="w-7 h-7" />
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25 pointer-events-none" />
      </motion.a>
    </div>
  );
}
