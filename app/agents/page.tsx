'use client';

import { useState, useEffect } from 'react';
import { Filter, SortAsc, SortDesc, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        
        // Extract unique categories
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

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(agent => agent.category === selectedCategory);
    }

    setFilteredAgents(filtered);
  }, [agents, searchQuery, selectedCategory]);

  const handleRunAgent = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  if (selectedAgent) {
    return (
      <>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="min-h-screen bg-gray-50 py-8">
          <AgentRunner 
            agent={selectedAgent} 
            onClose={() => setSelectedAgent(null)} 
          />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Agents Directory</h1>
          <p className="text-gray-600">
            Discover and run AI-powered workflows for any task
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>

            {/* View Mode */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="px-3 py-1">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="px-3 py-1">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${filteredAgents.length} agents found`}
          </p>
        </div>

        {/* Agents Grid/List */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg mb-4">
                No agents found matching your criteria
              </p>
              <Button
                variant="outline"
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
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 max-w-4xl'
          }`}>
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onRun={handleRunAgent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}