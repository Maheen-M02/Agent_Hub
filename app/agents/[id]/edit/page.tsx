'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Agent } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function AgentEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

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

        if (data?.created_by !== authData.user?.id) {
          setError('You are not authorized to edit this agent.');
          return;
        }

        setAgent(data);
        setName(data.name);
        setDescription(data.description || '');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  const handleSave = async () => {
    if (!agent || !user) return;

    try {
      const { error } = await supabase
        .from('agents')
        .update({ name, description })
        .eq('id', agent.id)
        .eq('created_by', user.id);

      if (error) throw error;
      router.push(`/agents/${agent.id}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!agent) return <p>Agent not found</p>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft /> Back
      </Button>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Edit Agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="w-full border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
