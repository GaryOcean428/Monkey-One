import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChat } from '../../hooks/useChat'
import { MockAgent } from '../../test/test-utils'

// Mock the store modules
vi.mock('../../store/chatStore', () => ({
  useChatStore: () => ({
    messages: [],
    tasks: [],
    activeTask: null,
    isProcessing: false,
    error: null,
    sendMessage: vi.fn(),
    clearMessages: vi.fn(),
    approveTask: vi.fn(),
    rejectTask: vi.fn(),
  }),
}))

vi.mock('../../store/agentStore', () => ({
  useAgentStore: () => ({
    activeAgent: null,
    setActiveAgent: vi.fn(),
  }),
}))

describe('useChat', () => {
  it('initializes with empty messages', () => {
    const { result } = renderHook(() => useChat())
    expect(result.current.messages).toEqual([])
  })

  it('handles setting active agent', async () => {
    const mockAgent = new MockAgent('test-agent')
    const { result } = renderHook(() => useChat())

    await act(async () => {
      result.current.setActiveAgent(mockAgent)
    })

    expect(result.current.hasActiveAgent).toBe(true)
  })
})
