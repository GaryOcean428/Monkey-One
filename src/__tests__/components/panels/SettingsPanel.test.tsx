import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SettingsProvider } from '../../../contexts/SettingsContext'
import { SettingsPanel } from '../../../components/panels/SettingsPanel'

describe('SettingsPanel', () => {
  it('renders settings panel', () => {
    render(
      <SettingsProvider>
        <SettingsPanel />
      </SettingsProvider>
    )
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})
