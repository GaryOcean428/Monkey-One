import * as React from 'react'
import { NotesPanel } from '@/components/panels/NotesPanel'

export default function Notes() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Notes</h1>
      <NotesPanel />
    </div>
  )
}
