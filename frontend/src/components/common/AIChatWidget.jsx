import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Sparkles, X, Minimize2, Trash2, RefreshCw, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AIChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to **Sky Lounge**! 🌟 I am your AI Culinary & Hospitality Concierge. How can I assist you today with our menu, table reservations, or order updates?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    '🌱 Spicy veg starters under ₹300',
    '🕒 Opening hours & location',
    '📦 Status of my latest order',
    '📅 Table availability for 4 tonight',
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  useEffect(() => {
    // Fetch suggestions from backend API
    const fetchSuggestions = async () => {
      try {
        const { data } = await api.get('/ai/suggestions');
        if (data?.success && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions.map((s) => s.text));
        }
      } catch (err) {
        // Fallback default suggestions retained
      }
    };
    fetchSuggestions();
  }, []);

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMsg = {
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const { data } = await api.post('/ai/chat', {
        message: queryText,
        conversationHistory: history,
      });

      if (data?.success) {
        const assistantMsg = {
          role: 'assistant',
          content: data.answer,
          sources: data.sources || [],
          toolsUsed: data.toolsUsed || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data?.message || 'Failed to generate AI response');
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      const errorMsg = {
        role: 'assistant',
        isError: true,
        content: err.response?.data?.message || err.message || 'Apologies! I encountered an error connecting to Sky Lounge AI services. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation reset. How else can I assist you at **Sky Lounge**?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Helper renderer to format simple markdown bold and bullet lists safely
  const formatMarkdown = (text) => {
    if (!text) return '';

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold replacement
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <li key={idx} className="ml-4 list-disc text-amber-100/90 my-1" dangerouslySetInnerHTML={{ __html: bulletText }} />
        );
      }

      return (
        <p key={idx} className="my-1 text-slate-100 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-zinc-950 font-semibold rounded-full shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open Sky Lounge AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-zinc-950 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-sm tracking-wide font-bold">Ask Sky AI</span>
          <Sparkles className="w-4 h-4 text-zinc-900 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Floating AI Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] flex flex-col bg-zinc-900/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-amber-400 text-base tracking-wide">Sky Lounge AI</h3>
                  <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Groq RAG
                  </span>
                </div>
                <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isAuthenticated ? (
                    <span className="text-emerald-400 font-medium">Logged in: {user?.name || 'Guest'}</span>
                  ) : (
                    <span>Guest Mode</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear Conversation"
                className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/60 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-lg transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-200`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : msg.isError
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-zinc-800 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Content Bubble */}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-amber-600 text-zinc-950 rounded-tr-none font-medium shadow-lg shadow-amber-900/20'
                      : msg.isError
                      ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-tl-none'
                      : 'bg-zinc-800/90 border border-zinc-700/50 text-zinc-100 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="space-y-1">{formatMarkdown(msg.content)}</div>

                  {/* Tool execution badge if present */}
                  {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-700/50 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-amber-400/80 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Safe MCP Tools:
                      </span>
                      {msg.toolsUsed.map((tool, tIdx) => (
                        <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded bg-zinc-900/80 text-zinc-300 border border-zinc-700">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="mt-1 text-[10px] opacity-50 text-right">{msg.timestamp}</div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 items-center text-zinc-400 text-sm animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs text-zinc-300 font-medium ml-1">Searching Sky Lounge knowledge...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Pills */}
          {messages.length < 3 && suggestions.length > 0 && (
            <div className="px-4 py-2 bg-zinc-950/60 border-t border-zinc-800 flex gap-2 overflow-x-auto no-scrollbar">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  className="shrink-0 px-3 py-1.5 text-xs bg-zinc-800/80 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-700/60 hover:border-amber-500/40 rounded-full transition-colors flex items-center gap-1"
                >
                  <span>{sug}</span>
                  <ChevronRight className="w-3 h-3 text-zinc-500" />
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about dishes, orders, table booking..."
              disabled={loading}
              className="flex-1 bg-zinc-900 border border-zinc-700/70 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
