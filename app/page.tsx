'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Zap, Users, Shield, Bot, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { AgentCard } from '@/components/agents/AgentCard';
import { supabase, Agent } from '@/lib/supabase';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchFeaturedAgents = async () => {
      const { data } = await supabase
        .from('agents')
        .select('*')
        .limit(6);
      
      if (data) {
        setFeaturedAgents(data);
      }
    };

    fetchFeaturedAgents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Discover AI-Powered Workflows
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find the Perfect{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Agent
            </span>
            {' '}for Any Task
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Explore our growing library of AI-powered workflows created with n8n. 
            From text processing to data analysis, find agents that automate your work instantly.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for agents (e.g., 'text summarizer', 'email generator')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Link href={`/agents${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto">
                  Search Agents
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link href="/agents">
              <Button variant="outline" size="lg" className="border-purple-200 hover:bg-purple-50">
                <Bot className="w-5 h-5 mr-2" />
                Browse All Agents
              </Button>
            </Link>
            <Link href="/assistant">
              <Button variant="outline" size="lg" className="border-blue-200 hover:bg-blue-50">
                <Sparkles className="w-5 h-5 mr-2" />
                AI Assistant
              </Button>
            </Link>
            <Link href="/create">
              <Button variant="outline" size="lg" className="border-green-200 hover:bg-green-50">
                <Zap className="w-5 h-5 mr-2" />
                Create Agent
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose AI Agent Hub?
            </h2>
            <p className="text-lg text-gray-600">
              The most comprehensive platform for AI-powered automation workflows
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Instant Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Run powerful AI workflows instantly without any setup. 
                  Just provide your input and get results in seconds.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access agents created by the community and share your own. 
                  Benefit from collective intelligence and creativity.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built with enterprise-grade security and reliability. 
                  Your data is processed securely and never stored unnecessarily.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Agents</h2>
              <p className="text-gray-600">Popular workflows trusted by the community</p>
            </div>
            <Link href="/agents">
              <Button variant="outline">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-purple-200">Available Agents</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="text-purple-200">Workflows Executed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-purple-200">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Automate Your Workflows?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of users who are already saving time with our AI agents
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <TrendingUp className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline" size="lg">
                Explore Agents
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}