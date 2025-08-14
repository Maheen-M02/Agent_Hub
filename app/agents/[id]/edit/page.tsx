'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Agent } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        setLoading(false);
        return;
      }

      setAgent(data);
      setName(data.name);
      setDescription(data.description || '');
      setLoading(false);
    };

    fetchAgent();
  }, [id]);

  const handleSave = async () => {
    if (!agent || !user) return;

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Agent</h1>
      <Card>
        <CardHeader>
          <CardTitle>Edit Agent Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Agent Name"
            className="w-full border p-2 rounded"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agent Description"
            className="w-full border p-2 rounded"
          />
          <div className="flex space-x-2">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
