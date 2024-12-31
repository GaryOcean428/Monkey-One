import { create } from 'zustand';
import { IconGithub, IconDocument } from '../components/ui/icons';

interface Integration {
  name: string;
  status: 'connected' | 'disconnected';
  icon: React.ReactNode;
}

interface IntegrationsStore {
  integrations: Integration[];
  updateIntegration: (name: string, status: 'connected' | 'disconnected') => void;
}

export const useIntegrationsStore = create<IntegrationsStore>((set) => ({
  integrations: [
    {
      name: 'GitHub',
      status: 'disconnected',
      icon: IconGithub,
    },
    {
      name: 'Local Files',
      status: 'connected',
      icon: IconDocument,
    },
  ],
  updateIntegration: (name, status) =>
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.name === name ? { ...integration, status } : integration
      ),
    })),
}));
