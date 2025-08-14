import AgentClient from './AgentClient';
import { supabase, Agent } from '@/lib/supabase';

interface Props {
  params: { id: string };
}

export default async function AgentDetailPage({ params }: Props) {
  const { id } = params;

  // Fetch agent data server-side
  const { data: agent, error } = await supabase
    .from<Agent>('agents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !agent) {
    return <p>Agent not found.</p>;
  }

  // Pass agent data to client component
  return <AgentClient agent={agent} />;
}
