export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
      }
      agents: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          status: string
          config: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          status?: string
          config?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          status?: string
          config?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      agent_tasks: {
        Row: {
          id: string
          agent_id: string
          name: string
          description: string | null
          status: string
          priority: number
          progress: number
          result: Json | null
          error: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          name: string
          description?: string | null
          status?: string
          priority?: number
          progress?: number
          result?: Json | null
          error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          name?: string
          description?: string | null
          status?: string
          priority?: number
          progress?: number
          result?: Json | null
          error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agent_thoughts: {
        Row: {
          id: string
          agent_id: string
          task_id: string | null
          type: string
          message: string
          metadata: Json
          importance: number | null
          confidence: number | null
          embedding: number[] | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          task_id?: string | null
          type: string
          message: string
          metadata?: Json
          importance?: number | null
          confidence?: number | null
          embedding?: number[] | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          task_id?: string | null
          type?: string
          message?: string
          metadata?: Json
          importance?: number | null
          confidence?: number | null
          embedding?: number[] | null
          created_at?: string
        }
      }
      agent_memory: {
        Row: {
          id: string
          agent_id: string
          key: string
          value: Json
          embedding: number[] | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          key: string
          value: Json
          embedding?: number[] | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          key?: string
          value?: Json
          embedding?: number[] | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agent_collaborations: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      agent_collaboration_members: {
        Row: {
          collaboration_id: string
          agent_id: string
          role: string
          joined_at: string
        }
        Insert: {
          collaboration_id: string
          agent_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          collaboration_id?: string
          agent_id?: string
          role?: string
          joined_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
