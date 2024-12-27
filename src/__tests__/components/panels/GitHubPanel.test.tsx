import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GitHubPanel from '../../../components/panels/GitHubPanel';
import { ThemeProvider } from '../../../components/ThemeProvider';

describe('GitHubPanel', () => {
  it('renders correctly', () => {
    render(
      <ThemeProvider>
        <GitHubPanel />
      </ThemeProvider>
    );

    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'GitHub Integration');
    expect(screen.getByText('GitHub Integration')).toBeInTheDocument();
    expect(screen.getByText('Connect GitHub')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <ThemeProvider>
        <GitHubPanel />
      </ThemeProvider>
    );

    // Initial suspense loading state
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  // TODO: Add more tests for error states and data loading
});
