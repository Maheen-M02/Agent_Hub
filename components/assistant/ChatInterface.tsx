'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI assistant for the Agent Hub platform. I can help you with:\n
🤖 **Find existing agents** - Search and recommend from our library
🛠️ **Create new agents** - Step-by-step guidance with code examples
⚡ **Technical support** - n8n workflows, APIs, integrations
💡 **General AI help** - Any questions about AI, automation, or technology\n
What would you like to work on today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { icon: <Sparkles className="w-4 h-4" />, text: "Find agents for text processing" },
    { icon: <Sparkles className="w-4 h-4" />, text: "Help me create a custom agent" },
    { icon: <Sparkles className="w-4 h-4" />, text: "Explain n8n workflow best practices" },
    { icon: <Sparkles className="w-4 h-4" />, text: "How to integrate APIs with agents" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (event?: React.MouseEvent<HTMLButtonElement>, messageText?: string) => {
    if (event) {
      event.preventDefault();
    }
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: textToSend,
          conversationHistory: messages.slice(-6)
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again or check your connection.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionText: string) => {
    handleSend(undefined, actionText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(undefined, input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {messages.length <= 2 && (
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <p className="text-sm text-gray-400 mb-3">Quick actions to get started:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <Badge
                key={index}
                className="bg-purple-500/20 text-purple-300 border border-purple-500/30 cursor-pointer hover:bg-purple-500/30 transition-all px-3 py-2 text-xs"
                onClick={() => handleQuickAction(action.text)}
              >
                {action.icon}
                <span className="ml-2">{action.text}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[85%] ${
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              } items-start gap-3`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user'
                    ? 'bg-slate-700'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600'
                }`}
              >
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={`px-5 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-slate-800 text-gray-200 border border-slate-700'
                }`}
              >
                <div className={`text-sm prose prose-sm max-w-none ${
                  message.type === 'user' ? 'prose-invert' : 'prose-slate'
                }`}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <div className={`text-xs mt-2 opacity-60 ${
                  message.type === 'user' ? 'text-purple-100' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-sm text-gray-300">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-700 p-4 bg-slate-800/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
          />
          <Button
            onClick={() => handleSend(undefined, input)}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Ask me to help create agents, explain workflows, or provide code examples
        </p>
      </div>
    </div>
  );
}
