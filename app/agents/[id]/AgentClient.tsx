'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Play, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { AgentRunner } from '@/components/agents/AgentRunner';
import { WorkflowVisualizer } from '@/components/agents/WorkflowVisualizer';
import { supabase, Agent } from '@/lib/supabase';

export default function AgentClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRunner, setShowRunner] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAgent = async () => {
      try {
        const { data, error } = await supabase.from('agents').select('*').eq('id', id).single();
        if (error) throw error;
        setAgent(data);

        const { data: authData } = await supabase.auth.getUser();
        setUser(authData.user);

        if (authData.user) {
          const { data: favorite } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', authData.user.id)
            .eq('agent_id', id)
            .single();
          setIsFavorited(!!favorite);
        }
      } catch (err: any) {
        console.error('Error fetching agent:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  const handleDownload = () => {
    if (!agent) return;
    const jsonData = agent.workflow_json || { message: 'No workflow JSON available' };
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.name.replace(/\s+/g, '_')}_workflow.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!agent) return;
    const url = window.location.href;

    // try navigator.share first
    if (navigator.share) {
      try {
        await navigator.share({ title: agent.name, text: agent.description || '', url });
        return;
      } catch (err) {
        console.warn('Share failed:', err);
      }
    }

    // fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Clipboard copy failed', err);
      alert('Unable to share or copy link.');
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  if (!agent) return <div className="min-h-screen flex justify-center items-center">Agent not found</div>;

  const categoryColors: Record<string, string> = {
    'Text Processing': 'bg-blue-100 text-blue-800',
    'Content Creation': 'bg-green-100 text-green-800',
    'Data Processing': 'bg-purple-100 text-purple-800',
    'AI Vision': 'bg-orange-100 text-orange-800',
    'Development': 'bg-red-100 text-red-800',
    'Communication': 'bg-yellow-100 text-yellow-800',
    'Analytics': 'bg-indigo-100 text-indigo-800',
    'Automation': 'bg-pink-100 text-pink-800',
    default: 'bg-gray-100 text-gray-800',
  };

  const categoryColor = categoryColors[agent.category || ''] || categoryColors.default;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Agents
        </Button>

        <Card className="mb-8">
          <CardHeader className="flex justify-between items-start">
            <div className="flex space-x-4 items-start">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                {agent.icon || agent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{agent.name}</h1>
                  {agent.category && <Badge className={`${categoryColor} border-0`}>{agent.category}</Badge>}
                </div>
                <p className="text-gray-600 mb-2">{agent.description || 'No description available'}</p>
                <div className="text-sm text-gray-500">Created on {new Date(agent.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="flex space-x-2">
              {user && (
                <Button variant="outline" size="sm" onClick={() => setIsFavorited(!isFavorited)}>
                  <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                  {isFavorited ? 'Favorited' : 'Favorite'}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600" onClick={() => setShowRunner(true)}>
                <Play className="w-4 h-4 mr-2" /> Run Agent
              </Button>
              {user && agent?.created_by === user.id && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => router.push(`/agents/${agent.id}/edit`)}
  >
    Edit
  </Button>
)}

            </div>
          </CardHeader>
        </Card>

        {showRunner && <AgentRunner agent={agent} onClose={() => setShowRunner(false)} />}

      </div>
    </div>
  );
}
