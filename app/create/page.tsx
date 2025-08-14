'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Plus, Save, TestTube } from 'lucide-react';
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to create an agent');
        return;
      }

      // Validate form data
      if (!formData.name || !formData.description || !formData.webhook_url) {
        setError('Please fill in all required fields');
        return;
      }

      // Parse JSON examples
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

      // Insert agent
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
      
      // Reset form
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
    <div className="min-h-screen bg-gray-50">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Agent</h1>
          <p className="text-gray-600">
            Add your n8n workflow to the Agent Hub for others to discover and use
          </p>
        </div>

        {/* n8n Integration Guide */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ExternalLink className="w-5 h-5 mr-2" />
              Need to create a workflow first?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you haven't created your n8n workflow yet, start by building it in n8n first.
            </p>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>1. Create your workflow in n8n</p>
              <p>2. Add a Webhook trigger node</p>
              <p>3. Copy the webhook URL</p>
              <p>4. Test your workflow thoroughly</p>
              <p>5. Return here to register your agent</p>
            </div>
            <Button variant="outline" asChild>
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
        <Card>
          <CardHeader>
            <CardTitle>Agent Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Text Summarizer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what your agent does and how it helps users..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  n8n Webhook URL *
                </label>
                <div className="flex space-x-2">
                  <Input
                    value={formData.webhook_url}
                    onChange={(e) => handleInputChange('webhook_url', e.target.value)}
                    placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
                    required
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={testWebhook}>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This should be the webhook URL from your n8n workflow
                </p>
              </div>

              {/* Examples */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Example Input (JSON)
                  </label>
                  <Textarea
                    value={formData.example_input}
                    onChange={(e) => handleInputChange('example_input', e.target.value)}
                    placeholder='{"text": "This is sample input"}'
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Example Output (JSON)
                  </label>
                  <Textarea
                    value={formData.example_output}
                    onChange={(e) => handleInputChange('example_output', e.target.value)}
                    placeholder='{"result": "This is sample output"}'
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Agent...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
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