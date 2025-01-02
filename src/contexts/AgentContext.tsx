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
    const loadAgents = async () => {
      try {
        // Ensure registry is initialized
        const registry = agentManager.getRegistry();
        if (!registry) {
          console.error('Agent registry not initialized');
          return;
        }

        // Get all available agents
        const initialAgents = await agentManager.getAllAgents();
        console.log('Loaded agents:', initialAgents);

        // Map agents to UI format
        const mappedAgents = initialAgents.map(agent => ({
          id: agent.id,
          name: agent.name || `Agent ${agent.id}`,
          type: agent.type.toLowerCase() as Agent['type'],
          status: agent.status || 'idle'
        }));

        setAgents(mappedAgents);

        // Set first agent as active if none selected
        if (mappedAgents.length > 0 && !activeAgent) {
          console.log('Setting active agent:', mappedAgents[0]);
          setActiveAgent(mappedAgents[0]);
        }
      } catch (error) {
        console.error('Failed to load agents:', error);
      }
    };

    void loadAgents();
  }, [activeAgent]);

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