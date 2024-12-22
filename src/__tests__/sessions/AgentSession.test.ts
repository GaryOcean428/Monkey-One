import { AgentSession, SessionOptions } from '@/lib/sessions/AgentSession'
import { Agent, AgentStatus, AgentType, Message, MessageType, MemoryItem, MemoryType } from '@/types'
import { RuntimeError } from '@/lib/errors/AgentErrors'

class MockAgent implements Agent {
  id: string
  type: AgentType
  status: AgentStatus
  capabilities: string[]

  constructor() {
    this.id = 'test-agent'
    this.type = AgentType.BASE
    this.status = AgentStatus.IDLE
    this.capabilities = ['test']
  }

  async initialize(): Promise<void> {
    // Mock implementation
  }

  async handleMessage(message: Message): Promise<Message> {
    return {
      id: 'response-' + message.id,
      type: MessageType.RESPONSE,
      sender: this.id,
      recipient: message.sender,
      content: 'test response',
      timestamp: Date.now()
    }
  }
}

describe('AgentSession', () => {
  let session: AgentSession
  let agent: Agent
  let defaultOptions: SessionOptions

  beforeEach(() => {
    agent = new MockAgent()
    defaultOptions = {
      maxHistorySize: 5,
      maxMemorySize: 5,
      persistenceEnabled: false,
      autoSave: false
    }
    session = new AgentSession(agent, defaultOptions)
  })

  afterEach(() => {
    session.dispose()
  })

  describe('initialization', () => {
    it('should create session with default options', () => {
      const basicSession = new AgentSession(agent)
      expect(basicSession.getId()).toBeDefined()
      expect(basicSession.getAgent()).toBe(agent)
    })

    it('should create session with custom options', () => {
      expect(session.getState().history).toHaveLength(0)
      expect(session.getState().memory).toHaveLength(0)
    })
  })

  describe('message handling', () => {
    let validMessage: Message

    beforeEach(() => {
      validMessage = {
        id: 'test-message',
        type: MessageType.COMMAND,
        sender: 'other-agent',
        recipient: agent.id,
        content: 'test content',
        timestamp: Date.now()
      }
    })

    it('should add message to history', async () => {
      await session.addMessage(validMessage)
      const history = session.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0]).toEqual(validMessage)
    })

    it('should enforce max history size', async () => {
      for (let i = 0; i < 10; i++) {
        await session.addMessage({
          ...validMessage,
          id: `message-${i}`
        })
      }
      expect(session.getHistory()).toHaveLength(defaultOptions.maxHistorySize!)
    })

    it('should throw error for invalid message format', async () => {
      const invalidMessage = { ...validMessage, id: '' }
      await expect(session.addMessage(invalidMessage)).rejects.toThrow(RuntimeError)
    })

    it('should throw error for unrelated message', async () => {
      const unrelatedMessage = {
        ...validMessage,
        sender: 'other-agent',
        recipient: 'another-agent'
      }
      await expect(session.addMessage(unrelatedMessage)).rejects.toThrow(RuntimeError)
    })
  })

  describe('memory management', () => {
    let validMemoryItem: MemoryItem

    beforeEach(() => {
      validMemoryItem = {
        id: 'test-memory',
        type: MemoryType.CONVERSATION,
        content: 'test content',
        timestamp: Date.now()
      }
    })

    it('should add memory item', async () => {
      await session.addMemoryItem(validMemoryItem)
      const memory = session.getMemory()
      expect(memory).toHaveLength(1)
      expect(memory[0]).toEqual(validMemoryItem)
    })

    it('should enforce max memory size', async () => {
      for (let i = 0; i < 10; i++) {
        await session.addMemoryItem({
          ...validMemoryItem,
          id: `memory-${i}`
        })
      }
      expect(session.getMemory()).toHaveLength(defaultOptions.maxMemorySize!)
    })

    it('should get memory by type', async () => {
      await session.addMemoryItem(validMemoryItem)
      await session.addMemoryItem({
        ...validMemoryItem,
        id: 'test-memory-2',
        type: MemoryType.STATE
      })

      const conversationMemory = session.getMemoryByType(MemoryType.CONVERSATION)
      expect(conversationMemory).toHaveLength(1)
      expect(conversationMemory[0].id).toBe('test-memory')
    })

    it('should throw error for invalid memory item', async () => {
      const invalidItem = { ...validMemoryItem, id: '' }
      await expect(session.addMemoryItem(invalidItem as MemoryItem)).rejects.toThrow(RuntimeError)
    })
  })

  describe('context management', () => {
    it('should set and get context values', async () => {
      await session.setContext('testKey', 'testValue')
      expect(session.getContext('testKey')).toBe('testValue')
    })

    it('should return undefined for non-existent context key', () => {
      expect(session.getContext('nonexistent')).toBeUndefined()
    })
  })

  describe('status management', () => {
    it('should update agent status', async () => {
      await session.updateStatus(AgentStatus.BUSY)
      expect(session.getState().status).toBe(AgentStatus.BUSY)
    })
  })

  describe('metadata management', () => {
    it('should update metadata', async () => {
      const metadata = { key: 'value' }
      await session.updateMetadata(metadata)
      expect(session.getState().metadata).toEqual(metadata)
    })

    it('should merge new metadata with existing', async () => {
      await session.updateMetadata({ key1: 'value1' })
      await session.updateMetadata({ key2: 'value2' })
      expect(session.getState().metadata).toEqual({
        key1: 'value1',
        key2: 'value2'
      })
    })
  })

  describe('persistence', () => {
    beforeEach(() => {
      session = new AgentSession(agent, {
        ...defaultOptions,
        persistenceEnabled: true
      })
    })

    it('should save state when persistence is enabled', async () => {
      const consoleSpy = jest.spyOn(console, 'log')
      await session.save()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Saving session state:',
        expect.any(Object)
      )
    })

    it('should attempt to load state', async () => {
      const consoleSpy = jest.spyOn(console, 'log')
      await session.load()
      expect(consoleSpy).toHaveBeenCalledWith('Loading session state...')
    })
  })

  describe('auto-save', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      session = new AgentSession(agent, {
        ...defaultOptions,
        persistenceEnabled: true,
        autoSave: true,
        saveInterval: 1000
      })
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should auto-save at specified interval', () => {
      const consoleSpy = jest.spyOn(console, 'log')
      jest.advanceTimersByTime(1000)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Saving session state:',
        expect.any(Object)
      )
    })
  })

  describe('session cleanup', () => {
    it('should clear session state', async () => {
      await session.addMessage({
        id: 'test',
        type: MessageType.COMMAND,
        sender: 'other',
        recipient: agent.id,
        content: 'test',
        timestamp: Date.now()
      })

      await session.clear()
      expect(session.getHistory()).toHaveLength(0)
      expect(session.getMemory()).toHaveLength(0)
      expect(session.getState().context).toEqual({})
    })

    it('should dispose session resources', () => {
      const autoSaveSession = new AgentSession(agent, {
        persistenceEnabled: true,
        autoSave: true,
        saveInterval: 1000
      })
      
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
      autoSaveSession.dispose()
      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })
})
