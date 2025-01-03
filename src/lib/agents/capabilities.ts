import { AgentCapabilityType } from '../types/agent'

export const CHAT_CAPABILITY: AgentCapabilityType = {
  name: 'chat',
  description: 'Ability to engage in conversational interactions',
  version: '1.0.0',
  parameters: {
    message: {
      type: 'string',
      description: 'The message to process',
      required: true,
    },
  },
}

export const SEARCH_CAPABILITY: AgentCapabilityType = {
  name: 'search',
  description: 'Ability to search through vector memory',
  version: '1.0.0',
  parameters: {
    query: {
      type: 'string',
      description: 'The search query',
      required: true,
    },
    limit: {
      type: 'number',
      description: 'Maximum number of results',
      required: false,
    },
  },
}

export const CODE_CAPABILITY: AgentCapabilityType = {
  name: 'code',
  description: 'Ability to analyze and generate code',
  version: '1.0.0',
  parameters: {
    language: {
      type: 'string',
      description: 'Programming language',
      required: true,
    },
    code: {
      type: 'string',
      description: 'Code to analyze or context for generation',
      required: true,
    },
  },
}

export const TOOL_USE_CAPABILITY: AgentCapabilityType = {
  name: 'tool-use',
  description: 'Ability to use external tools and APIs',
  version: '1.0.0',
  parameters: {
    tool: {
      type: 'string',
      description: 'Tool identifier',
      required: true,
    },
    params: {
      type: 'object',
      description: 'Tool parameters',
      required: true,
    },
  },
}

export const DEFAULT_CAPABILITIES = {
  general: [CHAT_CAPABILITY, SEARCH_CAPABILITY],
  specialist: [CHAT_CAPABILITY, CODE_CAPABILITY, TOOL_USE_CAPABILITY],
  assistant: [CHAT_CAPABILITY],
}
