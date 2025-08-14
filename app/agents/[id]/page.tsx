'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Agent } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Heart, Share2, Play } from 'lucide-react';

export default function AgentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        setUser(authData.user);

        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setAgent(data);

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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  const handleFavorite = async () => {
    if (!user || !agent) return;

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
          .insert({ user_id: user.id, agent_id: agent.id });
        setIsFavorited(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (!agent?.workflow_json) return;

    const blob = new Blob([JSON.stringify(agent.workflow_json, null, 2)], { type: 'application/json' });
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

    try {
      if (navigator.share) {
        await navigator.share({
          title: agent.name,
          text: agent.description || '',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error(err);
      alert('Share failed. Please try manually.');
    }
  };

  if (loading) return <p className="text-gray-500 text-center py-10">Loading agent...</p>;
  if (error) return <p className="text-red-600 text-center py-10">{error}</p>;
  if (!agent) return <p className="text-gray-500 text-center py-10">Agent not found</p>;

  const isCreator = user?.id === agent.created_by;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      {/* Agent Card */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900">{agent.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{agent.description || 'No description provided.'}</p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Download className="w-4 h-4" /> Download Workflow
            </Button>
            <Button
              onClick={handleShare}
              className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50"
            >
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button
              onClick={handleFavorite}
              variant={isFavorited ? 'destructive' : 'default'}
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" /> {isFavorited ? 'Favorited' : 'Favorite'}
            </Button>
            {isCreator && (
              <Button
                onClick={() => router.push(`/agents/${agent.id}/edit`)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Edit Agent
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
