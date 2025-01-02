import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GitHubPanel from '../../../components/panels/GitHubPanel';

describe('GitHubPanel', () => {
  it('renders GitHub integration heading', () => {
    render(<GitHubPanel />);
    expect(screen.getByText('GitHub Integration')).toBeInTheDocument();
  });

  it('renders repository status card', () => {
    render(<GitHubPanel />);
    expect(screen.getByText('Repository Status')).toBeInTheDocument();
  });
});
