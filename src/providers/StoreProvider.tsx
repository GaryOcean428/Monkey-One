import React from 'react'
import { useNavigationStore } from '../store/navigationStore'

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize the store
  useNavigationStore.getState()

  return <>{children}</>
}
