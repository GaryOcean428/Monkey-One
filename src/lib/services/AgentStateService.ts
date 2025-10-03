import { AgentStatus } from '../types/agent'

export interface AgentState {
  id: string
  status: AgentStatus
  lastUpdate: number
  metrics: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageResponseTime: number
    lastExecutionTime: number
  }
}

export interface AgentStateUpdate {
  agentId: string
  timestamp: number
  changes: Partial<AgentState>
}

interface StateStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

class LocalStorage implements StateStorage {
  getItem(key: string): string | null {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
  }

  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value)
    }
  }

  removeItem(key: string): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
  }
}

export class AgentStateService {
  private static instance: AgentStateService
  private readonly STORAGE_KEY = 'agent_states'
  private states: Map<string, AgentState>
  private stateUpdateHandlers: Map<string, ((update: AgentStateUpdate) => void)[]>
  private storage: StateStorage
  private stateUpdateInterval: number
  private updateIntervalId?: ReturnType<typeof setInterval>

  private constructor(storage: StateStorage = new LocalStorage(), stateUpdateInterval = 5000) {
    this.storage = storage
    this.stateUpdateInterval = stateUpdateInterval
    this.states = new Map()
    this.stateUpdateHandlers = new Map()
    this.loadStates()
    this.startStateUpdateInterval()
  }

  public static getInstance(
    storage?: StateStorage,
    stateUpdateInterval?: number
  ): AgentStateService {
    if (!AgentStateService.instance) {
      AgentStateService.instance = new AgentStateService(storage, stateUpdateInterval)
    }
    return AgentStateService.instance
  }

  private loadStates(): void {
    try {
      const savedStates = this.storage.getItem(this.STORAGE_KEY)
      if (savedStates) {
        const parsedStates = JSON.parse(savedStates)
        Object.entries(parsedStates).forEach(([id, state]) => {
          this.states.set(id, state as AgentState)
        })
      }
    } catch (error) {
      console.error('Failed to load agent states:', error)
    }
  }

  private saveStates(): void {
    try {
      const statesToSave = Object.fromEntries(this.states.entries())
      this.storage.setItem(this.STORAGE_KEY, JSON.stringify(statesToSave))
    } catch (error) {
      console.error('Failed to save agent states:', error)
    }
  }

  private startStateUpdateInterval(): void {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId)
    }

    this.updateIntervalId = setInterval(() => {
      this.states.forEach((state, agentId) => {
        const handlers = this.stateUpdateHandlers.get(agentId)
        if (handlers) {
          const update: AgentStateUpdate = {
            agentId,
            timestamp: Date.now(),
            changes: state,
          }
          handlers.forEach(handler => handler(update))
        }
      })
    }, this.stateUpdateInterval)
  }

  getState(agentId: string): AgentState | undefined {
    return this.states.get(agentId)
  }

  updateState(agentId: string, update: Partial<AgentState>): void {
    const currentState = this.states.get(agentId) || {
      id: agentId,
      status: AgentStatus.IDLE,
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastExecutionTime: 0,
      },
      lastUpdate: Date.now(),
    }

    const newState = { ...currentState, ...update, lastUpdate: Date.now() }
    this.states.set(agentId, newState)
    this.saveStates()

    const handlers = this.stateUpdateHandlers.get(agentId)
    if (handlers) {
      const stateUpdate: AgentStateUpdate = {
        agentId,
        timestamp: Date.now(),
        changes: update,
      }
      handlers.forEach(handler => handler(stateUpdate))
    }
  }

  onStateUpdate(agentId: string, handler: (update: AgentStateUpdate) => void): void {
    const handlers = this.stateUpdateHandlers.get(agentId) || []
    handlers.push(handler)
    this.stateUpdateHandlers.set(agentId, handlers)
  }

  clearState(agentId: string): void {
    this.states.delete(agentId)
    this.saveStates()
  }

  clearAllStates(): void {
    this.states.clear()
    this.saveStates()
  }

  destroy(): void {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId)
    }
  }
}
