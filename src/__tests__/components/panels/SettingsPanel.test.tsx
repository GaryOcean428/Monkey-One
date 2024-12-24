import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPanel from '../../../components/panels/SettingsPanel';
import { ThemeProvider } from '../../../components/ThemeProvider';
import { SettingsProvider } from '../../../context/SettingsContext';

// Mock the settings store
vi.mock('../../../store/settingsStore', () => ({
  useSettingsStore: () => ({
    settings: {
      theme: 'light',
      fontSize: 'medium',
      notifications: true,
      llm: {
        defaultModel: 'gpt-4-o1',
        temperature: 0.7,
        maxTokens: 1000,
        streamResponses: true
      },
      agents: {
        maxConcurrentTasks: 5,
        taskTimeout: 30000,
        autoDelegation: true
      }
    },
    updateSettings: vi.fn(),
    resetSettings: vi.fn()
  })
}));

describe('SettingsPanel', () => {
  const renderSettingsPanel = () => {
    return render(
      <ThemeProvider>
        <SettingsProvider>
          <SettingsPanel />
        </SettingsProvider>
      </ThemeProvider>
    );
  };

  it('renders correctly', () => {
    renderSettingsPanel();
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Settings Management');
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('Language Model Settings')).toBeInTheDocument();
    expect(screen.getByText('Agent Settings')).toBeInTheDocument();
  });

  it('shows all setting sections', () => {
    renderSettingsPanel();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Font Size')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Default Model')).toBeInTheDocument();
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Max Tokens')).toBeInTheDocument();
    expect(screen.getByText('Stream Responses')).toBeInTheDocument();
    expect(screen.getByText('Max Concurrent Tasks')).toBeInTheDocument();
    expect(screen.getByText('Task Timeout (ms)')).toBeInTheDocument();
    expect(screen.getByText('Auto Delegation')).toBeInTheDocument();
  });

  it('has a reset button', () => {
    renderSettingsPanel();
    expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
  });
});
