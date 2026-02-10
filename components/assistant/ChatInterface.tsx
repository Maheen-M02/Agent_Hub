'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Code, Lightbulb, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Quick action suggestions
  const quickActions = [
    { icon: <Sparkles className="w-4 h-4" />, text: "Find agents for text processing", color: "bg-blue-100 text-blue-800" },
    { icon: <Code className="w-4 h-4" />, text: "Help me create a custom agent", color: "bg-green-100 text-green-800" },
    { icon: <Lightbulb className="w-4 h-4" />, text: "Explain n8n workflow best practices", color: "bg-yellow-100 text-yellow-800" },
    { icon: <Zap className="w-4 h-4" />, text: "How to integrate APIs with agents", color: "bg-purple-100 text-purple-800" },
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
          conversationHistory: messages.slice(-6) // Send last 6 messages for context
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
    <div className="max-w-4xl mx-auto p-6">
      <Card className="h-[700px] flex flex-col shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <span>AI Assistant</span>
              <p className="text-sm font-normal text-gray-600">Your expert guide for AI agents and automation</p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Quick Actions - Show only when conversation is short */}
          {messages.length <= 2 && (
            <div className="p-4 border-b bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">Quick actions to get started:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Badge
                    key={index}
                    className={`${action.color} cursor-pointer hover:opacity-80 transition-opacity px-3 py-2 text-xs`}
                    onClick={() => handleQuickAction(action.text)}
                  >
                    {action.icon}
                    <span className="ml-2">{action.text}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  } items-start space-x-3`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user'
                        ? 'bg-gray-200'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className={`text-sm prose prose-sm max-w-none ${
                      message.type === 'user' ? 'prose-invert' : ''
                    }`}>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <div className={`text-xs mt-2 opacity-70 ${
                      message.type === 'user' ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about AI agents, automation, or how to build workflows..."
                disabled={isLoading}
                className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
              <Button
                onClick={() => handleSend(undefined, input)}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Ask me to help create agents, explain workflows, or provide code examples
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
