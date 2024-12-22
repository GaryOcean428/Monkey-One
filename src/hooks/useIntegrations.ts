import { useState, useCallback } from 'react';
import { useFirebase } from './useFirebase';
import { useGitHub } from './useGitHub';
import { Mail, Github, Calendar, FileText, Cloud } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  icon: typeof Mail;
  status: 'connected' | 'disconnected';
  handler: {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
  };
}

export function useIntegrations() {
  const { isConnected: isFirebaseConnected } = useFirebase();
  const { isConfigured: isGitHubConnected } = useGitHub();

  const [integrations] = useState<Integration[]>([
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: Cloud,
      status: isFirebaseConnected ? 'connected' : 'disconnected',
      handler: {
        connect: async () => {
          // Implement Google Drive OAuth
          window.open('/api/auth/google', '_blank');
        },
        disconnect: async () => {
          // Implement disconnect
          localStorage.removeItem('google_token');
        }
      }
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      status: isFirebaseConnected ? 'connected' : 'disconnected',
      handler: {
        connect: async () => {
          // Implement email integration
          window.location.href = '/api/auth/email';
        },
        disconnect: async () => {
          localStorage.removeItem('email_token');
        }
      }
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      status: isGitHubConnected ? 'connected' : 'disconnected',
      handler: {
        connect: async () => {
          window.location.href = '/api/auth/github';
        },
        disconnect: async () => {
          localStorage.removeItem('github_token');
        }
      }
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: Calendar,
      status: isFirebaseConnected ? 'connected' : 'disconnected',
      handler: {
        connect: async () => {
          window.location.href = '/api/auth/calendar';
        },
        disconnect: async () => {
          localStorage.removeItem('calendar_token');
        }
      }
    },
    {
      id: 'files',
      name: 'Local Files',
      icon: FileText,
      status: 'connected',
      handler: {
        connect: async () => {
          // Local files are always available
        },
        disconnect: async () => {
          // Local files cannot be disconnected
        }
      }
    }
  ]);

  const connectIntegration = useCallback(async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (integration) {
      await integration.handler.connect();
    }
  }, [integrations]);

  const disconnectIntegration = useCallback(async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (integration) {
      await integration.handler.disconnect();
    }
  }, [integrations]);

  return {
    integrations,
    connectIntegration,
    disconnectIntegration
  };
}