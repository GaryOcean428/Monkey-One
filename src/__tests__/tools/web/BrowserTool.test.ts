import { expect, describe, it } from 'vitest'
import { BrowserTool } from '../../../lib/tools/web/BrowserTool'
import { ToolExecutionError } from '../../../lib/errors/AgentErrors'

describe('BrowserTool', () => {
  const browserTool = new BrowserTool()

  describe('error handling', () => {
    it('should include error details in error state', async () => {
      try {
        await browserTool.execute({ action: 'invalid' })
        fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeInstanceOf(ToolExecutionError)
        expect((error as ToolExecutionError).details.state).toEqual({
          action: 'invalid',
          error: 'Unsupported browser action: invalid',
        })
      }
    })
  })
})
