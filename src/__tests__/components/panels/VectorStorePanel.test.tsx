import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import VectorStorePanel from '../../../components/panels/VectorStorePanel';
import { ThemeProvider } from '../../../components/ThemeProvider';

describe('VectorStorePanel', () => {
  it('renders correctly', () => {
    render(
      <ThemeProvider>
        <VectorStorePanel />
      </ThemeProvider>
    );

    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Vector Store Management');
    expect(screen.getByText('Vector Store')).toBeInTheDocument();
    expect(screen.getByText('Vector store is empty.')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <ThemeProvider>
        <VectorStorePanel />
      </ThemeProvider>
    );

    // Initial suspense loading state
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  // TODO: Add more tests for error states and data loading
});
