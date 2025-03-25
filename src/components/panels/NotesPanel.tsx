import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSupabase } from '@/lib/supabase/provider'
import { Note, NotesService } from '@/lib/supabase/notes'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { user } = useSupabase()

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes()
  }, [user])

  const fetchNotes = async () => {
    setLoading(true)
    setError(null)
    try {
      let fetchedNotes
      if (user) {
        fetchedNotes = await NotesService.getNotesByUserId(user.id)
      } else {
        fetchedNotes = await NotesService.getAllNotes()
      }
      setNotes(fetchedNotes)
    } catch (err) {
      setError('Failed to fetch notes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteTitle.trim()) return

    setLoading(true)
    setError(null)
    try {
      const createdNote = await NotesService.createNote({
        title: newNoteTitle,
        content: newNoteContent,
        user_id: user?.id,
      })

      if (createdNote) {
        setNotes([createdNote, ...notes])
        setNewNoteTitle('')
        setNewNoteContent('')
      } else {
        setError('Failed to create note')
      }
    } catch (err) {
      setError('An error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const success = await NotesService.deleteNote(id)
      if (success) {
        setNotes(notes.filter(note => note.id !== id))
      } else {
        setError('Failed to delete note')
      }
    } catch (err) {
      setError('An error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Notes</h2>

      {error && <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>}

      <Card className="p-4">
        <h3 className="mb-4 text-lg font-medium">Create New Note</h3>
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div>
            <Input
              placeholder="Note Title"
              value={newNoteTitle}
              onChange={e => setNewNoteTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <textarea
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="Note Content (optional)"
              rows={4}
              value={newNoteContent}
              onChange={e => setNewNoteContent(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading || !newNoteTitle.trim()}>
            {loading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
            Create Note
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-medium">Your Notes</h3>

        {loading && notes.length === 0 ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
            No notes found. Create your first note above.
          </div>
        ) : (
          notes.map(note => (
            <Card key={note.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{note.title}</h4>
                  {note.content && <p className="mt-2 text-gray-600">{note.content}</p>}
                  <p className="mt-2 text-xs text-gray-400">
                    {note.created_at ? new Date(note.created_at).toLocaleString() : 'Unknown date'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
