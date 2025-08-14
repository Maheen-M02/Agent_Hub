'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Agent } from '@/lib/supabase';
import AgentClient from './AgentClient';

export default function AgentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Invalid agent ID');
      setLoading(false);
      return;
    }

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
        setError(err.message || 'Failed to fetch agent');
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  if (loading) return <p>Loading agent...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!agent) return <p>Agent not found</p>;

  return <AgentClient agent={agent} />;
}
