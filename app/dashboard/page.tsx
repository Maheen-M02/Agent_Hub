'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgentCard } from '@/components/agents/AgentCard';
import { Heart, Clock, Plus, BarChart3, User, Bot, Sparkles, TrendingUp, Zap } from 'lucide-react';
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
      const { data: agentsData } = await supabase
        .from('agents')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (agentsData) {
        setUserAgents(agentsData);
        setStats(prev => ({ ...prev, totalAgents: agentsData.length }));
      }

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-700 rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with 3D effect */}
        <div className="mb-12 text-center">
          <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 backdrop-blur-sm px-6 py-3 mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Your Dashboard
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {user?.user_metadata?.full_name || 'Agent Creator'}
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Manage your agents, favorites, and view your activity
          </p>
        </div>

        {/* Stats Cards with 3D effect */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700 backdrop-blur-xl hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Your Agents</CardTitle>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Bot className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-white mb-2">{stats.totalAgents}</div>
              <p className="text-sm text-gray-400">
                Agents you've created
              </p>
            </CardContent>
          </Card>

          <Card className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700 backdrop-blur-xl hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Favorites</CardTitle>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-white mb-2">{stats.totalFavorites}</div>
              <p className="text-sm text-gray-400">
                Agents you've favorited
              </p>
            </CardContent>
          </Card>

          <Card className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700 backdrop-blur-xl hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Total Usage</CardTitle>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-white mb-2">{stats.totalUsage}</div>
              <p className="text-sm text-gray-400">
                Times you've run agents
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Your Agents */}
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700 backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700">
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-purple-400" />
                Your Agents
              </CardTitle>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500" asChild>
                <a href="/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </a>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {userAgents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-10 h-10 text-purple-400" />
                  </div>
                  <p className="text-gray-400 mb-6 text-lg">You haven't created any agents yet</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500" asChild>
                    <a href="/create">Create Your First Agent</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userAgents.slice(0, 3).map((agent) => (
                    <div key={agent.id} className="group relative bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:bg-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:scale-102 hover:shadow-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-lg mb-2">{agent.name}</h4>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                            {agent.description}
                          </p>
                          {agent.category && (
                            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {agent.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {userAgents.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-800">
                        View All ({userAgents.length} agents)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favorites */}
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700 backdrop-blur-xl hover:shadow-2xl hover:shadow-pink-500/30 transition-all duration-300">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="text-white flex items-center">
                <Heart className="w-5 h-5 mr-2 text-pink-400" />
                Your Favorites
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-pink-400" />
                  </div>
                  <p className="text-gray-400 mb-6 text-lg">No favorites yet</p>
                  <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-800" asChild>
                    <a href="/agents">Browse Agents</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.slice(0, 3).map((agent) => (
                    <div key={agent.id} className="group relative bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:bg-slate-800 hover:border-pink-500/50 transition-all duration-300 hover:scale-102 hover:shadow-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-lg mb-2">{agent.name}</h4>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                            {agent.description}
                          </p>
                          {agent.category && (
                            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {agent.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {favorites.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-800">
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
        <Card className="mt-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="flex items-center text-white">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {recentUsage.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-gray-400 text-lg">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsage.map((usage) => (
                  <div key={usage.id} className="flex items-center justify-between py-4 px-5 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300">
                    <div>
                      <p className="font-medium text-white">
                        Ran "{usage.agents?.name}"
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(usage.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                      Completed
                    </Badge>
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
