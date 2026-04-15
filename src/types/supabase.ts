/**
 * CAUTION: This file is manually synchronized with the production schema and migrations.
 * Do not overwrite this file without verifying against the latest database hardening migrations.
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
          deleted_at: string | null
          last_active: string | null
          last_seen_at: string | null
          
          first_name: string | null
          last_name: string | null
          display_name: string | null
          name: string | null
          
          email: string | null
          phone_number: string | null
          
          date_of_birth: string | null
          age: number | null
          
          gender: string
          height: number | null
          weight: number | null
          complexion: string | null
          
          address: Json | null
          location: Json | null
          city: string | null
          state: string | null
          country: string | null
          
          religion: string | null
          caste: string | null
          subcaste: string | null
          gotra: string | null
          mother_tongue: string | null
          languages: string[] | null
          languages_known: string[] | null
          
          marital_status: string
          education: Json | null
          education_level: string | null
          education_details: string | null
          employment: Json | null
          occupation: string | null
          company_name: string | null
          annual_income: number | null
          
          family: Json | null
          family_type: string | null
          father_name: string | null
          father_occupation: string | null
          mother_name: string | null
          mother_occupation: string | null
          siblings: number | null
          family_location: string | null
          
          horoscope: Json | null
          horoscope_url: string | null
          birth_time: string | null
          birth_place: string | null
          rashi: string | null
          nakshatra: string | null
          manglik: boolean | null
          manglik_status: string | null
          kundali_url: string | null
          
          about_me: string | null
          bio: string | null
          interests: string[] | null
          hobbies: string[] | null
          preferences: Json | null
          partner_preferences: Json | null
          
          is_verified: boolean | null
          verified: boolean | null
          verification_status: string | null
          verification_documents: Json | null
          
          subscription_type: string | null
          subscription_status: string | null
          subscription_start: string | null
          subscription_end: string | null
          subscription_end_date: string | null
          subscription_expiry: string | null
          subscription_expires_at: string | null
          
          role: string
          account_status: string | null
          is_active: boolean | null
          is_banned: boolean | null
          
          profile_picture_url: string | null
          profile_picture: string | null
          images: string[] | null
          gallery_images: string[] | null
          
          profile_completion: number | null
          profile_completion_percentage: number | null
          profile_name_visibility: string | null
          privacy_settings: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          name?: string | null
          
          email?: string | null
          phone_number?: string | null
          
          date_of_birth?: string | null
          age?: number | null
          
          gender: string
          height?: number | null
          weight?: number | null
          complexion?: string | null
          
          address?: Json | null
          location?: Json | null
          city?: string | null
          state?: string | null
          country?: string | null
          
          religion?: string | null
          caste?: string | null
          subcaste?: string | null
          gotra?: string | null
          mother_tongue?: string | null
          languages?: string[] | null
          languages_known?: string[] | null
          
          marital_status?: string
          education?: Json | null
          employment?: Json | null
          annual_income?: number | null
          
          family?: Json | null
          horoscope?: Json | null
          birth_time?: string | null
          birth_place?: string | null
          
          about_me?: string | null
          bio?: string | null
          interests?: string[] | null
          hobbies?: string[] | null
          preferences?: Json | null
          
          is_verified?: boolean | null
          verified?: boolean | null
          verification_status?: string | null
          
          subscription_type?: string | null
          subscription_status?: string | null
          role?: string
          account_status?: string | null
          is_active?: boolean | null
          
          profile_picture_url?: string | null
          images?: string[] | null
          profile_completion?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          name?: string | null
          
          email?: string | null
          phone_number?: string | null
          
          date_of_birth?: string | null
          age?: number | null
          
          gender?: string
          height?: number | null
          weight?: number | null
          complexion?: string | null
          
          address?: Json | null
          location?: Json | null
          city?: string | null
          state?: string | null
          country?: string | null
          
          religion?: string | null
          caste?: string | null
          subcaste?: string | null
          gotra?: string | null
          
          marital_status?: string
          education?: Json | null
          employment?: Json | null
          annual_income?: number | null
          
          family?: Json | null
          horoscope?: Json | null
          birth_time?: string | null
          birth_place?: string | null
          
          about_me?: string | null
          bio?: string | null
          interests?: string[] | null
          hobbies?: string[] | null
          preferences?: Json | null
          
          is_verified?: boolean | null
          verified?: boolean | null
          verification_status?: string | null
          
          subscription_type?: string | null
          subscription_status?: string | null
          role?: string
          account_status?: string | null
          is_active?: boolean | null
          
          profile_picture_url?: string | null
          images?: string[] | null
          profile_completion?: number | null
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
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          message_type: string
          media_url: string | null
          attachment_url: string | null
          read_at: string | null
          read: boolean
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          message_type?: string
          media_url?: string | null
          attachment_url?: string | null
          read_at?: string | null
          read?: boolean
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          message_type?: string
          media_url?: string | null
          attachment_url?: string | null
          read_at?: string | null
          read?: boolean
          created_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_posts: {
        Row: {
          id: string
          user_id: string
          author_id: string
          category: string
          category_id: string | null
          title: string
          content: string
          views: number
          view_count: number
          likes: number
          like_count: number
          reply_count: number
          is_pinned: boolean
          is_locked: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          author_id?: string
          category?: string
          category_id?: string | null
          title: string
          content: string
          views?: number
          view_count?: number
          likes?: number
          like_count?: number
          reply_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          author_id?: string
          category?: string
          category_id?: string | null
          title?: string
          content?: string
          views?: number
          view_count?: number
          likes?: number
          like_count?: number
          reply_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_likes: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          target_id: string
          target_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          target_id: string
          target_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string | null
          target_id?: string
          target_type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_likes_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          }
        ]
      }
      shortlists: {
        Row: {
          id: string
          user_id: string
          shortlist_user_id: string
          shortlisted_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shortlist_user_id: string
          shortlisted_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shortlist_user_id?: string
          shortlisted_user_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shortlists_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          starts_at: string
          ends_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          starts_at?: string
          ends_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          starts_at?: string
          ends_at?: string
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
      payments: {
        Row: {
          id: string
          user_id: string
          order_id: string | null
          payment_id: string | null
          amount: number
          currency: string
          status: string
          plan: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id?: string | null
          payment_id?: string | null
          amount: number
          currency?: string
          status?: string
          plan?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string | null
          payment_id?: string | null
          amount?: number
          currency?: string
          status?: string
          plan?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      success_stories: {
        Row: {
          id: string
          couple_user_1: string | null
          couple_user_2: string | null
          title: string
          story: string
          wedding_date: string | null
          marriage_date: string | null
          images: string[]
          image_url: string | null
          status: string | null
          approved: boolean
          is_published: boolean
          created_at: string
          approved_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          couple_user_1?: string | null
          couple_user_2?: string | null
          title: string
          story: string
          wedding_date?: string | null
          marriage_date?: string | null
          images?: string[]
          image_url?: string | null
          status?: string | null
          approved?: boolean
          is_published?: boolean
          created_at?: string
          approved_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          couple_user_1?: string | null
          couple_user_2?: string | null
          title?: string
          story?: string
          wedding_date?: string | null
          marriage_date?: string | null
          images?: string[]
          image_url?: string | null
          status?: string | null
          approved?: boolean
          is_published?: boolean
          created_at?: string
          approved_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "success_stories_couple_user_1_fkey"
            columns: ["couple_user_1"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_couple_user_2_fkey"
            columns: ["couple_user_2"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      vdates: {
        Row: {
          id: string
          organizer_id: string
          participant_id: string
          title: string
          description: string | null
          scheduled_at: string
          scheduled_time: string | null
          duration_minutes: number
          status: string
          meeting_url: string | null
          room_name: string | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organizer_id: string
          participant_id: string
          title: string
          description?: string | null
          scheduled_at: string
          scheduled_time?: string | null
          duration_minutes?: number
          status?: string
          meeting_url?: string | null
          room_name?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organizer_id?: string
          participant_id?: string
          title?: string
          description?: string | null
          scheduled_at?: string
          scheduled_time?: string | null
          duration_minutes?: number
          status?: string
          meeting_url?: string | null
          room_name?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vdates_organizer_id_fkey"
            columns: ["organizer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdates_participant_id_fkey"
            columns: ["participant_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      interests: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: string
          message: string | null
          created_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: string
          message?: string | null
          created_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: string
          message?: string | null
          created_at?: string
          responded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interests_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interests_receiver_id_fkey"
            columns: ["receiver_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          compatibility_score: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          compatibility_score?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          compatibility_score?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            referencedRelation: "users"
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
          message: string | null
          content: string | null
          related_user_id: string | null
          related_entity_id: string | null
          read: boolean
          read_at: string | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          content?: string | null
          related_user_id?: string | null
          related_entity_id?: string | null
          read?: boolean
          read_at?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          content?: string | null
          related_user_id?: string | null
          related_entity_id?: string | null
          read?: boolean
          read_at?: string | null
          created_at?: string
          deleted_at?: string | null
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
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          sms_enabled: boolean
          push_enabled: boolean
          frequency: string
          interest_received: boolean
          match_found: boolean
          message_received: boolean
          subscription_expiry: boolean
          event_reminders: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          sms_enabled?: boolean
          push_enabled?: boolean
          frequency?: string
          interest_received?: boolean
          match_found?: boolean
          message_received?: boolean
          subscription_expiry?: boolean
          event_reminders?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          sms_enabled?: boolean
          push_enabled?: boolean
          frequency?: string
          interest_received?: boolean
          match_found?: boolean
          message_received?: boolean
          subscription_expiry?: boolean
          event_reminders?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          organizer_id: string
          title: string
          description: string | null
          event_type: string
          event_date: string
          location: string | null
          is_virtual: boolean
          meeting_url: string | null
          max_participants: number | null
          registration_fee: number
          banner_image_url: string | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organizer_id: string
          title: string
          description?: string | null
          event_type: string
          event_date: string
          location?: string | null
          is_virtual?: boolean
          meeting_url?: string | null
          max_participants?: number | null
          registration_fee?: number
          banner_image_url?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organizer_id?: string
          title?: string
          description?: string | null
          event_type?: string
          event_date?: string
          location?: string | null
          is_virtual?: boolean
          meeting_url?: string | null
          max_participants?: number | null
          registration_fee?: number
          banner_image_url?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          registered_at: string
          attended: boolean
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          registered_at?: string
          attended?: boolean
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          registered_at?: string
          attended?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      user_analytics: {
        Row: {
          id: string
          user_id: string
          profile_views: number
          interests_sent: number
          interests_received: number
          messages_sent: number
          messages_received: number
          last_login: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_views?: number
          interests_sent?: number
          interests_received?: number
          messages_sent?: number
          messages_received?: number
          last_login?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_views?: number
          interests_sent?: number
          interests_received?: number
          messages_sent?: number
          messages_received?: number
          last_login?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      client_errors: {
        Row: {
          id: string
          user_id: string | null
          error_message: string
          error_stack: string | null
          url: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          error_message: string
          error_stack?: string | null
          url?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          error_message?: string
          error_stack?: string | null
          url?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: string
          old_data: Json | null
          new_data: Json | null
          actor_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: string
          old_data?: Json | null
          new_data?: Json | null
          actor_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: string
          old_data?: Json | null
          new_data?: Json | null
          actor_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_successful_payment: {
        Args: {
          p_user_id: string
          p_order_id: string
          p_payment_id: string
          p_amount: number
          p_currency: string
          p_plan: string
          p_end_date: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}