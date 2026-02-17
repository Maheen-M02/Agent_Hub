'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Plus, Save, TestTube, Sparkles, Rocket } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { WorkflowImporter } from '@/components/agents/WorkflowImporter';

export default function CreateAgentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    webhook_url: '',
    example_input: '',
    example_output: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Text Processing',
    'Content Creation',
    'Data Processing',
    'AI Vision',
    'Development',
    'Communication',
    'Analytics',
    'Automation',
    'Other',
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to create an agent');
        return;
      }

      if (!formData.name || !formData.description || !formData.webhook_url) {
        setError('Please fill in all required fields');
        return;
      }

      let exampleInput = null;
      let exampleOutput = null;

      if (formData.example_input) {
        try {
          exampleInput = JSON.parse(formData.example_input);
        } catch (e) {
          setError('Invalid JSON format in example input');
          return;
        }
      }

      if (formData.example_output) {
        try {
          exampleOutput = JSON.parse(formData.example_output);
        } catch (e) {
          setError('Invalid JSON format in example output');
          return;
        }
      }

      const { data, error: insertError } = await supabase
        .from('agents')
        .insert({
          name: formData.name,
          description: formData.description,
          category: formData.category || null,
          icon: formData.name.charAt(0).toUpperCase(),
          webhook_url: formData.webhook_url,
          example_input: exampleInput,
          example_output: exampleOutput,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setSuccess('Agent created successfully!');
      
      setFormData({
        name: '',
        description: '',
        category: '',
        webhook_url: '',
        example_input: '',
        example_output: '',
      });

    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkflowImport = (agentData: any) => {
    setFormData({
      name: agentData.name,
      description: agentData.description,
      category: agentData.category,
      webhook_url: agentData.webhook_url,
      example_input: JSON.stringify(agentData.example_input, null, 2),
      example_output: JSON.stringify(agentData.example_output, null, 2),
    });
    setSuccess('Workflow imported! Please review and update the webhook URL if needed.');
  };

  const testWebhook = async () => {
    if (!formData.webhook_url) {
      setError('Please enter a webhook URL first');
      return;
    }

    try {
      const response = await fetch(formData.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });

      if (response.ok) {
        setSuccess('Webhook test successful!');
      } else {
        setError(`Webhook test failed: ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      setError(`Webhook test failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 backdrop-blur-sm px-6 py-3 mb-6">
            <Rocket className="w-4 h-4 mr-2" />
            Agent Creator
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            Create New{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              AI Agent
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Add your n8n workflow to the Agent Hub for others to discover and use
          </p>
        </div>

        {/* n8n Integration Guide */}
        <Card className="mb-8 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center text-xl">
              <ExternalLink className="w-6 h-6 mr-3 text-blue-400" />
              Need to create a workflow first?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-6 text-lg">
              If you haven't created your n8n workflow yet, start by building it in n8n first.
            </p>
            <div className="space-y-3 text-gray-300 mb-6 bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <p className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</span>
                Create your workflow in n8n
              </p>
              <p className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">2</span>
                Add a Webhook trigger node
              </p>
              <p className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">3</span>
                Copy the webhook URL
              </p>
              <p className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">4</span>
                Test your workflow thoroughly
              </p>
              <p className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">5</span>
                Return here to register your agent
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500" asChild>
              <a
                href="https://n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                Open n8n
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Workflow Importer */}
        <WorkflowImporter onImport={handleWorkflowImport} />

        {/* Agent Form */}
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700 backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white flex items-center text-2xl">
              <Sparkles className="w-6 h-6 mr-3 text-purple-400" />
              Agent Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Agent Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Text Summarizer"
                    required
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Category
                  </label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what your agent does and how it helps users..."
                  rows={4}
                  required
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  n8n Webhook URL *
                </label>
                <div className="flex gap-3">
                  <Input
                    value={formData.webhook_url}
                    onChange={(e) => handleInputChange('webhook_url', e.target.value)}
                    placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
                    required
                    className="flex-1 bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500 rounded-xl"
                  />
                  <Button type="button" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 rounded-xl" onClick={testWebhook}>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This should be the webhook URL from your n8n workflow
                </p>
              </div>

              {/* Examples */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Example Input (JSON)
                  </label>
                  <Textarea
                    value={formData.example_input}
                    onChange={(e) => handleInputChange('example_input', e.target.value)}
                    placeholder='{"text": "This is sample input"}'
                    rows={6}
                    className="font-mono text-sm bg-slate-900 border-slate-700 text-green-400 placeholder:text-gray-600 focus:border-purple-500 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Example Output (JSON)
                  </label>
                  <Textarea
                    value={formData.example_output}
                    onChange={(e) => handleInputChange('example_output', e.target.value)}
                    placeholder='{"result": "This is sample output"}'
                    rows={6}
                    className="font-mono text-sm bg-slate-900 border-slate-700 text-blue-400 placeholder:text-gray-600 focus:border-purple-500 rounded-xl"
                  />
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert className="bg-red-900/50 border-red-500/50 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-900/50 border-green-500/50 text-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Agent...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Create Agent
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
