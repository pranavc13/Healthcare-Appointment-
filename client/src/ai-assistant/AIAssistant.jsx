import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import { getBotResponse, QUICK_REPLIES } from './chatResponses';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'aarohi_chat_history';

const WELCOME_MSG = {
  id: 'welcome',
  role: 'bot',
  text: `Hello! I'm **Aarohi**, your AI health assistant on Jeevan Chakra. 👋\n\nI can help you with symptom guidance, finding specialists, appointment help, and healthcare FAQs.\n\n*Disclaimer: I provide general health information only — not a substitute for professional medical advice. Always consult a qualified doctor for medical decisions.*`,
  time: new Date(),
  suggestions: ['I have a fever', 'How do I book?', 'Emergency numbers', 'Which doctor?'],
};

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-cyan-500 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white dark:bg-brand-800 border border-sand-100 dark:border-brand-700 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 bg-gold-300 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-600 underline hover:text-brand-800">$1</a>')
    .replace(/\n/g, '<br/>');
}

function MessageBubble({ msg }) {
  const isBot = msg.role === 'bot';

  return (
    <div className={`flex items-end gap-2 animate-fade-in ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
        isBot
          ? 'bg-gradient-to-br from-brand-600 to-cyan-500'
          : 'bg-gradient-to-br from-violet-500 to-purple-600'
      }`}>
        {isBot ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
      </div>

      <div className={`max-w-[75%] ${isBot ? '' : 'items-end flex flex-col'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isBot
            ? 'bg-white dark:bg-brand-800 border border-sand-100 dark:border-brand-700 text-sand-800 dark:text-sand-100 rounded-bl-sm'
            : 'bg-brand-700 text-white rounded-br-sm'
        }`}>
          <span
            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
          />
        </div>
        <p className="text-xs text-sand-400 mt-1 px-1">{formatTime(msg.time)}</p>

        {/* Suggestion chips */}
        {isBot && msg.suggestions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {msg.suggestions.map((s, i) => (
              <button
                key={i}
                data-suggestion={s}
                className="text-xs bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 px-3 py-1.5 rounded-full hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.length > 0 ? parsed : [WELCOME_MSG];
      }
    } catch {}
    return [WELCOME_MSG];
  });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    } catch {}
  }, [messages]);

  const sendMessage = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), role: 'user', text: trimmed, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const resp = getBotResponse(trimmed);
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: resp.response,
        time: new Date(),
        suggestions: resp.suggestions ?? [],
      };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (e) => {
    const suggestion = e.target.closest('[data-suggestion]')?.dataset?.suggestion;
    if (suggestion) sendMessage(suggestion);
  };

  const clearHistory = () => {
    setMessages([WELCOME_MSG]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-brand-950 pt-16">
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-20 md:py-8 md:pb-8 flex flex-col" style={{ height: 'calc(100dvh - 4rem)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sand-900 dark:text-white">Aarohi AI Assistant</h1>
              <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
                Online · General health guidance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 text-xs text-sand-500 dark:text-sand-400 hover:text-red-500 dark:hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5 mb-4 text-xs text-amber-700 dark:text-amber-300 shrink-0">
          ⚠️ For informational purposes only. Always consult a qualified healthcare professional for medical advice.
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4"
          onClick={handleSuggestionClick}
        >
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
          {typing && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        <div className="shrink-0 mb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_REPLIES.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="shrink-0 text-xs bg-white dark:bg-brand-900 text-sand-600 dark:text-sand-300 border border-sand-200 dark:border-brand-700 px-3 py-2 rounded-full hover:border-gold-300 hover:text-brand-700 dark:hover:text-gold-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="shrink-0 flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Aarohi anything about your health..."
            className="flex-1 bg-white dark:bg-brand-900 border border-sand-200 dark:border-brand-700 rounded-2xl px-4 py-3 text-sm text-sand-900 dark:text-white placeholder-sand-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
            disabled={typing}
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="w-12 h-12 bg-brand-700 hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-colors shrink-0"
          >
            {typing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-xs text-sand-400 mt-3 shrink-0">
          Powered by Jeevan Chakra AI · Not a substitute for professional medical advice ·{' '}
          <Link to="/emergency" className="text-brand-600 hover:underline">Emergency Help</Link>
        </p>
      </div>
    </div>
  );
}
