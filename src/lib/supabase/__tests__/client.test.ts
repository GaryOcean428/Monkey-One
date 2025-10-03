import { describe, it, expect } from 'vitest'
import { supabase } from '../client'

describe('Supabase Client', () => {
  const tables = [
    'agents',
    'agent_tasks',
    'agent_thoughts',
    'agent_memory',
    'agent_collaborations',
    'agent_collaboration_members',
  ]

  tables.forEach(table => {
    it(`should connect to ${table} table`, async () => {
      const { data, error } = await supabase.from(table).select('*').limit(1)

      console.log(`Testing ${table}:`, { data, error })
      expect(error).toBeNull()
      expect(data).toBeDefined()
    })
  })

  it('should be able to insert and retrieve an agent', async () => {
    // Create test agent
    const testAgent = {
      name: 'Test Agent',
      type: 'test',
      description: 'Test agent for integration testing',
      status: 'idle',
      config: {},
      metadata: {},
    }

    // Insert
    const { data: insertedAgent, error: insertError } = await supabase
      .from('agents')
      .insert([testAgent])
      .select()
      .single()

    expect(insertError).toBeNull()
    expect(insertedAgent).toBeDefined()
    expect(insertedAgent.name).toBe(testAgent.name)

    if (insertedAgent?.id) {
      // Retrieve
      const { data: retrievedAgent, error: retrieveError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', insertedAgent.id)
        .single()

      expect(retrieveError).toBeNull()
      expect(retrievedAgent).toBeDefined()
      expect(retrievedAgent.name).toBe(testAgent.name)

      // Cleanup
      const { error: deleteError } = await supabase
        .from('agents')
        .delete()
        .eq('id', insertedAgent.id)

      expect(deleteError).toBeNull()
    }
  })
})
