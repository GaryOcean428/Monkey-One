import React from 'react';
import { Brain, Code, History, Settings, Wrench } from 'lucide-react';

const menuItems = [
  { icon: Brain, label: 'Memory' },
  { icon: Code, label: 'Tools' },
  { icon: History, label: 'History' },
  { icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <div className="w-20 bg-gray-900 flex flex-col items-center py-6 border-r border-gray-800">
      <div className="mb-8">
        <Wrench className="w-10 h-10 text-green-400" />
      </div>
      
      <nav className="flex-1">
        {menuItems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="w-14 h-14 flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-xl mb-4 transition-colors"
            title={label}
          >
            <Icon className="w-7 h-7" />
          </button>
        ))}
      </nav>
    </div>
  );
}