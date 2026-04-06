/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Search, 
  Loader2, 
  User, 
  Bot, 
  X, 
  Plus,
  Sparkles,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { chatWithGemini, Message } from './lib/gemini';
import { cn } from './lib/utils';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [useSearch, setUseSearch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    const response = await chatWithGemini(input, messages, currentImage || undefined, useSearch);
    
    const aiMessage: Message = {
      role: 'model',
      text: response,
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-blue-500/30">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#0f0f0f] border-r border-zinc-800 transition-transform duration-300 lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Nexus AI</h1>
          </div>

          <button 
            onClick={clearChat}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-all text-sm font-medium mb-4"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-2">
            <div className="px-2 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Recent Chats
            </div>
            {messages.length === 0 ? (
              <div className="px-2 py-4 text-sm text-zinc-600 italic">
                No conversations yet
              </div>
            ) : (
              <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 truncate">
                {messages[0]?.text || "Image Analysis"}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User Account</p>
                <p className="text-xs text-zinc-500 truncate">Free Tier</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-zinc-800"
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
              useSearch ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-zinc-800 text-zinc-400 border border-transparent"
            )}
            onClick={() => setUseSearch(!useSearch)}
            >
              <Globe className="w-3.5 h-3.5" />
              Search Grounding {useSearch ? 'ON' : 'OFF'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase">
              Gemini 3 Flash
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">How can I help you today?</h2>
                <p className="text-zinc-400">Experience the next generation of AI with multimodal capabilities and real-time search.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8">
                {[
                  "Explain quantum computing",
                  "Analyze this image for details",
                  "Write a React hook for local storage",
                  "Latest news about space exploration"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left text-sm text-zinc-300 transition-all hover:bg-zinc-800/50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-4xl mx-auto",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center",
                  msg.role === 'user' ? "bg-zinc-800" : "bg-blue-600"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn(
                  "flex flex-col gap-2 max-w-[85%]",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="User upload" 
                      className="max-w-sm rounded-xl border border-zinc-800 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-zinc-800 text-zinc-100 rounded-tr-none" 
                      : "bg-transparent text-zinc-200"
                  )}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <div className="flex gap-4 max-w-4xl mx-auto">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 text-zinc-500 text-sm italic">
                <Loader2 className="w-4 h-4 animate-spin" />
                Nexus is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent">
          <div className="max-w-4xl mx-auto relative">
            {selectedImage && (
              <div className="absolute bottom-full mb-4 left-0">
                <div className="relative group">
                  <img 
                    src={selectedImage} 
                    className="h-24 w-24 object-cover rounded-xl border-2 border-blue-500 shadow-xl" 
                    alt="Preview"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="relative flex items-end gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 focus-within:border-zinc-700 transition-all shadow-2xl">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-all"
                title="Upload Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Nexus anything..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 resize-none max-h-40 min-h-[44px]"
                rows={1}
              />
              
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className={cn(
                  "p-2.5 rounded-xl transition-all flex items-center justify-center",
                  input.trim() || selectedImage 
                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20" 
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                )}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-3 text-center uppercase tracking-widest font-bold">
              Powered by Google Gemini 3 • Experimental AI
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
