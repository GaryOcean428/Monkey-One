import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Setup test environment
beforeAll(() => {
  // Add any global setup here
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

afterAll(() => {
  // Add any global cleanup here
})
