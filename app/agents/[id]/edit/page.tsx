'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Agent } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

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
      .eq('created_by', user.id); // ✅ Ensure only creator can update

    if (error) {
      alert(error.message);
    } else {
      router.push(`/agents/${agent.id}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Agent</h1>
      <div className="space-y-4">
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
        <Button onClick={handleSubmit}>Save Changes</Button>
      </div>
    </div>
  );
}
