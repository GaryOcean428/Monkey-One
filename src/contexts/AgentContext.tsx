import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Agent, Message } from '../types';
import { agentManager } from '../lib/agent';

interface AgentContextType {
  agents: Agent[];
  activeAgent: Agent | null;
  setActiveAgent: (agent: Agent | null) => void;
  sendMessage: (content: string) => Promise<Message>;
  isProcessing: boolean;
}

const AgentContext = createContext<AgentContextType | null>(null);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initialize agents
    const initialAgents = agentManager.getAllAgents().map(agent => ({
      id: agent.id,
      name: agent.name,
      type: agent.role.toLowerCase() as Agent['type'],
      status: 'idle'
    }));
    setAgents(initialAgents);
    if (initialAgents.length > 0) {
      setActiveAgent(initialAgents[0]);
    }
  }, []);

  const sendMessage = async (content: string): Promise<Message> => {
    if (!activeAgent) {
      throw new Error('No active agent selected');
    }

    setIsProcessing(true);
    try {
      const agent = agentManager.getAgent(activeAgent.id);
      if (!agent) {
        throw new Error('Agent not found');
      }

      const response = await agent.processMessage({
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now()
      });

      return {
        ...response,
        status: 'sent'
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AgentContext.Provider value={{ agents, activeAgent, setActiveAgent, sendMessage, isProcessing }}>
      {children}
    </AgentContext.Provider>
  );
}

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
};