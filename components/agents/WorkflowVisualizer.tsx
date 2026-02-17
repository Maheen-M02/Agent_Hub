'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Workflow, 
  Play, 
  Pause, 
  Settings, 
  Database, 
  Mail, 
  Code, 
  Globe,
  Zap,
  FileText,
  Image,
  MessageSquare,
  Calendar,
  BarChart3
} from 'lucide-react';

interface WorkflowVisualizerProps {
  workflow: any;
}

export function WorkflowVisualizer({ workflow }: WorkflowVisualizerProps) {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  if (!workflow || !workflow.nodes) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Invalid workflow data</p>
        </CardContent>
      </Card>
    );
  }

  const getNodeIcon = (nodeType: string) => {
    const type = nodeType.toLowerCase();
    
    if (type.includes('webhook')) return <Zap className="w-4 h-4" />;
    if (type.includes('http') || type.includes('api')) return <Globe className="w-4 h-4" />;
    if (type.includes('email')) return <Mail className="w-4 h-4" />;
    if (type.includes('code') || type.includes('function')) return <Code className="w-4 h-4" />;
    if (type.includes('database') || type.includes('sql')) return <Database className="w-4 h-4" />;
    if (type.includes('text') || type.includes('openai')) return <FileText className="w-4 h-4" />;
    if (type.includes('image') || type.includes('vision')) return <Image className="w-4 h-4" />;
    if (type.includes('slack') || type.includes('discord')) return <MessageSquare className="w-4 h-4" />;
    if (type.includes('schedule') || type.includes('cron')) return <Calendar className="w-4 h-4" />;
    if (type.includes('analytics')) return <BarChart3 className="w-4 h-4" />;
    
    return <Settings className="w-4 h-4" />;
  };

  const getNodeColor = (nodeType: string) => {
    const type = nodeType.toLowerCase();
    
    if (type.includes('webhook')) return 'bg-green-100 border-green-300 text-green-800';
    if (type.includes('http') || type.includes('api')) return 'bg-blue-100 border-blue-300 text-blue-800';
    if (type.includes('email')) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    if (type.includes('code') || type.includes('function')) return 'bg-purple-100 border-purple-300 text-purple-800';
    if (type.includes('database') || type.includes('sql')) return 'bg-indigo-100 border-indigo-300 text-indigo-800';
    if (type.includes('text') || type.includes('openai')) return 'bg-orange-100 border-orange-300 text-orange-800';
    if (type.includes('image') || type.includes('vision')) return 'bg-pink-100 border-pink-300 text-pink-800';
    if (type.includes('slack') || type.includes('discord')) return 'bg-cyan-100 border-cyan-300 text-cyan-800';
    
    return 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const formatNodeType = (nodeType: string) => {
    return nodeType.replace('n8n-nodes-base.', '').replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="space-y-6">
      {/* Workflow Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Workflow className="w-5 h-5 mr-2" />
            {workflow.name || 'Workflow Visualization'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Nodes:</span>
              <span className="ml-2 font-medium">{workflow.nodes?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Connections:</span>
              <span className="ml-2 font-medium">{workflow.connections ? Object.keys(workflow.connections).length : 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Version:</span>
              <span className="ml-2 font-medium">{workflow.versionId || 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Nodes */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Nodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflow.nodes.map((node: any, index: number) => (
              <div
                key={node.id || index}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedNode?.id === node.id 
                    ? 'ring-2 ring-purple-500 ring-offset-2' 
                    : ''
                } ${getNodeColor(node.type)}`}
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-center space-x-3 mb-2">
                  {getNodeIcon(node.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {node.name || formatNodeType(node.type)}
                    </h4>
                    <p className="text-xs opacity-75 truncate">
                      {formatNodeType(node.type)}
                    </p>
                  </div>
                </div>
                
                {node.parameters && Object.keys(node.parameters).length > 0 && (
                  <div className="text-xs opacity-75">
                    {Object.keys(node.parameters).length} parameter(s)
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getNodeIcon(selectedNode.type)}
              <span className="ml-2">{selectedNode.name || formatNodeType(selectedNode.type)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Node Type</h5>
                <Badge className={getNodeColor(selectedNode.type)}>
                  {formatNodeType(selectedNode.type)}
                </Badge>
              </div>

              {selectedNode.parameters && Object.keys(selectedNode.parameters).length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Parameters</h5>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(selectedNode.parameters, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedNode.position && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Position</h5>
                  <div className="text-sm text-gray-600">
                    X: {selectedNode.position[0]}, Y: {selectedNode.position[1]}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow JSON */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Raw Workflow JSON</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const blob = new Blob([JSON.stringify(workflow, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${workflow.name || 'workflow'}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              Download JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
            <pre className="text-xs">
              {JSON.stringify(workflow, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}