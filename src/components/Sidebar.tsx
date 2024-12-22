import React, { useState } from 'react';
import {
  Menu,
  MessageSquare,
  Settings,
  Brain,
  Users,
  X,
  LayoutDashboard,
  Wrench,
  Search,
  Database,
  FileText,
  Github,
  Activity,
  Network
} from 'lucide-react';
import { useNavigationStore } from '../store/navigationStore';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { activeTab, setActiveTab } = useNavigationStore();

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'workflows', label: 'Workflows', icon: Network },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'vectorstore', label: 'Vector Store', icon: Database },
    { id: 'github', label: 'GitHub', icon: Github },
    { id: 'performance', label: 'Performance', icon: Activity }
  ];

  return (
    <div className={`${isExpanded ? 'w-64' : 'w-16'} bg-gray-900 flex flex-col transition-all duration-300`}>
      <div className="flex items-center p-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
        >
          {isExpanded ? <X size={24} /> : <Menu size={24} />}
        </button>
        {isExpanded && (
          <span className="text-white ml-2 font-semibold">Monkey One</span>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex-1">
        <TabsList className="flex flex-col items-stretch gap-1 px-2 border-none bg-transparent">
          {tabs.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="flex items-center gap-3 p-3 rounded-lg justify-start text-gray-400 hover:text-white hover:bg-gray-800 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              <Icon size={20} />
              {isExpanded && <span>{label}</span>}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-auto p-4 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Users size={20} />
          {isExpanded && <span className="ml-3">Add Agent</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Settings size={20} />
          {isExpanded && <span className="ml-3">Settings</span>}
        </Button>
      </div>
    </div>
  );
}