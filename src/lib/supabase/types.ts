export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
          preferences: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          email: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          preferences?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          email?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          preferences?: Json | null
        }
      }
      notes: {
        Row: {
          id: bigint
          title: string
          content?: string | null
          created_at?: string
          user_id?: string | null
        }
        Insert: {
          id?: never // Generated as identity
          title: string
          content?: string | null
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: never
          title?: string
          content?: string | null
          created_at?: string
          user_id?: string | null
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
