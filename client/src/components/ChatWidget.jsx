import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Maximize2 } from 'lucide-react';
import { getBotResponse } from '../ai-assistant/chatResponses';
import { Link } from 'react-router-dom';

const WELCOME = {
  id: 'w',
  role: 'bot',
  text: "Hi! I'm Aarohi, your AI health assistant. How can I help you today?",
  suggestions: ['I have a fever', 'How to book?', 'Emergency help'],
};

function renderText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export default function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
  const bottomRef = useRef(null);
  const hasUnread = useRef(false);
  const [badge, setBadge]     = useState(false);

  useEffect(() => {
    if (open) {
      setBadge(false);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages]);

  const send = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }]);
    setTyping(true);
    setTimeout(() => {
      const resp = getBotResponse(trimmed);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: resp.response,
        suggestions: (resp.suggestions ?? []).slice(0, 2),
      }]);
      setTyping(false);
      if (!open) setBadge(true);
    }, 800 + Math.random() * 500);
  }, [open]);

  const handleSuggestion = (e) => {
    const s = e.target.closest('[data-sug]')?.dataset?.sug;
    if (s) send(s);
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex flex-col items-end gap-2">

      {/* Chat window */}
      {open && (
        <div className="w-[min(20rem,calc(100vw-2rem))] h-[min(440px,calc(100dvh-10rem))] bg-white dark:bg-brand-900 rounded-2xl shadow-2xl border border-sand-200 dark:border-brand-800 flex flex-col overflow-hidden animate-slide-up">

          {/* Header */}
          <div className="bg-gradient-to-r from-brand-700 to-cyan-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Aarohi</p>
                <p className="text-brand-100 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block animate-pulse" />
                  AI Health Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                to="/ai-assistant"
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Open full chat"
                onClick={() => setOpen(false)}
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-sand-50 dark:bg-brand-950/50"
            onClick={handleSuggestion}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2 items-end animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${
                  msg.role === 'bot' ? 'bg-brand-600' : 'bg-violet-500'
                }`}>
                  {msg.role === 'bot'
                    ? <Bot className="w-3 h-3 text-white" />
                    : <User className="w-3 h-3 text-white" />
                  }
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                  <div className={`rounded-xl text-xs leading-relaxed px-3 py-2 ${
                    msg.role === 'bot'
                      ? 'bg-white dark:bg-brand-800 text-sand-800 dark:text-sand-100 border border-sand-100 dark:border-brand-700 rounded-tl-sm'
                      : 'bg-brand-700 text-white rounded-tr-sm'
                  }`}>
                    <span dangerouslySetInnerHTML={{ __html: renderText(
                      msg.text.length > 200 ? msg.text.slice(0, 200) + '...' : msg.text
                    )}} />
                  </div>
                  {msg.suggestions?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {msg.suggestions.map((s, i) => (
                        <button key={i} data-sug={s}
                          className="text-[10px] bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 px-2 py-1 rounded-full hover:bg-brand-100 transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2 items-end">
                <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white dark:bg-brand-800 border border-sand-100 dark:border-brand-700 rounded-xl rounded-tl-sm px-3 py-2 flex gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-gold-300 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={e => { e.preventDefault(); send(input); }}
            className="p-2.5 border-t border-sand-100 dark:border-brand-800 flex gap-2 shrink-0 bg-white dark:bg-brand-900"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about symptoms, booking..."
              disabled={typing}
              className="flex-1 text-xs bg-sand-50 dark:bg-brand-800 border border-sand-200 dark:border-brand-700 rounded-xl px-3 py-2 text-sand-900 dark:text-white placeholder-sand-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="w-8 h-8 bg-brand-700 hover:bg-brand-800 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-center text-[10px] text-sand-400 pb-2 bg-white dark:bg-brand-900">
            For emergencies call <strong>108</strong> ·{' '}
            <Link to="/ai-assistant" className="text-brand-600" onClick={() => setOpen(false)}>Full chat</Link>
          </p>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-14 h-14 bg-gradient-to-br from-brand-700 to-cyan-600 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-200"
        aria-label="Open AI Health Assistant"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        {badge && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-brand-950 animate-pulse" />
        )}
      </button>
    </div>
  );
}
