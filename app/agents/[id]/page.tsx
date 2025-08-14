import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AgentClient from './AgentClient';
import { supabase, Agent } from '@/lib/supabase';

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchAgent = async () => {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setAgent(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!agent) return <p>Agent not found</p>;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <AgentClient agent={agent} />
    </div>
  );
}
