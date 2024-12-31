import { useContext } from 'react'
import { ToolhouseContext } from '../providers/ToolhouseProvider'

export function useToolhouse() {
  const toolhouse = useContext(ToolhouseContext)

  if (!toolhouse) {
    throw new Error('useToolhouse must be used within a ToolhouseProvider')
  }

  return toolhouse
}
