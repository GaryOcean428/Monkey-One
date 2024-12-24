import React, { createContext, useContext, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToolhouseErrorBoundary } from '@/components/ErrorBoundary/ToolhouseErrorBoundary';

interface ToolhouseContextValue {
  queryClient: QueryClient;
}

const ToolhouseContext = createContext<ToolhouseContextValue | null>(null);

export const useToolhouseContext = () => {
  const context = useContext(ToolhouseContext);
  if (!context) {
    throw new Error('useToolhouseContext must be used within a ToolhouseProvider');
  }
  return context;
};

interface ToolhouseProviderProps {
  children: React.ReactNode;
}

export const ToolhouseProvider: React.FC<ToolhouseProviderProps> = ({ children }) => {
  const queryClientRef = useRef<QueryClient>();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          retry: parseInt(import.meta.env.VITE_AI_RETRY_ATTEMPTS || '3'),
          staleTime: 1000 * 60, // 1 minute
          cacheTime: 1000 * 60 * 5, // 5 minutes
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: parseInt(import.meta.env.VITE_AI_RETRY_ATTEMPTS || '3'),
        },
      },
    });
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <ToolhouseContext.Provider value={{ queryClient: queryClientRef.current }}>
        <ToolhouseErrorBoundary>
          {children}
        </ToolhouseErrorBoundary>
      </ToolhouseContext.Provider>
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
};
