import { LucideIcon } from 'lucide-react'
import { create } from 'zustand'
import { Icons } from '../components/ui/icons'

interface Integration {
  name: string
  status: 'connected' | 'disconnected'
  icon: LucideIcon
}

interface IntegrationsStore {
  integrations: Integration[]
  updateIntegration: (name: string, status: 'connected' | 'disconnected') => void
}

export const useIntegrationsStore = create<IntegrationsStore>(set => ({
  integrations: [
    {
      name: 'GitHub',
      status: 'disconnected',
      icon: Icons.gitHub as LucideIcon,
    },
    {
      name: 'Local Files',
      status: 'connected',
      icon: Icons.fileText as LucideIcon,
    },
  ],
  updateIntegration: (name, status) =>
    set(state => ({
      integrations: state.integrations.map(integration =>
        integration.name === name ? { ...integration, status } : integration
      ),
    })),
}))
