import React from 'react';
import { useIntegrationsStore } from '../store/integrationsStore';

interface IntegrationItemProps {
  name: string;
  status: 'connected' | 'disconnected';
  icon: React.ReactNode;
}

const IntegrationItem: React.FC<IntegrationItemProps> = ({ name, status, icon }) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/10">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-muted-foreground">{status}</p>
      </div>
    </div>
  </div>
);

export const Integrations: React.FC = () => {
  const integrations = useIntegrationsStore(state => state.integrations);

  return (
    <div className="h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Integrations</h2>
      </div>
      <div className="space-y-2">
        {integrations.map((integration, index) => (
          <IntegrationItem key={index} {...integration} />
        ))}
      </div>
    </div>
  );
};
