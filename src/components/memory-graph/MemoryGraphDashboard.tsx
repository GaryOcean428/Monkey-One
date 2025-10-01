/**
 * Memory Graph Dashboard
 * 
 * Comprehensive dashboard that integrates all memory graph features:
 * - Graph visualization
 * - Metrics and analytics
 * - Collaboration
 * - Entity management
 * - Real-time updates
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain,
  Plus,
  Upload,
  Download,
  Settings,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Activity,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  Network,
  FileText,
  Lightbulb
} from 'lucide-react';

import { GraphVisualization } from './GraphVisualization';
import { GraphMetrics } from './GraphMetrics';
import { CollaborationPanel } from './CollaborationPanel';
import { useMemoryGraph } from '../../lib/memory-graph/integrations';
import { useCollaboration } from '../../lib/memory-graph/collaboration';
import type { Node, Edge, NodeType } from '../../lib/memory-graph/types';
import type { ActionRecommendation } from '../../lib/memory-graph/planner-agent';

interface MemoryGraphDashboardProps {
  sessionId?: string;
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
    color: string;
  };
  className?: string;
}

export function MemoryGraphDashboard({
  sessionId = 'default-session',
  currentUser = {
    id: 'user-1',
    name: 'Current User',
    color: '#3b82f6'
  },
  className = ''
}: MemoryGraphDashboardProps) {
  // Memory graph hooks
  const {
    graph,
    ingestText,
    analyzeRisks,
    getRecommendations,
    analyzeDependencies,
    analyzeImpact,
    stats
  } = useMemoryGraph();

  // Collaboration setup
  const collaborationUser = {
    ...currentUser,
    isOnline: true,
    lastSeen: new Date(),
    permissions: {
      canRead: true,
      canWrite: true,
      canDelete: true,
      canManageUsers: false,
      canExport: true
    }
  };

  const {
    collaboration,
    users,
    presence,
    isConnected
  } = useCollaboration(graph, sessionId, collaborationUser);

  // Component state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [recommendations, setRecommendations] = useState<ActionRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<NodeType | 'all'>('all');

  // Text ingestion state
  const [ingestionText, setIngestionText] = useState('');
  const [ingestionSource, setIngestionSource] = useState('dashboard');

  // Get current graph data
  const allNodes = graph.query({}).nodes;
  const allEdges = graph.query({}).edges;

  // Filter data based on search and filter
  const filteredData = React.useMemo(() => {
    let nodes = allNodes;
    let edges = allEdges;

    if (searchQuery) {
      nodes = nodes.filter(node =>
        node.properties.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.properties.key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      nodes = nodes.filter(node => node.type === filterType);
    }

    const nodeIds = new Set(nodes.map(n => n.id));
    edges = edges.filter(edge => nodeIds.has(edge.from) && nodeIds.has(edge.to));

    return { nodes, edges };
  }, [allNodes, allEdges, searchQuery, filterType]);

  // Load recommendations on mount and when graph changes
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const recs = await getRecommendations('dashboard-context');
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      }
    };

    if (stats.nodeCount > 0) {
      loadRecommendations();
    }
  }, [stats.nodeCount, getRecommendations]);

  // Handle text ingestion
  const handleIngestText = useCallback(async () => {
    if (!ingestionText.trim()) return;

    setIsLoading(true);
    try {
      await ingestText(ingestionText, ingestionSource);
      setIngestionText('');
      
      // Refresh recommendations
      const recs = await getRecommendations('post-ingestion');
      setRecommendations(recs);
    } catch (error) {
      console.error('Ingestion failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [ingestionText, ingestionSource, ingestText, getRecommendations]);

  // Handle node selection
  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
    collaboration.updatePresence({ selectedNodeId: node.id });
  }, [collaboration]);

  // Handle edge selection
  const handleEdgeClick = useCallback((edge: Edge) => {
    setSelectedEdge(edge);
  }, []);

  // Export graph data
  const handleExport = useCallback(() => {
    const data = graph.toJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-graph-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [graph]);

  // Get priority color for recommendations
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Memory Graph Dashboard</h1>
            <p className="text-sm text-gray-600">
              {stats.nodeCount} entities • {stats.edgeCount} relationships
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Connected' : 'Offline'}
          </Badge>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ingest New Information</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Source</label>
                  <Input
                    value={ingestionSource}
                    onChange={(e) => setIngestionSource(e.target.value)}
                    placeholder="e.g., deployment-docs, incident-report"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Text Content</label>
                  <Textarea
                    value={ingestionText}
                    onChange={(e) => setIngestionText(e.target.value)}
                    placeholder="Enter deployment information, incident reports, or any relevant text..."
                    rows={8}
                  />
                </div>
                <Button 
                  onClick={handleIngestText} 
                  disabled={isLoading || !ingestionText.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Ingest & Analyze
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Collaboration */}
        <div className="w-80 border-r bg-gray-50 p-4">
          <CollaborationPanel
            users={users}
            presence={presence}
            currentUserId={currentUser.id}
            isConnected={isConnected}
            recentOperations={collaboration.getOperationHistory(10)}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b px-6 py-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="graph" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Graph
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="entities" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Entities
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="overview" className="p-6 space-y-6">
                <GraphMetrics nodes={allNodes} edges={allEdges} />
              </TabsContent>

              <TabsContent value="graph" className="p-6">
                <div className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search entities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as NodeType | 'all')}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="all">All Types</option>
                      {Array.from(new Set(allNodes.map(n => n.type))).sort().map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <GraphVisualization
                    nodes={filteredData.nodes}
                    edges={filteredData.edges}
                    onNodeClick={handleNodeClick}
                    onEdgeClick={handleEdgeClick}
                    selectedNodeId={selectedNode?.id}
                  />
                </div>
              </TabsContent>

              <TabsContent value="insights" className="p-6 space-y-6">
                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      AI Recommendations
                      <Badge variant="secondary">{recommendations.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recommendations.length > 0 ? (
                      <div className="space-y-3">
                        {recommendations.slice(0, 5).map((rec, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {rec.priority.toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    Impact: {rec.impactScore}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Effort: {rec.estimatedEffort}
                                  </span>
                                </div>
                                <h4 className="font-medium mb-1">{rec.action}</h4>
                                <p className="text-sm opacity-80">{rec.reasoning}</p>
                                {rec.relatedEntities.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs text-gray-600">
                                      Related: {rec.relatedEntities.length} entities
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No recommendations available</p>
                        <p className="text-sm">Add more data to get AI-powered insights</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Selected Node Analysis */}
                {selectedNode && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Entity Analysis: {selectedNode.properties.name || selectedNode.id}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Dependencies</h4>
                          <div className="text-sm text-gray-600">
                            {(() => {
                              try {
                                const deps = analyzeDependencies(selectedNode.id);
                                return (
                                  <div className="space-y-1">
                                    <p>Direct: {deps.directDependencies.length}</p>
                                    <p>Transitive: {deps.transitiveDependencies.length}</p>
                                    <p>Dependents: {deps.dependents.length}</p>
                                  </div>
                                );
                              } catch {
                                return <p>No dependency data available</p>;
                              }
                            })()}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Impact Analysis</h4>
                          <div className="text-sm text-gray-600">
                            {(() => {
                              try {
                                const impact = analyzeImpact(selectedNode.id);
                                return (
                                  <div className="space-y-1">
                                    <p>Risk Level: <Badge variant="outline">{impact.riskLevel}</Badge></p>
                                    <p>Direct Impact: {impact.directImpact.length}</p>
                                    <p>Cascading: {impact.cascadingImpact.length}</p>
                                  </div>
                                );
                              } catch {
                                return <p>No impact data available</p>;
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="entities" className="p-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Entity Browser</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {filteredData.nodes.map(node => (
                          <div
                            key={node.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedNode?.id === node.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleNodeClick(node)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{node.type}</Badge>
                                  <span className="font-medium">
                                    {node.properties.name || node.properties.key || node.id}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  Created: {new Date(node.metadata.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                <p>ID: {node.id}</p>
                                {node.metadata.source && (
                                  <p>Source: {node.metadata.source}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}