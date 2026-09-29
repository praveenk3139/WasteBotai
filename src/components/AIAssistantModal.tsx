import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareText,
  Send,
  Sparkles,
  X,
  Bot,
  User,
  Globe,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { Language } from '../utils/i18n';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text:
        language === 'ta'
          ? 'வணக்கம்! நான் வேஸ்ட்பாட் AI வளாக உதவியாளர். கழிவு மேலாண்மை, வளாக தூய்மை அல்லது தொலைந்த பொருட்களைக் கண்டறிய நான் உங்களுக்கு உதவ முடியும்.'
          : language === 'hi'
          ? 'नमस्ते! मैं वेस्टबॉट एआई कैंपस सहायक हूँ। परिसर की सफाई, कचरा छँटाई और खोई-पाई वस्तुओं में मैं आपकी सहायता कर सकता हूँ।'
          : 'Hello! I am WasteBot Assistant, your campus cleanliness, waste segregation, and lost-and-found AI guide. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const samplePrompts = [
    'Where should I dispose of a lithium battery?',
    'I found a lost gold-colored ring near library',
    'How do I report an overflowing bin in Block B?',
    'What is the campus recycling policy?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: messageText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          language,
          history: messages,
        }),
      });

      if (!res.ok) throw new Error('Assistant failed to reply');
      const data = await res.json();
      setMessages([...newMessages, { sender: 'assistant', text: data.reply }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text:
            'Sorry, I had trouble retrieving information. For immediate facilities help, visit Central Facilities Office or submit an issue ticket.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full h-[620px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-sm">WasteBot Assistant</h3>
                <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9px] font-mono font-bold">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-emerald-100">Smart Campus Cleanliness & Safety Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-1.5 overflow-x-auto text-[11px] shrink-0 scrollbar-none">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-emerald-500 whitespace-nowrap transition-colors shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start space-x-2.5 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs">
                🤖
              </div>
              <div className="p-3 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-xs flex items-center space-x-2 text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                <span>Generating campus guidance...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about waste sorting, lost items, or campus report procedures..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
