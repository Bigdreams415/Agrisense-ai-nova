import React, { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from '../../common/MarkdownRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface NovaChatProps {
  context: {
    crop: string;
    disease: string;
    confidence: number;
    urgency?: string;
    prediction_id?: string;
  } | null;
  fullContext?: object;
}

const QUICK_QUESTIONS = [
  "What should I spray to treat this?",
  "Is this disease spreading to nearby crops?",
  "How much will treatment cost?",
  "Can I still eat the harvest?",
  "How long before my crop recovers?",
  "What organic options do I have?",
];

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

const NovaChat: React.FC<NovaChatProps> = ({ context, fullContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset chat when diagnosis changes
  useEffect(() => {
    if (context) {
      setMessages([]);
      setIsExpanded(true);
    }
  }, [context?.prediction_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: fullContext || context,
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    if (urgency === 'HIGH') return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (urgency === 'LOW') return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
  };

  if (!context) return null;

  const isHealthy = context.disease?.toLowerCase().includes('healthy');

  return (
    <div className="mt-6 animate-fadeIn">
      {/* Chat Card */}
      <div className="bg-white/80 dark:bg-gray-800/80 glass rounded-xl overflow-hidden border border-green-200/50 dark:border-green-700/30 shadow-lg">

        {/* Header */}
        <div
          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-900/30 dark:to-emerald-900/30 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            {/* Nova Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              <i className="fas fa-robot text-white text-sm"></i>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-800 dark:text-white text-sm">
                  Ask Nova about this diagnosis
                </span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              </div>
              {/* Context pill */}
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {context.crop} •{' '}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  isHealthy
                    ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
                    : 'text-red-600 bg-red-100 dark:bg-red-900/30'
                }`}>
                  {context.disease}
                </span>
                {context.urgency && !isHealthy && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getUrgencyColor(context.urgency)}`}>
                    {context.urgency} urgency
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </span>
            )}
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400 text-sm transition-transform duration-300`}></i>
          </div>
        </div>

        {/* Expandable Body */}
        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>

          {/* Quick Questions — only show when no messages yet */}
          {messages.length === 0 && (
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">
                Suggested questions
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/40 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all duration-200 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="px-4 pt-4 space-y-3 max-h-72 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  {/* Nova avatar */}
                  {message.role === 'assistant' && (
                    <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                      <i className="fas fa-robot text-white text-xs"></i>
                    </div>
                  )}

                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-100 rounded-tl-sm'
                  }`}>
                    {message.role === 'assistant' ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <div>{message.content}</div>
                    )}
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-green-100' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* User avatar */}
                  {message.role === 'user' && (
                    <div className="w-7 h-7 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 ml-2 mt-1">
                      <i className="fas fa-user text-gray-600 dark:text-gray-300 text-xs"></i>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading bubble */}
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <i className="fas fa-robot text-white text-xs"></i>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700/60 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Quick questions after first message */}
          {messages.length > 0 && messages.length < 3 && (
            <div className="px-4 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="text-xs px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/40 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all duration-200 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 pt-3">
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600/50 px-3 py-2 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/20 transition-all duration-200">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about ${context.disease}...`}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
              >
                <i className="fas fa-paper-plane text-xs"></i>
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
              Powered by Amazon Nova via AWS Bedrock
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovaChat;