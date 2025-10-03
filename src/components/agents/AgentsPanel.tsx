import React, { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Alert, AlertTitle, AlertDescription } from '../ui/alert'
import { Loader2, Plus, Trash2, Filter, SortAsc, SortDesc, Search } from 'lucide-react'
import { useAgentStore } from '../../store/agentStore'
import { DEFAULT_CAPABILITIES } from '../../lib/agents/capabilities'
import { AgentType, AgentStatus } from '../../lib/types/agent'

export const AgentsPanel: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentType, setNewAgentType] = useState<AgentType>(AgentType.BASE)
  const [filterType, setFilterType] = useState<AgentType | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const { agents, activeAgent, setActiveAgent, addAgent, removeAgent } = useAgentStore()

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    setLoading(true)
    try {
      // Create default agents if none exist
      if (agents.length === 0) {
        addAgent({
          id: 'general-1',
          name: 'General Assistant',
          type: AgentType.BASE,
          status: AgentStatus.IDLE,
          capabilities: DEFAULT_CAPABILITIES.general,
        })

        addAgent({
          id: 'specialist-1',
          name: 'Code Specialist',
          type: AgentType.CEREBELLUM,
          status: AgentStatus.IDLE,
          capabilities: DEFAULT_CAPABILITIES.specialist,
        })
      }
    } catch (err) {
      setError('Failed to load agents')
      console.error('Error loading agents:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) return

    try {
      const capabilities =
        DEFAULT_CAPABILITIES[newAgentType.toLowerCase() as keyof typeof DEFAULT_CAPABILITIES] || []
      const id = `${newAgentType.toLowerCase()}-${Date.now()}`

      // Create agent in the format expected by the store
      addAgent({
        id,
        name: newAgentName,
        type: newAgentType,
        status: AgentStatus.IDLE,
        capabilities,
      })
      setNewAgentName('')
      setNewAgentType(AgentType.BASE)
    } catch (err) {
      setError('Failed to create agent')
      console.error('Error creating agent:', err)
    }
  }

  const handleRemoveAgent = async (agentId: string) => {
    try {
      if (activeAgent?.getId() === agentId) {
        setActiveAgent(null)
      }
      removeAgent(agentId)
    } catch (err) {
      setError('Failed to remove agent')
      console.error('Error removing agent:', err)
    }
  }

  const filteredAgents = filterType
    ? agents.filter(agent => agent.getType() === filterType)
    : agents

  const sortedAgents = filteredAgents.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.getStatus().localeCompare(b.getStatus())
    } else {
      return b.getStatus().localeCompare(a.getStatus())
    }
  })

  const searchedAgents = sortedAgents.filter(agent =>
    agent.getName().toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agents</h1>
        <div className="flex gap-2">
          <Input
            placeholder="New agent name"
            value={newAgentName}
            onChange={e => setNewAgentName(e.target.value)}
            className="w-48"
          />
          <Select
            value={newAgentType}
            onChange={e => setNewAgentType(e.target.value as AgentType)}
            className="w-40"
          >
            {Object.values(AgentType).map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </Select>
          <Button onClick={handleCreateAgent} disabled={!newAgentName.trim()} variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterType(filterType ? null : AgentType.BASE)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {filterType ? 'Clear Filter' : 'Filter by Type'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="mr-2 h-4 w-4" />
            ) : (
              <SortDesc className="mr-2 h-4 w-4" />
            )}
            Sort by Status
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search agents"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-48"
          />
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {searchedAgents.map(agent => (
          <Card
            key={agent.getId()}
            className={`cursor-pointer p-4 transition-colors ${
              activeAgent?.getId() === agent.getId()
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            onClick={() => setActiveAgent(agent)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{agent.getName()}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type: {agent.getType()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status: {agent.getStatus()}
                </p>
                <div className="mt-2 flex gap-2">
                  {agent.getCapabilities().map(capability => (
                    <span
                      key={capability.name}
                      className="rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700"
                      title={capability.description}
                    >
                      {capability.name}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={e => {
                  e.stopPropagation()
                  handleRemoveAgent(agent.getId())
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No agents available. Create one to get started.
        </div>
      )}
    </div>
  )
}
