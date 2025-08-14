'use client';

import { useState } from 'react';
import { Play, Loader2, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Agent } from '@/lib/supabase';

interface AgentRunnerProps {
  agent: Agent;
  onClose?: () => void;
}

export function AgentRunner({ agent, onClose }: AgentRunnerProps) {
  const [input, setInput] = useState(
    agent.example_input ? JSON.stringify(agent.example_input, null, 2) : ''
  );
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string>('');

  const handleRun = async () => {
    if (!input.trim()) {
      setError('Please provide input data');
      return;
    }

    setIsRunning(true);
    setError('');
    setOutput('');

    try {
      // Parse input JSON
      const inputData = JSON.parse(input);
      
      // Call our API route which will handle the n8n webhook call
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agent.id,
          webhook_url: agent.webhook_url,
          input_data: inputData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
      } else {
        setOutput(JSON.stringify(result.output, null, 2));
      }
    } catch (err: any) {
      if (err.name === 'SyntaxError') {
        setError('Invalid JSON input. Please check your input format.');
      } else {
        setError(err.message || 'An error occurred while running the agent');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyOutput = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
    }
  };

  const handleDownloadOutput = () => {
    if (output) {
      const blob = new Blob([output], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${agent.name.replace(/\s+/g, '_')}_output.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Agent Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{agent.name}</CardTitle>
              {agent.category && (
                <Badge className="mt-2 bg-purple-100 text-purple-800 border-0">
                  {agent.category}
                </Badge>
              )}
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{agent.description}</p>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Input Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JSON Input (modify the example or provide your own):
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter JSON input data..."
              className="min-h-32 font-mono text-sm"
              disabled={isRunning}
            />
          </div>
          
          <Button
            onClick={handleRun}
            disabled={isRunning || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Agent...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Agent
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Output Section */}
      {output && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Output</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyOutput}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadOutput}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border">
              {output}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Example Output */}
      {agent.example_output && !output && !isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Example Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border text-gray-600">
              {JSON.stringify(agent.example_output, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}