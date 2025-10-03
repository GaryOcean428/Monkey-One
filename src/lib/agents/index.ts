export { BaseAgent } from './base'
export { OrchestratorAgent } from './orchestrator'
export { WebSurferAgent } from './web-surfer'
export { FileSurferAgent } from './file-surfer'
export { CoderAgent } from './coder'

import type { Agent } from '../../types'
import { OrchestratorAgent } from './orchestrator'
import { WebSurferAgent } from './web-surfer'
import { FileSurferAgent } from './file-surfer'
import { CoderAgent } from './coder'

export interface AgentConstructor {
  id: string
  name: string
  role?: string
  superiorId?: string
}

enum AgentType {
  Orchestrator = 'orchestrator',
  WebSurfer = 'websurfer',
  FileSurfer = 'filesurfer',
  Coder = 'coder',
}

export function createAgent(type: AgentType, config: AgentConstructor): Agent {
  switch (type) {
    case AgentType.Orchestrator: {
      const agent = new OrchestratorAgent(config.id, config.name)
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        capabilities: agent.capabilities,
        subordinates: agent.subordinates,
        superiorId: config.superiorId,
      }
    }
    case AgentType.WebSurfer: {
      const agent = new WebSurferAgent(config.id, config.name)
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        capabilities: agent.capabilities,
        subordinates: agent.subordinates,
        superiorId: config.superiorId,
      }
    }
    case AgentType.FileSurfer: {
      const agent = new FileSurferAgent(config.id, config.name)
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        capabilities: agent.capabilities,
        subordinates: agent.subordinates,
        superiorId: config.superiorId,
      }
    }
    case AgentType.Coder: {
      const agent = new CoderAgent(config.id, config.name)
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        capabilities: agent.capabilities,
        subordinates: agent.subordinates,
        superiorId: config.superiorId,
      }
    }
    default:
      throw new Error(`Unknown agent type: ${type}`)
  }
}
export { AgentConstructor, AgentType, createAgent }
