'use client';

import { useState, useEffect } from 'react';
import { Heart, Play, ExternalLink, User, Eye, Edit, Download, Share2, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const [isHovered, setIsHovered] = useState(false);

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
          .maybeSingle();
        
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

  const handleShare = async () => {
    const url = `${window.location.origin}/agents/${agent.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: agent.name,
          text: agent.description || '',
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        // You could add a toast notification here
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDownload = () => {
    if (agent.workflow_json) {
      const blob = new Blob([JSON.stringify(agent.workflow_json, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${agent.name.replace(/\s+/g, '_')}_workflow.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const isCreator = user?.id === agent.created_by;

  const categoryColors: Record<string, string> = {
    'Text Processing': 'bg-blue-100 text-blue-800',
    'Content Creation': 'bg-green-100 text-green-800',
    'Data Processing': 'bg-purple-100 text-purple-800',
    'AI Vision': 'bg-orange-100 text-orange-800',
    'Development': 'bg-red-100 text-red-800',
    'Communication': 'bg-cyan-100 text-cyan-800',
    'Analytics': 'bg-indigo-100 text-indigo-800',
    'Automation': 'bg-pink-100 text-pink-800',
    default: 'bg-gray-100 text-gray-800',
  };

  const categoryColor = categoryColors[agent.category || ''] || categoryColors.default;

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-gray-200 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {agent.icon && (
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {agent.icon}
                </div>
              )}
              {agent.category && (
                <Badge className={`${categoryColor} border-0 text-xs`}>
                  {agent.category}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight">
              {agent.name}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{new Date(agent.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
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
            
            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Agent
                </DropdownMenuItem>
                {agent.workflow_json && (
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Workflow
                  </DropdownMenuItem>
                )}
                {isCreator && (
                  <DropdownMenuItem onClick={() => window.location.href = `/agents/${agent.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Agent
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
          {agent.description || 'No description available'}
        </p>

        {/* Example Preview */}
        {agent.example_input && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 space-y-2 border">
            <div className="text-xs font-medium text-gray-700 flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              Example Usage:
            </div>
            <div className="text-xs text-gray-600 bg-white p-2 rounded border font-mono">
              <strong className="text-purple-600">Input:</strong> {JSON.stringify(agent.example_input).slice(0, 80)}...
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500">
          <User className="w-3 h-3 mr-1" />
          <span>{isCreator ? 'Your Agent' : 'Community'}</span>
        </div>
        
        <div className={`flex items-center space-x-2 transition-all duration-200 ${
          isHovered ? 'transform translate-x-0' : ''
        }`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/agents/${agent.id}`}
            className="text-sm hover:bg-purple-50 hover:border-purple-300 transition-colors"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => onRun?.(agent)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm shadow-sm hover:shadow-md transition-shadow"
          >
            <Play className="w-3 h-3 mr-1" />
            Run
          </Button>
        </div>
      </CardFooter>
      </div>
    </Card>
  );
}