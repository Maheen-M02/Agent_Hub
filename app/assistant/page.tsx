'use client';

import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/assistant/ChatInterface';
import { useState } from 'react';

export default function AssistantPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Assistant</h1>
            <p className="text-gray-600">
              Let our AI assistant help you find the perfect agent for your needs
            </p>
          </div>
        </div>
        
        <ChatInterface />
      </div>
    </div>
  );
}