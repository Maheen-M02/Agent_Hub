'use client';

import { useState, useEffect } from 'react';
import { Heart, Play, ExternalLink, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Agent } from '@/lib/supabase';

interface AgentCardProps {
  agent: Agent;
  onRun?: (agent: Agent) => void;
}

export function AgentCard({ agent, onRun }: AgentCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('agent_id', agent.id)
          .single();
        
        setIsFavorited(!!data);
      }
    };

    getUser();
  }, [agent.id]);

  const handleFavorite = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('agent_id', agent.id);
        
        setIsFavorited(false);
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            agent_id: agent.id,
          });
        
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
    
    setIsLoading(false);
  };

  const categoryColors: Record<string, string> = {
    'Text Processing': 'bg-blue-100 text-blue-800',
    'Content Creation': 'bg-green-100 text-green-800',
    'Data Processing': 'bg-purple-100 text-purple-800',
    'AI Vision': 'bg-orange-100 text-orange-800',
    'Development': 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800',
  };

  const categoryColor = categoryColors[agent.category || ''] || categoryColors.default;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
              {agent.name}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              {agent.icon && (
                <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  {agent.icon}
                </div>
              )}
            </div>
            {agent.category && (
              <Badge className={`mt-2 ${categoryColor} border-0`}>
                {agent.category}
              </Badge>
            )}
          </div>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              disabled={isLoading}
              className={`${
                isFavorited 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-400 hover:text-red-500'
              } transition-colors`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {agent.description || 'No description available'}
        </p>

        {/* Example Preview */}
        {agent.example_input && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="text-xs font-medium text-gray-700">Example:</div>
            <div className="text-xs text-gray-600 bg-white p-2 rounded border">
              <strong>Input:</strong> {JSON.stringify(agent.example_input).slice(0, 100)}...
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500">
          <User className="w-3 h-3 mr-1" />
          <span>Community</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/agents/${agent.id}`}
            className="text-sm"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => onRun?.(agent)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm"
          >
            <Play className="w-3 h-3 mr-1" />
            Run
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}