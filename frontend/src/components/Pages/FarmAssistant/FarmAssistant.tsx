import React, { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from '../../common/MarkdownRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

const SUGGESTED_QUESTIONS = [
  "What is the best time to plant maize in Nigeria?",
  "How do I know if my soil needs more fertilizer?",
  "What causes yellowing leaves on cassava?",
  "How can I protect my crops from heavy rain damage?",
  "What are the signs of pest infestation in tomatoes?",
  "How should I store harvested yam to prevent spoilage?",
  "What cover crops are best for improving soil health?",
  "How do I manage a crop affected by drought?",
];

const FarmAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
          context: null,
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
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

  const clearChat = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  return (
    <div className="animate-fadeIn flex flex-col h-full" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-robot text-white text-lg"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold gradient-text">AgriSense AI Farm Assistant</h3>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Powered by Amazon Nova via AWS Bedrock</span>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <i className="fas fa-trash-alt text-xs"></i>
            <span>Clear chat</span>
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white/80 dark:bg-gray-800/80 glass rounded-xl flex flex-col overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl mb-6">
                <i className="fas fa-seedling text-white text-3xl"></i>
              </div>
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Ask me anything about farming
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
                I'm your AI-powered agricultural advisor. Ask about crop diseases, planting schedules, soil health, weather management, or any farming challenge.
              </p>

              {/* Suggested Questions */}
              <div className="w-full max-w-2xl">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide text-center mb-3">
                  Suggested questions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-600/50 hover:border-green-300 dark:hover:border-green-700/50 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 group"
                    >
                      <div className="flex items-start space-x-2">
                        <i className="fas fa-leaf text-green-400 mt-0.5 flex-shrink-0 text-xs"></i>
                        <span>{q}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  {/* Nova avatar */}
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1 shadow-md">
                      <i className="fas fa-robot text-white text-xs"></i>
                    </div>
                  )}

                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-tr-sm shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-100 rounded-tl-sm'
                  }`}>
                    {message.role === 'assistant' ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                    <div className={`text-xs mt-1.5 ${
                      message.role === 'user' ? 'text-green-100' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* User avatar */}
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 ml-3 mt-1">
                      <i className="fas fa-user text-gray-600 dark:text-gray-300 text-xs"></i>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading */}
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1 shadow-md">
                    <i className="fas fa-robot text-white text-xs"></i>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700/60 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick follow-ups after first exchange */}
              {messages.length >= 2 && messages.length <= 4 && !isLoading && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/40 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700/50 p-4 flex-shrink-0">
          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600/50 px-4 py-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/20 transition-all duration-200">
            <i className="fas fa-seedling text-green-400 flex-shrink-0"></i>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your farm, crops, or soil..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none disabled:opacity-50"
              autoFocus
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
            >
              <i className="fas fa-paper-plane text-xs"></i>
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
            Powered by Amazon Nova Lite via AWS Bedrock · AgriSense AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmAssistant;