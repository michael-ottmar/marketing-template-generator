'use client';

import { useState, useRef, useEffect } from 'react';

export default function QAAssistant({
  projectData,
  onClose,
  apiEndpoint = '/api/qa'
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          projectData,
          conversationHistory: messages,
          mode: 'chat'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: assistantMessage,
            streaming: true
          };
          return newMessages;
        });
      }

      // Mark as complete
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].streaming = false;
        return newMessages;
      });

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please check that your ANTHROPIC_API_KEY is configured in Vercel environment variables.`,
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    'Check grammar across all markets',
    'Compare tone consistency',
    'Find inconsistent terminology',
    'Check character limits for UI'
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-gray-800">QA Assistant</h3>
          <p className="text-sm text-gray-500">Powered by Claude</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-4">Ask me anything about your copy!</p>
            <div className="space-y-2">
              {quickActions.map(action => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  disabled={isLoading}
                  className="block w-full px-4 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : msg.error
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.streaming && <span className="animate-pulse">▋</span>}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage(input)}
            placeholder="Ask about your copy..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
