/**
 * Supabase database type definitions
 * Generated types for better type safety when working with Supabase
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          name: string
          age: number
          gender: string
          images: string[]
          bio: string
          location: Json
          religion: string
          caste: string | null
          subcaste: string | null
          marital_status: string
          height: number
          education: Json
          employment: Json
          family: Json | null
          preferences: Json | null
          horoscope: Json | null
          subscription_type: string
          subscription_expiry: string | null
          interests: string[]
          languages: string[]
          verified: boolean
          last_active: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          name: string
          age: number
          gender: string
          images?: string[]
          bio?: string
          location: Json
          religion: string
          caste?: string | null
          subcaste?: string | null
          marital_status: string
          height: number
          education: Json
          employment: Json
          family?: Json | null
          preferences?: Json | null
          horoscope?: Json | null
          subscription_type?: string
          subscription_expiry?: string | null
          interests?: string[]
          languages?: string[]
          verified?: boolean
          last_active?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          name?: string
          age?: number
          gender?: string
          images?: string[]
          bio?: string
          location?: Json
          religion?: string
          caste?: string | null
          subcaste?: string | null
          marital_status?: string
          height?: number
          education?: Json
          employment?: Json
          family?: Json | null
          preferences?: Json | null
          horoscope?: Json | null
          subscription_type?: string
          subscription_expiry?: string | null
          interests?: string[]
          languages?: string[]
          verified?: boolean
          last_active?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      matches: {
        Row: {
          id: string
          user_id: string
          match_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_match_id_fkey"
            columns: ["match_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          timestamp: string
          action_url: string | null
          sender_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          read?: boolean
          timestamp?: string
          action_url?: string | null
          sender_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          read?: boolean
          timestamp?: string
          action_url?: string | null
          sender_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          time: string
          location: string
          image: string | null
          max_participants: number | null
          current_participants: number
          price: number | null
          organizer_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          time: string
          location: string
          image?: string | null
          max_participants?: number | null
          current_participants?: number
          price?: number | null
          organizer_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          time?: string
          location?: string
          image?: string | null
          max_participants?: number | null
          current_participants?: number
          price?: number | null
          organizer_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: string
          status?: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 