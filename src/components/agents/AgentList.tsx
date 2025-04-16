import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Code, Globe, Folder, Plus, Trash2, Edit3 } from 'lucide-react';
import { useAgents } from '../../contexts/AgentContext';
import { Button } from '../ui/button';

export function AgentList() {
  const { agents, activeAgent, setActiveAgent, addAgent, removeAgent, editAgent } = useAgents();

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'coder': return <Code size={20} />;
      case 'websurfer': return <Globe size={20} />;
      case 'filesurfer': return <Folder size={20} />;
      default: return <Bot size={20} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">Agents</h2>
        <Button variant="ghost" size="sm" onClick={() => addAgent()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {agents.map((agent) => (
          <motion.div
            key={agent.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors
              ${activeAgent?.id === agent.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            <div onClick={() => setActiveAgent(agent)} className="flex-1 flex items-center gap-3">
              {getAgentIcon(agent.type)}
              <div className="flex-1 text-left">
                <div className="font-medium">{agent.name}</div>
                <div className="text-xs opacity-80">
                  {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                agent.status === 'active' ? 'bg-green-500' :
                agent.status === 'error' ? 'bg-red-500' :
                'bg-gray-400'
              }`} />
            </div>
            <Button variant="ghost" size="sm" onClick={() => editAgent(agent.id)}>
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => removeAgent(agent.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
