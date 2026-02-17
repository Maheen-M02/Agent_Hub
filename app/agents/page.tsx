'use client';

import { useState, useEffect } from 'react';
import { Filter, SortAsc, SortDesc, Grid, List, Search, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { AgentCard } from '@/components/agents/AgentCard';
import { AgentRunner } from '@/components/agents/AgentRunner';
import { supabase, Agent } from '@/lib/supabase';

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('agents')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });
      
      if (data) {
        setAgents(data);
        const uniqueCategories = Array.from(
          new Set(data.map(agent => agent.category).filter(Boolean))
        ) as string[];
        setCategories(uniqueCategories);
      }
      setLoading(false);
    };

    fetchAgents();
  }, [sortBy, sortOrder]);

  useEffect(() => {
    let filtered = agents;

    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(agent => agent.category === selectedCategory);
    }

    setFilteredAgents(filtered);
  }, [agents, searchQuery, selectedCategory]);

  const handleRunAgent = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const popularAgents = agents.slice(0, 6);
  const recentAgents = agents.slice(0, 8);

  if (selectedAgent) {
    return (
      <>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
          <AgentRunner 
            agent={selectedAgent} 
            onClose={() => setSelectedAgent(null)} 
          />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <div className="mb-6">
            <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 backdrop-blur-sm px-6 py-3 text-base">
              <Sparkles className="w-5 h-5 mr-2" />
              {agents.length} AI Agents Available
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            AI Agents{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Directory
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Discover, run, and download AI-powered workflows
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 z-10" />
              <Input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-16 pr-6 py-7 text-lg border-2 border-slate-700 bg-slate-800/90 backdrop-blur-xl text-white placeholder:text-gray-400 focus:border-purple-500 rounded-2xl shadow-2xl relative"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-1 rounded-xl">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 text-gray-300 data-[state=active]:text-white rounded-lg">
              All
            </TabsTrigger>
            <TabsTrigger value="popular" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 text-gray-300 data-[state=active]:text-white rounded-lg">
              Popular
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 text-gray-300 data-[state=active]:text-white rounded-lg">
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="mb-8 flex flex-wrap items-center gap-4 justify-center">
              <div className="flex items-center space-x-2 bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-xl px-4 py-2">
                <Filter className="w-5 h-5 text-purple-400" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 border-0 bg-transparent text-white">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-slate-800/90 border-slate-700 text-white hover:bg-slate-700"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </Button>

              <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-none ${viewMode === 'grid' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'text-gray-300'}`}
                >
                  <Grid className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-none ${viewMode === 'list' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'text-gray-300'}`}
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="mb-8 text-center">
              <p className="text-lg text-gray-300">
                {loading ? 'Loading...' : `${filteredAgents.length} agents found`}
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse bg-slate-800/50 border-slate-700 h-48" />
                ))}
              </div>
            ) : filteredAgents.length === 0 ? (
              <Card className="text-center py-16 bg-slate-800/90 border-slate-700">
                <CardContent>
                  <Search className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-300 text-xl mb-6">No agents found</p>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} onRun={handleRunAgent} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular">
            <div className="text-center mb-12">
              <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-3">Popular Agents</h3>
              <p className="text-gray-300 text-lg">Most used agents</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} onRun={handleRunAgent} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="text-center mb-12">
              <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-3">Recently Added</h3>
              <p className="text-gray-300 text-lg">Latest agents</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} onRun={handleRunAgent} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
