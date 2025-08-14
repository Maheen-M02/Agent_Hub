'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgentCard } from '@/components/agents/AgentCard';
import { Heart, Clock, Plus, BarChart3, User, Bot } from 'lucide-react';
import { supabase, Agent, UsageLog } from '@/lib/supabase';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [favorites, setFavorites] = useState<Agent[]>([]);
  const [recentUsage, setRecentUsage] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalFavorites: 0,
    totalUsage: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth');
        return;
      }

      setUser(user);
      await loadDashboardData(user.id);
    };

    checkAuthAndLoadData();
  }, [router]);

  const loadDashboardData = async (userId: string) => {
    try {
      // Load user's agents
      const { data: agentsData } = await supabase
        .from('agents')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (agentsData) {
        setUserAgents(agentsData);
        setStats(prev => ({ ...prev, totalAgents: agentsData.length }));
      }

      // Load favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select(`
          *,
          agents (*)
        `)
        .eq('user_id', userId);

      if (favoritesData) {
        const favoriteAgents = favoritesData
          .map(fav => fav.agents)
          .filter(Boolean) as Agent[];
        setFavorites(favoriteAgents);
        setStats(prev => ({ ...prev, totalFavorites: favoriteAgents.length }));
      }

      // Load recent usage
      const { data: usageData } = await supabase
        .from('agent_usage_logs')
        .select(`
          *,
          agents (name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (usageData) {
        setRecentUsage(usageData);
        
        // Get total usage count
        const { count } = await supabase
          .from('agent_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        setStats(prev => ({ ...prev, totalUsage: count || 0 }));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email}!
          </h1>
          <p className="text-gray-600">
            Manage your agents, favorites, and view your activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAgents}</div>
              <p className="text-xs text-muted-foreground">
                Agents you've created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFavorites}</div>
              <p className="text-xs text-muted-foreground">
                Agents you've favorited
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
              <p className="text-xs text-muted-foreground">
                Times you've run agents
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Your Agents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Agents</CardTitle>
              <Button size="sm" asChild>
                <a href="/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              {userAgents.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You haven't created any agents yet</p>
                  <Button asChild>
                    <a href="/create">Create Your First Agent</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userAgents.slice(0, 3).map((agent) => (
                    <div key={agent.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{agent.name}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {agent.description}
                          </p>
                          {agent.category && (
                            <Badge className="mt-2 bg-purple-100 text-purple-800 border-0">
                              {agent.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {userAgents.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">
                        View All ({userAgents.length} agents)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favorites */}
          <Card>
            <CardHeader>
              <CardTitle>Your Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No favorites yet</p>
                  <Button variant="outline" asChild>
                    <a href="/agents">Browse Agents</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.slice(0, 3).map((agent) => (
                    <div key={agent.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{agent.name}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {agent.description}
                          </p>
                          {agent.category && (
                            <Badge className="mt-2 bg-blue-100 text-blue-800 border-0">
                              {agent.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {favorites.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">
                        View All ({favorites.length} favorites)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsage.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsage.map((usage) => (
                  <div key={usage.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">
                        Ran "{usage.agents?.name}"
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(usage.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}