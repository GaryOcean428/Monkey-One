/**
 * Agent Integration Panel Component
 * 
 * Displays and manages integration with other Monkey-One agents,
 * showing collaboration status, message flows, and shared knowledge.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot,
  MessageSquare,
  Users,
  Activity,
  Zap,
  Brain,
  Target,
  Eye,
  Settings,
  Plus,
  RefreshCw,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Network
} from 'lucide-react';

import { AgentIntegrationHub } from '../../lib/memory-graph/agent-integration';
import type { 
  RegisteredAgent, 
  AgentMessage, 
  AgentType,
  KnowledgeQuery,
  AgentCapability
} from '../../lib/memory-graph/agent-integration';

interface AgentIntegrationPanelProps {
  integrationHub: AgentIntegrationHub;
  className?: string;
}

const AGENT_TYPE_ICONS: Record<AgentType, React.ReactNode> = {
  reasoning: <Brain className="h-4 w-4" />,
  planning: <Target className="h-4 w-4" />,
  execution: <Zap className="h-4 w-4" />,
  monitoring: <Eye className="h-4 w-4" />,
  analysis: <Activity className="h-4 w-4" />,
  communication: <MessageSquare className="h-4 w-4" />,
  specialized: <Settings className="h-4 w-4" />
};

const STATUS_COLORS = {
  active: 'text-green-600 bg-green-50 border-green-200',
  inactive: 'text-gray-600 bg-gray-50 border-gray-200',
  busy: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  error: 'text-red-600 bg-red-50 border-red-200'
};

export function AgentIntegrationPanel({ 
  integrationHub, 
  className = '' 
}: AgentIntegrationPanelProps) {
  const [agents, setAgents] = useState<RegisteredAgent[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<RegisteredAgent | null>(null);
  const [stats, setStats] = useState(integrationHub.getIntegrationStats());
  const [isLoading, setIsLoading] = useState(false);
  const [newMessageDialog, setNewMessageDialog] = useState(false);
  const [knowledgeQueryDialog, setKnowledgeQueryDialog] = useState(false);

  // Form states
  const [messageForm, setMessageForm] = useState({
    to: '',
    type: 'knowledge_request' as AgentMessage['type'],
    content: '',
    priority: 'medium' as AgentMessage['priority']
  });

  const [queryForm, setQueryForm] = useState({
    type: 'entities' as KnowledgeQuery['type'],
    nodeTypes: [] as string[],
    context: '',
    maxResults: 10
  });

  const refreshData = () => {
    setAgents(integrationHub.getRegisteredAgents());
    setStats(integrationHub.getIntegrationStats());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [integrationHub]);

  const handleSendMessage = async () => {
    if (!messageForm.to || !messageForm.content) return;

    const message: AgentMessage = {
      id: `msg_${Date.now()}`,
      from: 'memory-graph-hub',
      to: messageForm.to,
      type: messageForm.type,
      payload: { content: messageForm.content },
      timestamp: new Date(),
      priority: messageForm.priority
    };

    try {
      await integrationHub.sendMessage(message);
      setMessages(prev => [...prev, message]);
      setMessageForm({ to: '', type: 'knowledge_request', content: '', priority: 'medium' });
      setNewMessageDialog(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKnowledgeQuery = async () => {
    setIsLoading(true);
    try {
      const query: KnowledgeQuery = {
        type: queryForm.type,
        context: queryForm.context,
        maxResults: queryForm.maxResults
      };

      const response = await integrationHub.queryKnowledge(query);
      console.log('Knowledge query response:', response);
      
      // In a real implementation, this would display the results
      alert(`Query completed: ${response.metadata.totalResults} results found`);
      
      setKnowledgeQueryDialog(false);
    } catch (error) {
      console.error('Knowledge query failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentIntegration = async (agent: RegisteredAgent) => {
    try {
      switch (agent.type) {
        case 'reasoning':
          await integrationHub.integrateWithReasoningAgent(agent.id);
          break;
        case 'planning':
          await integrationHub.integrateWithPlanningAgent(agent.id);
          break;
        case 'execution':
          await integrationHub.integrateWithExecutionAgent(agent.id);
          break;
        default:
          console.log(`Integration not implemented for agent type: ${agent.type}`);
      }
    } catch (error) {
      console.error('Agent integration failed:', error);
    }
  };

  const getAgentStatusIcon = (status: RegisteredAgent['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'busy': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6" />
            Agent Integration
            <Badge variant="secondary">{stats.registeredAgents}</Badge>
          </h2>
          <p className="text-sm text-gray-600">
            {stats.activeAgents} active • {stats.registeredAgents - stats.activeAgents} inactive
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={knowledgeQueryDialog} onOpenChange={setKnowledgeQueryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Brain className="h-4 w-4 mr-2" />
                Query Knowledge
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Query Memory Graph Knowledge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Query Type</label>
                  <select
                    value={queryForm.type}
                    onChange={(e) => setQueryForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="entities">Entities</option>
                    <option value="relationships">Relationships</option>
                    <option value="patterns">Patterns</option>
                    <option value="insights">Insights</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Context</label>
                  <Input
                    value={queryForm.context}
                    onChange={(e) => setQueryForm(prev => ({ ...prev, context: e.target.value }))}
                    placeholder="Query context or description"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Max Results</label>
                  <Input
                    type="number"
                    value={queryForm.maxResults}
                    onChange={(e) => setQueryForm(prev => ({ ...prev, maxResults: parseInt(e.target.value) }))}
                    min="1"
                    max="100"
                  />
                </div>
                
                <Button onClick={handleKnowledgeQuery} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Querying...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Execute Query
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={newMessageDialog} onOpenChange={setNewMessageDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Message to Agent</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Target Agent</label>
                  <select
                    value={messageForm.to}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="">Select agent...</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.type})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Message Type</label>
                  <select
                    value={messageForm.type}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="knowledge_request">Knowledge Request</option>
                    <option value="recommendation_request">Recommendation Request</option>
                    <option value="analysis_request">Analysis Request</option>
                    <option value="collaboration_invite">Collaboration Invite</option>
                    <option value="status_update">Status Update</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={messageForm.priority}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Message Content</label>
                  <Textarea
                    value={messageForm.content}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter message content..."
                    rows={4}
                  />
                </div>
                
                <Button onClick={handleSendMessage} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{stats.registeredAgents}</p>
            <p className="text-sm text-gray-600">Registered Agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{stats.activeAgents}</p>
            <p className="text-sm text-gray-600">Active Agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{stats.messagesSent}</p>
            <p className="text-sm text-gray-600">Messages Sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-2xl font-bold">{stats.messagesProcessed}</p>
            <p className="text-sm text-gray-600">Messages Processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registered Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agents.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {agents.map(agent => (
                    <div
                      key={agent.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAgent?.id === agent.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {AGENT_TYPE_ICONS[agent.type]}
                          <span className="font-medium">{agent.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getAgentStatusIcon(agent.status)}
                          <Badge className={STATUS_COLORS[agent.status]}>
                            {agent.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <p>Type: {agent.type}</p>
                        <p>Version: {agent.metadata.version}</p>
                        <p>Last seen: {agent.lastSeen.toLocaleTimeString()}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {agent.capabilities.length} capabilities
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAgentIntegration(agent);
                          }}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Integrate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No agents registered</p>
                <p className="text-sm">Agents will appear here when they connect</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agent Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Agent Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAgent ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>ID:</strong> {selectedAgent.id}</p>
                    <p><strong>Name:</strong> {selectedAgent.name}</p>
                    <p><strong>Type:</strong> {selectedAgent.type}</p>
                    <p><strong>Status:</strong> {selectedAgent.status}</p>
                    <p><strong>Version:</strong> {selectedAgent.metadata.version}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedAgent.metadata.description}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Capabilities</h4>
                  <div className="space-y-2">
                    {selectedAgent.capabilities.map((capability, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                        <p className="font-medium">{capability.name}</p>
                        <p className="text-gray-600">{capability.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            v{capability.version}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {capability.inputTypes.length} inputs • {capability.outputTypes.length} outputs
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.metadata.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an agent to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Messages
            <Badge variant="secondary">{messages.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length > 0 ? (
            <ScrollArea className="h-60">
              <div className="space-y-2">
                {messages.slice(-10).reverse().map((message, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-medium">{message.from}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="font-medium">{message.to}</span>
                      <Badge variant="outline" className="text-xs">
                        {message.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm">Message history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}