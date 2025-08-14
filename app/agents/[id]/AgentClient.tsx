'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Agent } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function AgentEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgent = async () => {
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData.user);

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return setError(error.message);
      if (data?.created_by !== authData.user?.id) {
        setError('You are not authorized to edit this agent.');
        return;
      }

      setAgent(data);
      setName(data.name);
      setDescription(data.description || '');
      setLoading(false);
    };

    fetchAgent();
  }, [id]);

  const handleSubmit = async () => {
    if (!agent) return;

    const { error } = await supabase
      .from('agents')
      .update({ name, description })
      .eq('id', agent.id)
      .eq('created_by', user.id);

    if (error) {
      alert(error.message);
    } else {
      router.push(`/agents/${agent.id}`);
    }
  };

  const handleDownloadWorkflow = () => {
    if (!agent?.workflow_json) return alert('Workflow JSON not available');
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
        await navigator.share({ title: agent.name, text: agent.description || '', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed', err);
      alert('Share failed');
    }
  };

  if (loading) return <p className="text-center py-8">Loading...</p>;
  if (error) return <p className="text-center py-8 text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Agent</h1>

      <Card>
        <CardHeader>
          <CardTitle>Agent Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Agent Name"
          />
          <Textarea
            className="w-full border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agent Description"
          />
          <div className="flex space-x-3">
            <Button onClick={handleSubmit}>Save Changes</Button>
            <Button variant="outline" onClick={handleDownloadWorkflow}>Download Workflow</Button>
            <Button variant="outline" onClick={handleShare}>Share</Button>
          </div>
        </CardContent>
      </Card>

      {agent?.workflow_json && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow JSON Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border">
              {JSON.stringify(agent.workflow_json, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
