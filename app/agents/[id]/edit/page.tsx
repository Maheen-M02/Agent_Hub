'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Agent } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

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

  if (loading) return <p className="text-gray-500 text-center py-10">Loading agent data...</p>;
  if (error) return <p className="text-red-600 text-center py-10">{error}</p>;
  if (!agent) return <p className="text-gray-500 text-center py-10">Agent not found</p>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      {/* Edit Card */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Edit Agent Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Agent Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter agent name"
              className="border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter agent description"
              rows={5}
              className="border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
