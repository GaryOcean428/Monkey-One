import { supabase } from './client'
import { ErrorHandler } from '../../utils/errorHandler'

export interface Note {
  id: number
  title: string
  content?: string | null
  created_at?: string
  user_id?: string | null
}

export class NotesService {
  /**
   * Get all notes
   */
  static async getAllNotes(): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        ErrorHandler.log('Failed to fetch notes', {
          level: 'error',
          context: { error },
        })
        return []
      }

      return data || []
    } catch (error) {
      ErrorHandler.log('Exception fetching notes', {
        level: 'error',
        context: { error },
      })
      return []
    }
  }

  /**
   * Get a note by ID
   */
  static async getNoteById(id: number): Promise<Note | null> {
    try {
      const { data, error } = await supabase.from('notes').select('*').eq('id', id).single()

      if (error) {
        ErrorHandler.log('Failed to fetch note by ID', {
          level: 'error',
          context: { error, id },
        })
        return null
      }

      return data
    } catch (error) {
      ErrorHandler.log('Exception fetching note by ID', {
        level: 'error',
        context: { error, id },
      })
      return null
    }
  }

  /**
   * Create a new note
   */
  static async createNote(note: {
    title: string
    content?: string
    user_id?: string
  }): Promise<Note | null> {
    try {
      const { data, error } = await supabase.from('notes').insert([note]).select().single()

      if (error) {
        ErrorHandler.log('Failed to create note', {
          level: 'error',
          context: { error, note },
        })
        return null
      }

      return data
    } catch (error) {
      ErrorHandler.log('Exception creating note', {
        level: 'error',
        context: { error, note },
      })
      return null
    }
  }

  /**
   * Update a note
   */
  static async updateNote(
    id: number,
    updates: { title?: string; content?: string }
  ): Promise<Note | null> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        ErrorHandler.log('Failed to update note', {
          level: 'error',
          context: { error, id, updates },
        })
        return null
      }

      return data
    } catch (error) {
      ErrorHandler.log('Exception updating note', {
        level: 'error',
        context: { error, id, updates },
      })
      return null
    }
  }

  /**
   * Delete a note
   */
  static async deleteNote(id: number): Promise<boolean> {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id)

      if (error) {
        ErrorHandler.log('Failed to delete note', {
          level: 'error',
          context: { error, id },
        })
        return false
      }

      return true
    } catch (error) {
      ErrorHandler.log('Exception deleting note', {
        level: 'error',
        context: { error, id },
      })
      return false
    }
  }

  /**
   * Get notes by user ID
   */
  static async getNotesByUserId(userId: string): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        ErrorHandler.log('Failed to fetch notes by user ID', {
          level: 'error',
          context: { error, userId },
        })
        return []
      }

      return data || []
    } catch (error) {
      ErrorHandler.log('Exception fetching notes by user ID', {
        level: 'error',
        context: { error, userId },
      })
      return []
    }
  }
}
