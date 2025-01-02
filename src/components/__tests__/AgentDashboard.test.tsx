import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgentDashboard } from '../AgentDashboard';
import { useAgents } from '../../contexts/AgentContext';
import { ThemeProvider } from '../ThemeProvider';

// Mock the useAgents hook
vi.mock('../../contexts/AgentContext', () => ({
  useAgents: vi.fn()
}));

// Mock child components
vi.mock('../AgentMonitor', () => ({
  AgentMonitor: () => <div data-testid="agent-monitor">Agent Monitor</div>
}));

vi.mock('../AgentWorkflow', () => ({
  AgentWorkflow: () => <div data-testid="agent-workflow">Agent Workflow</div>
}));

vi.mock('../PerformanceMetrics', () => ({
  PerformanceMetrics: () => <div data-testid="performance-metrics">Performance Metrics</div>
}));

vi.mock('../ObserverPanel', () => ({
  ObserverPanel: () => <div data-testid="observer-panel">Observer Panel</div>
}));

describe('AgentDashboard', () => {
  beforeAll(() => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    // Setup default mock values
    (useAgents as any).mockReturnValue({
      agents: [],
      activeAgent: null
    });
  });

  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  it('renders the dashboard with correct heading', () => {
    renderWithTheme(<AgentDashboard />);
    const headings = screen.getAllByRole('heading');
    expect(headings[0]).toHaveTextContent('Agent Dashboard');
  });

  it('renders main regions with correct ARIA labels', () => {
    renderWithTheme(<AgentDashboard />);
    expect(screen.getByRole('region', { name: 'Agent Status and Workflow' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Performance and Monitoring' })).toBeInTheDocument();
  });

  it('displays agent monitor with provided agents', () => {
    const mockAgents = [
      { id: '1', name: 'Agent 1', status: 'active' },
      { id: '2', name: 'Agent 2', status: 'idle' }
    ];
    
    (useAgents as any).mockReturnValue({
      agents: mockAgents,
      activeAgent: mockAgents[0]
    });

    renderWithTheme(<AgentDashboard />);
    expect(screen.getByTestId('agent-monitor')).toBeInTheDocument();
    expect(screen.getByTestId('agent-workflow')).toBeInTheDocument();
    expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
    expect(screen.getByTestId('observer-panel')).toBeInTheDocument();
  });
});
