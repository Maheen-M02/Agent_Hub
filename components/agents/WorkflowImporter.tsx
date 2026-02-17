'use client';

import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface WorkflowImporterProps {
  onImport: (agentData: {
    name: string;
    description: string;
    category: string;
    webhook_url: string;
    example_input: any;
    example_output: any;
    workflow_json?: any;
  }) => void;
}

export function WorkflowImporter({ onImport }: WorkflowImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [workflowInfo, setWorkflowInfo] = useState<any>(null);

  const extractWebhookUrl = (workflow: any) => {
    // Look for webhook nodes in the workflow
    const nodes = workflow.nodes || [];
    const webhookNode = nodes.find((node: any) =>
      node.type === 'n8n-nodes-base.webhook' ||
      node.typeVersion === 1 && node.type.includes('webhook')
    );

    if (webhookNode) {
      const webhookId = webhookNode.webhookId || webhookNode.parameters?.webhookId;
      if (webhookId) {
        return `https://your-n8n-instance.com/webhook/${webhookId}`;
      }
    }

    return '';
  };

  const extractAgentInfo = (workflow: any) => {
    const name = workflow.name || 'Imported Workflow';
    const description = workflow.meta?.description || workflow.settings?.description ||
      `Imported n8n workflow: ${name}`;

    // Try to determine category based on node types
    const nodes = workflow.nodes || [];
    let category = 'Other';

    const nodeTypes = nodes.map((node: any) => node.type.toLowerCase());

    if (nodeTypes.some(type => type.includes('text') || type.includes('openai') || type.includes('chatgpt'))) {
      category = 'Text Processing';
    } else if (nodeTypes.some(type => type.includes('email') || type.includes('slack') || type.includes('discord'))) {
      category = 'Communication';
    } else if (nodeTypes.some(type => type.includes('http') || type.includes('api') || type.includes('webhook'))) {
      category = 'Data Processing';
    } else if (nodeTypes.some(type => type.includes('code') || type.includes('function'))) {
      category = 'Development';
    } else if (nodeTypes.some(type => type.includes('image') || type.includes('vision'))) {
      category = 'AI Vision';
    }

    // Generate example input/output based on webhook node
    const webhookNode = nodes.find((node: any) =>
      node.type === 'n8n-nodes-base.webhook'
    );

    let example_input = { message: 'Sample input' };
    let example_output = { result: 'Sample output' };

    if (webhookNode?.parameters) {
      const params = webhookNode.parameters;
      if (params.responseData) {
        example_output = params.responseData;
      }
    }

    return {
      name,
      description,
      category,
      webhook_url: extractWebhookUrl(workflow),
      example_input,
      example_output,
      workflow_json: workflow,
      nodeCount: nodes.length,
      nodeTypes: [...new Set(nodeTypes)].slice(0, 5) // First 5 unique node types
    };
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setError('');
    setSuccess('');
    setWorkflowInfo(null);

    try {
      if (!file.name.endsWith('.json')) {
        throw new Error('Please upload a JSON file');
      }

      const text = await file.text();
      const workflow = JSON.parse(text);

      // Validate it's an n8n workflow
      if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
        throw new Error('Invalid n8n workflow file - missing nodes array');
      }

      const agentInfo = extractAgentInfo(workflow);
      setWorkflowInfo(agentInfo);
      setSuccess('Workflow parsed successfully! Review the details below.');

    } catch (err: any) {
      setError(err.message || 'Failed to parse workflow file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleImport = () => {
    if (workflowInfo) {
      onImport(workflowInfo);
      setWorkflowInfo(null);
      setSuccess('');
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Import n8n Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
              ? 'border-blue-500 bg-blue-100'
              : 'border-gray-300 hover:border-blue-400'
            }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
        >
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Drag and drop your n8n workflow JSON file here, or click to browse
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            id="workflow-upload"
          />
          <Button
            variant="outline"
            asChild
            disabled={isProcessing}
          >
            <label htmlFor="workflow-upload" className="cursor-pointer">
              {isProcessing ? 'Processing...' : 'Choose File'}
            </label>
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Workflow Info Preview */}
        {workflowInfo && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg">Workflow Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-gray-900">{workflowInfo.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-900 text-sm">{workflowInfo.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detected Category
                </label>
                <Badge className="bg-purple-100 text-purple-800 border-0">
                  {workflowInfo.category}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <p className="text-gray-900 text-sm font-mono bg-white p-2 rounded border">
                  {workflowInfo.webhook_url || 'No webhook URL detected - you\'ll need to add this manually'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workflow Stats
                </label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{workflowInfo.nodeCount} nodes</Badge>
                  {workflowInfo.nodeTypes.map((type: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {type.replace('n8n-nodes-base.', '')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleImport}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  Import This Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-sm text-gray-600">
          <p className="mb-2"><strong>Supported:</strong> n8n workflow JSON files exported from n8n</p>
          <p><strong>Note:</strong> Make sure your workflow has a webhook trigger node for the agent to work properly.</p>
        </div>
      </CardContent>
    </Card>
  );
}