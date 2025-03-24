import * as React from 'react'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { BasePanel } from '@/components/ui/base-panel'
import { usePanelStore } from '@/stores/panel-store'

const PANEL_ID = 'chat'

export function Chat() {
  const { loading, error } = usePanelStore((state) => ({
    loading: state.loading[PANEL_ID] || false,
    error: state.error[PANEL_ID],
  }))

  return (
    <BasePanel
      title="Chat"
      description="Interact with AI assistants and manage conversations"
      loading={loading}
      error={error}
    >
      <ChatContainer />
    </BasePanel>
  )
}
