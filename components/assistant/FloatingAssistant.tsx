'use client';

import { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChatInterface } from './ChatInterface';

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-ping opacity-20"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          
          {/* Icon */}
          <Bot className={`w-8 h-8 text-white relative z-10 transition-transform duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`} />
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Tooltip */}
        <div className={`absolute bottom-20 right-0 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800"></div>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 shadow-2xl overflow-hidden" hideCloseButton>
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-6 border-b border-purple-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    AI Assistant
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Beta
                    </Badge>
                  </h2>
                  <p className="text-purple-100 text-sm">Ask me anything about AI agents</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="h-full overflow-hidden">
            <ChatInterface />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
