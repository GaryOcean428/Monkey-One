import { supabase } from './client';
import type { AgentMemoryRecord, AgentRecord, AgentTaskRecord, AgentThoughtRecord } from './types';

export const agentQueries = {
  async createAgent(agent: Omit<AgentRecord, 'id'>) {
    const { data, error } = await supabase
      .from('agents')
      .insert([agent])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAgentById(id: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateAgentStatus(id: string, status: string) {
    const { error } = await supabase
      .from('agents')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  async storeAgentThought(thought: Omit<AgentThoughtRecord, 'id'>) {
    const { data, error } = await supabase
      .from('agent_thoughts')
      .insert([thought])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async storeAgentMemory(memory: Omit<AgentMemoryRecord, 'id'>) {
    const { data, error } = await supabase
      .from('agent_memory')
      .insert([memory])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async searchAgentMemory(agentId: string, query: string) {
    const { data, error } = await supabase
      .rpc('search_agent_memory', {
        agent_id_param: agentId,
        query_text: query
      });

    if (error) throw error;
    return data;
  },

  async createTask(task: Omit<AgentTaskRecord, 'id'>) {
    const { data, error } = await supabase
      .from('agent_tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTaskStatus(id: string, status: string, result?: any) {
    const { error } = await supabase
      .from('agent_tasks')
      .update({
        status,
        result,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (error) throw error;
  }
};
