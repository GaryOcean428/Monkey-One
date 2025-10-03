import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Thought, ThoughtType, ThoughtFilter, ThoughtStats } from '../types/thought'
import { vectorStore } from '../lib/vectorstore'

interface ThoughtState {
  thoughts: Thought[]
  activeCollaborations: Map<string, string[]>
  activeTasks: Map<string, Set<string>>
  filters: ThoughtFilter
  stats: ThoughtStats

  // Actions
  addThought: (thought: Omit<Thought, 'id' | 'timestamp'>) => Promise<void>
  updateThought: (id: string, updates: Partial<Thought>) => void
  deleteThought: (id: string) => void
  clearThoughts: () => void
  setFilters: (filters: Partial<ThoughtFilter>) => void
  clearFilters: () => void

  // Getters
  getFilteredThoughts: () => Thought[]
  getThoughtsByType: (type: ThoughtType) => Thought[]
  getThoughtsByAgent: (agentId: string) => Thought[]
  getThoughtsByTask: (taskId: string) => Thought[]
  getCollaborationThoughts: (collaborationId: string) => Thought[]
  getTaskAgents: (taskId: string) => string[]
  getStats: () => ThoughtStats
}

const calculateStats = (thoughts: Thought[]): ThoughtStats => {
  const stats: ThoughtStats = {
    totalThoughts: thoughts.length,
    thoughtsByType: {} as Record<ThoughtType, number>,
    thoughtsByAgent: {},
    thoughtsByTask: {},
    averageImportance: 0,
    averageConfidence: 0,
    activeCollaborations: new Set(thoughts.map(t => t.collaborationId).filter(Boolean)).size,
    activeTasks: new Set(thoughts.map(t => t.taskId).filter(Boolean)).size,
  }

  let totalImportance = 0
  let totalConfidence = 0
  let importanceCount = 0
  let confidenceCount = 0

  thoughts.forEach(thought => {
    // Count by type
    stats.thoughtsByType[thought.type] = (stats.thoughtsByType[thought.type] || 0) + 1

    // Count by agent
    if (thought.agentId) {
      stats.thoughtsByAgent[thought.agentId] = (stats.thoughtsByAgent[thought.agentId] || 0) + 1
    }

    // Count by task
    if (thought.taskId) {
      stats.thoughtsByTask[thought.taskId] = (stats.thoughtsByTask[thought.taskId] || 0) + 1
    }

    // Calculate averages
    if (thought.importance !== undefined) {
      totalImportance += thought.importance
      importanceCount++
    }
    if (thought.confidence !== undefined) {
      totalConfidence += thought.confidence
      confidenceCount++
    }
  })

  stats.averageImportance = importanceCount > 0 ? totalImportance / importanceCount : 0
  stats.averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0

  return stats
}

export const useThoughtStore = create<ThoughtState>()(
  persist(
    (set, get) => ({
      thoughts: [],
      activeCollaborations: new Map(),
      activeTasks: new Map(),
      filters: {},
      stats: calculateStats([]),

      addThought: async thought => {
        const newThought: Thought = {
          ...thought,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        }

        // Generate embedding if not provided
        if (!newThought.vectorEmbedding && newThought.message) {
          try {
            newThought.vectorEmbedding = await vectorStore.generateEmbedding(newThought.message)
          } catch (error) {
            console.error('Failed to generate thought embedding:', error)
          }
        }

        set(state => {
          const newThoughts = [...state.thoughts, newThought]

          // Update collaborations
          if (newThought.collaborationId) {
            const thoughts = state.activeCollaborations.get(newThought.collaborationId) || []
            state.activeCollaborations.set(newThought.collaborationId, [...thoughts, newThought.id])
          }

          // Update tasks
          if (newThought.taskId && newThought.agentId) {
            const agents = state.activeTasks.get(newThought.taskId) || new Set()
            agents.add(newThought.agentId)
            state.activeTasks.set(newThought.taskId, agents)
          }

          return {
            thoughts: newThoughts,
            stats: calculateStats(newThoughts),
          }
        })
      },

      updateThought: (id, updates) => {
        set(state => {
          const thoughtIndex = state.thoughts.findIndex(t => t.id === id)
          if (thoughtIndex === -1) return state

          const newThoughts = [...state.thoughts]
          newThoughts[thoughtIndex] = { ...newThoughts[thoughtIndex], ...updates }

          return {
            thoughts: newThoughts,
            stats: calculateStats(newThoughts),
          }
        })
      },

      deleteThought: id => {
        set(state => {
          const newThoughts = state.thoughts.filter(t => t.id !== id)
          return {
            thoughts: newThoughts,
            stats: calculateStats(newThoughts),
          }
        })
      },

      clearThoughts: () => {
        set({
          thoughts: [],
          activeCollaborations: new Map(),
          activeTasks: new Map(),
          stats: calculateStats([]),
        })
      },

      setFilters: filters => {
        set(state => ({
          filters: { ...state.filters, ...filters },
        }))
      },

      clearFilters: () => {
        set({ filters: {} })
      },

      getFilteredThoughts: () => {
        const { thoughts, filters } = get()
        return thoughts.filter(thought => {
          if (filters.agentId && thought.agentId !== filters.agentId) return false
          if (filters.collaborationId && thought.collaborationId !== filters.collaborationId)
            return false
          if (filters.type && thought.type !== filters.type) return false
          if (filters.since && thought.timestamp < filters.since) return false
          if (filters.taskId && thought.taskId !== filters.taskId) return false
          if (filters.source && thought.source !== filters.source) return false
          if (filters.tags && !filters.tags.every(tag => thought.tags?.includes(tag))) return false
          if (
            filters.minImportance &&
            (!thought.importance || thought.importance < filters.minImportance)
          )
            return false
          if (
            filters.minConfidence &&
            (!thought.confidence || thought.confidence < filters.minConfidence)
          )
            return false
          if (
            filters.searchQuery &&
            !thought.message.toLowerCase().includes(filters.searchQuery.toLowerCase())
          )
            return false
          return true
        })
      },

      getThoughtsByType: type => {
        return get().thoughts.filter(t => t.type === type)
      },

      getThoughtsByAgent: agentId => {
        return get().thoughts.filter(t => t.agentId === agentId)
      },

      getThoughtsByTask: taskId => {
        return get().thoughts.filter(t => t.taskId === taskId)
      },

      getCollaborationThoughts: collaborationId => {
        const thoughtIds = get().activeCollaborations.get(collaborationId) || []
        return get().thoughts.filter(t => thoughtIds.includes(t.id))
      },

      getTaskAgents: taskId => {
        return Array.from(get().activeTasks.get(taskId) || [])
      },

      getStats: () => get().stats,
    }),
    {
      name: 'thought-store',
      partialize: state => ({
        thoughts: state.thoughts,
        filters: state.filters,
      }),
    }
  )
)

// Export singleton for direct access
export const thoughtStore = useThoughtStore.getState()
