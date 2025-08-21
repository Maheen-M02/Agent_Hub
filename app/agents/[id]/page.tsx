'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Agent } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Heart, Share2 } from 'lucide-react';

export default function AgentClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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
        setName(data.name);
        setDescription(data.description || '');

        if (authData.user) {
          const { data: favorite } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', authData.user.id)
            .eq('agent_id', id)
            .maybeSingle();
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
      console.error('Share failed:', err);
      alert('Share failed. Please try manually.');
    }
  };

  const handleSaveEdit = async () => {
    if (!user || !agent) return;
    try {
      const { error } = await supabase
        .from('agents')
        .update({ name, description })
        .eq('id', agent.id)
        .eq('created_by', user.id);
      if (error) throw error;
      setAgent({ ...agent, name, description });
      setEditMode(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p className="text-center py-12 text-gray-500">Loading agent...</p>;
  if (error) return <p className="text-center py-12 text-red-600">{error}</p>;
  if (!agent) return <p className="text-center py-12 text-gray-500">Agent not found</p>;

  const isCreator = user?.id === agent.created_by;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft /> Back</Button>
        {isCreator && !editMode && (
          <Button onClick={() => setEditMode(true)}>Edit Agent</Button>
        )}
      </div>

      {/* Agent Card */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          {editMode ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 font-semibold text-lg"
            />
          ) : (
            <CardTitle className="text-2xl font-bold">{agent.name}</CardTitle>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {editMode ? (
            <>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit}>Save</Button>
                <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700">{agent.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button onClick={handleDownload} className="flex items-center gap-1">
                  <Download className="w-4 h-4" /> Download
                </Button>
                <Button onClick={handleShare} className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
                <Button
                  variant={isFavorited ? 'destructive' : 'default'}
                  onClick={handleFavorite}
                  className="flex items-center gap-1"
                >
                  <Heart className="w-4 h-4" /> {isFavorited ? 'Favorited' : 'Favorite'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
