import { supabase } from '@/lib/supabase';
import AgentClient from './AgentClient';



export default async function AgentPage({ params }: { params: { id: string } }) {
  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !agent) {
    return <div className="p-8 text-red-500 font-semibold">Agent not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{agent.name}</h1>
      <p className="text-lg text-gray-600 mb-6">{agent.description || 'No description available'}</p>

      {/* Client-side interactive component */}
      <AgentClient agent={agent} />
    </div>
  );
}
