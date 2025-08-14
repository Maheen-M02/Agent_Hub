'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Agent } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Heart, Share2 } from 'lucide-react';

export default function AgentClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Edit fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchAgent = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        setUser(authData.user);

        // Fetch agent
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Agent not found');

        setAgent(data);
        setName(data.name);
        setDescription(data.description || '');

        // Check if favorited
        if (authData.user) {
          const { data: fav } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', authData.user.id)
            .eq('agent_id', id)
            .single();
          setIsFavorited(!!fav);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch agent');
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
    if (!agent?.workflow_json) {
      alert('Workflow JSON not available');
      return;
    }
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!agent) return <p>Agent not found</p>;

  const isCreator = user?.id === agent.created_by;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft /> Back
        </Button>
        {isCreator && !editMode && (
          <Button onClick={() => setEditMode(true)}>Edit Agent</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          {editMode ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          ) : (
            <CardTitle>{agent.name}</CardTitle>
          )}
        </CardHeader>
        <CardContent>
          {editMode ? (
            <>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2 rounded mb-4"
              />
              <div className="flex space-x-2">
                <Button onClick={handleSaveEdit}>Save</Button>
                <Button variant="secondary" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-4">{agent.description}</p>
              <div className="flex space-x-2">
                <Button onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-1" /> Download Workflow
                </Button>
                <Button onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-1" /> Share
                </Button>
                <Button
                  variant={isFavorited ? 'destructive' : 'default'}
                  onClick={handleFavorite}
                >
                  <Heart className="w-4 h-4 mr-1" /> {isFavorited ? 'Favorited' : 'Favorite'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
