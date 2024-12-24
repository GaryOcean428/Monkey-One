import React, { useState, useEffect } from 'react';
import { Brain, Search, Lightbulb, CheckCircle, AlertCircle, RefreshCw, Code, Database, Zap, Users, MessageSquare, HardDrive, List, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useThoughtStore } from '../../stores/thoughtStore';
import type { Thought, ThoughtType } from '../../types/thought';
import { BasePanel } from './BasePanel';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

interface ThoughtItemProps {
  thought: Thought;
}

const ThoughtItem: React.FC<ThoughtItemProps> = ({ thought }) => {
  const getIcon = (type: ThoughtType) => {
    switch (type) {
      case 'observation': return Brain;
      case 'reasoning': return Search;
      case 'plan': return Lightbulb;
      case 'decision': return CheckCircle;
      case 'critique': return AlertCircle;
      case 'reflection': return RefreshCw;
      case 'execution': return Code;
      case 'success': return Zap;
      case 'error': return AlertCircle;
      case 'agent-state': return Users;
      case 'agent-comm': return MessageSquare;
      case 'memory-op': return HardDrive;
      case 'task-plan': return List;
      default: return Database;
    }
  };

  const getTypeColor = (type: ThoughtType) => {
    switch (type) {
      case 'observation': return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
      case 'reasoning': return 'text-purple-400 border-purple-400/20 bg-purple-400/10';
      case 'plan': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
      case 'decision': return 'text-green-400 border-green-400/20 bg-green-400/10';
      case 'critique': return 'text-orange-400 border-orange-400/20 bg-orange-400/10';
      case 'reflection': return 'text-cyan-400 border-cyan-400/20 bg-cyan-400/10';
      case 'execution': return 'text-indigo-400 border-indigo-400/20 bg-indigo-400/10';
      case 'success': return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
      case 'error': return 'text-red-400 border-red-400/20 bg-red-400/10';
      case 'agent-state': return 'text-violet-400 border-violet-400/20 bg-violet-400/10';
      case 'agent-comm': return 'text-pink-400 border-pink-400/20 bg-pink-400/10';
      case 'memory-op': return 'text-teal-400 border-teal-400/20 bg-teal-400/10';
      case 'task-plan': return 'text-amber-400 border-amber-400/20 bg-amber-400/10';
      default: return 'text-gray-400 border-gray-400/20 bg-gray-400/10';
    }
  };

  const Icon = getIcon(thought.type);
  const colorClass = getTypeColor(thought.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-lg border p-3 mb-3 ${colorClass}`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-x-2">
            <span className="text-sm font-medium capitalize truncate">
              {thought.type}
              {thought.agentId && (
                <span className="ml-2 text-xs opacity-70">
                  Agent: {thought.agentId}
                </span>
              )}
            </span>
            <span className="text-xs opacity-70 whitespace-nowrap">
              {format(thought.timestamp, 'MMM d, h:mm a')}
            </span>
          </div>
          
          <p className="mt-1 text-sm opacity-90">{thought.message}</p>
          
          {thought.metadata && Object.keys(thought.metadata).length > 0 && (
            <div className="mt-2 text-xs space-y-1 opacity-70">
              {Object.entries(thought.metadata).map(([key, value]) => (
                <div key={key} className="flex items-center gap-x-2">
                  <span className="font-medium">{key}:</span>
                  <span className="truncate">
                    {typeof value === 'object' 
                      ? JSON.stringify(value)
                      : String(value)
                    }
                  </span>
                </div>
              ))}
            </div>
          )}

          {thought.tags && thought.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {thought.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {(thought.taskId || thought.collaborationId) && (
            <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
              {thought.taskId && (
                <Badge variant="outline">Task: {thought.taskId}</Badge>
              )}
              {thought.collaborationId && (
                <Badge variant="outline">Collab: {thought.collaborationId}</Badge>
              )}
            </div>
          )}

          {(thought.importance !== undefined || thought.confidence !== undefined) && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              {thought.importance !== undefined && (
                <Badge variant="secondary">
                  Importance: {thought.importance.toFixed(2)}
                </Badge>
              )}
              {thought.confidence !== undefined && (
                <Badge variant="secondary">
                  Confidence: {thought.confidence.toFixed(2)}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export function ThoughtLoggerPanel() {
  const {
    thoughts,
    filters,
    stats,
    getFilteredThoughts,
    setFilters,
    clearFilters,
    clearThoughts,
  } = useThoughtStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ThoughtType | ''>('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters when inputs change
  useEffect(() => {
    setFilters({
      searchQuery,
      type: selectedType || undefined,
      agentId: selectedAgent || undefined,
      taskId: selectedTask || undefined,
    });
  }, [searchQuery, selectedType, selectedAgent, selectedTask, setFilters]);

  const filteredThoughts = getFilteredThoughts();
  const agents = Array.from(new Set(thoughts.map(t => t.agentId).filter(Boolean)));
  const tasks = Array.from(new Set(thoughts.map(t => t.taskId).filter(Boolean)));

  return (
    <BasePanel title="Thought Logger" className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Search thoughts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={clearThoughts}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 mb-4"
          >
            <div className="flex gap-2">
              <Select
                value={selectedType}
                onValueChange={(value) => setSelectedType(value as ThoughtType)}
                className="flex-1"
              >
                <option value="">All Types</option>
                {Object.keys(stats.thoughtsByType).map((type) => (
                  <option key={type} value={type}>
                    {type} ({stats.thoughtsByType[type as ThoughtType]})
                  </option>
                ))}
              </Select>

              <Select
                value={selectedAgent}
                onValueChange={setSelectedAgent}
                className="flex-1"
              >
                <option value="">All Agents</option>
                {agents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedTask}
                onValueChange={setSelectedTask}
                className="flex-1"
              >
                <option value="">All Tasks</option>
                {tasks.map((task) => (
                  <option key={task} value={task}>
                    {task}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total Thoughts: {stats.totalThoughts}</span>
              <span>Active Tasks: {stats.activeTasks}</span>
              <span>Active Collaborations: {stats.activeCollaborations}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="thoughts" className="flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="thoughts">Thoughts</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="thoughts" className="flex-1 overflow-auto">
          <AnimatePresence mode="popLayout">
            {filteredThoughts.length > 0 ? (
              filteredThoughts.map((thought) => (
                <ThoughtItem key={thought.id} thought={thought} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-8"
              >
                No thoughts found
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-medium mb-2">Thoughts by Type</h3>
              <div className="space-y-1">
                {Object.entries(stats.thoughtsByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="capitalize">{type}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-2">Thoughts by Agent</h3>
              <div className="space-y-1">
                {Object.entries(stats.thoughtsByAgent).map(([agent, count]) => (
                  <div key={agent} className="flex justify-between text-sm">
                    <span>{agent}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 col-span-2">
              <h3 className="font-medium mb-2">Thoughts by Task</h3>
              <div className="space-y-1">
                {Object.entries(stats.thoughtsByTask).map(([task, count]) => (
                  <div key={task} className="flex justify-between text-sm">
                    <span>{task}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 col-span-2">
              <h3 className="font-medium mb-2">Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Average Importance</span>
                    <span>{stats.averageImportance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Confidence</span>
                    <span>{stats.averageConfidence.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Active Tasks</span>
                    <span>{stats.activeTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Collaborations</span>
                    <span>{stats.activeCollaborations}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </BasePanel>
  );
}
