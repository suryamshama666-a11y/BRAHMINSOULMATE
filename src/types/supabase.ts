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
          role: string
          verification_status: string | null
          email: string | null
          phone: string | null
          phone_number: string | null
          date_of_birth: string | null
          address: string | null
          occupation: string | null
          profile_picture: string | null
          subscription_status: string | null
          subscription_end_date: string | null
          profile_name_visibility: string | null
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
          role?: string
          verification_status?: string | null
          email?: string | null
          phone?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          address?: string | null
          occupation?: string | null
          profile_picture?: string | null
          subscription_status?: string | null
          subscription_end_date?: string | null
          profile_name_visibility?: string | null
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
          role?: string
          verification_status?: string | null
          email?: string | null
          phone?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          address?: string | null
          occupation?: string | null
          profile_picture?: string | null
          subscription_status?: string | null
          subscription_end_date?: string | null
          profile_name_visibility?: string | null
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
          user1_id: string
          user2_id: string
          compatibility_score: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          compatibility_score?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          compatibility_score?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
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
          status: string
          message_type: string
          media_url: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          status?: string
          message_type?: string
          media_url?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          status?: string
          message_type?: string
          media_url?: string | null
          read_at?: string | null
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
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
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
      verification_requests: {
        Row: {
          id: string
          user_id: string
          document_type: string
          document_url: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_type: string
          document_url: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: string
          document_url?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string
          created_at?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          id: string
          user_id: string
          blocked_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          blocked_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          blocked_user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          viewer_id: string
          viewed_profile_id: string
          viewed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          viewer_id: string
          viewed_profile_id: string
          viewed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          viewer_id?: string
          viewed_profile_id?: string
          viewed_at?: string
          created_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          id: string
          user_id: string
          action: string
          metadata: Json | null
          created_at: string
          count: number
          date: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          metadata?: Json | null
          created_at?: string
          count?: number
          date?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          id: string
          user_id_1: string
          user_id_2: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id_1: string
          user_id_2: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id_1?: string
          user_id_2?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          story: string
          images: string[] | null
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          story: string
          images?: string[] | null
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          story?: string
          images?: string[] | null
          approved?: boolean
          created_at?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string
          view_count: number
          like_count: number
          is_locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: string
          view_count?: number
          like_count?: number
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: string
          view_count?: number
          like_count?: number
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          reply_count: number
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          reply_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          reply_count?: number
          created_at?: string
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          color: string
          post_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          icon?: string
          color?: string
          post_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          color?: string
          post_count?: number
          created_at?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: string
          message: string | null
          member_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: string
          message?: string | null
          member_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: string
          message?: string | null
          member_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_groups: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          image_url: string | null
          member_count: number
          is_private: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          category?: string
          image_url?: string | null
          member_count?: number
          is_private?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          image_url?: string | null
          member_count?: number
          is_private?: boolean
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      compatibility_scores: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          overall_score: number
          guna_milan_score: number
          personality_score: number
          lifestyle_score: number
          family_score: number
          compatibility_details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          overall_score?: number
          guna_milan_score?: number
          personality_score?: number
          lifestyle_score?: number
          family_score?: number
          compatibility_details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          overall_score?: number
          guna_milan_score?: number
          personality_score?: number
          lifestyle_score?: number
          family_score?: number
          compatibility_details?: Json
          created_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: []
      }
      shortlists: {
        Row: {
          id: string
          user_id: string
          shortlist_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shortlist_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shortlist_user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      vdates: {
        Row: {
          id: string
          user_id_1: string
          user_id_2: string
          scheduled_time: string
          duration: number
          status: string
          room_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id_1: string
          user_id_2: string
          scheduled_time: string
          duration?: number
          status?: string
          room_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id_1?: string
          user_id_2?: string
          scheduled_time?: string
          duration?: number
          status?: string
          room_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vdate_reminders: {
        Row: {
          id: string
          vdate_id: string
          user_id: string
          reminder_time: string
          reminder_type: string
          sent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          vdate_id: string
          user_id: string
          reminder_time: string
          reminder_type: string
          sent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          vdate_id?: string
          user_id?: string
          reminder_time?: string
          reminder_type?: string
          sent?: boolean
          created_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          author_id: string
          category: string
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          author_id: string
          category: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          author_id?: string
          category?: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          user_id: string
          order_id: string
          payment_id: string | null
          amount: number
          currency: string
          plan: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id: string
          payment_id?: string | null
          amount: number
          currency?: string
          plan: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string
          payment_id?: string | null
          amount?: number
          currency?: string
          plan?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          user_id: string
          email_enabled: boolean
          sms_enabled: boolean
          push_enabled: boolean
          email_notifications: boolean
          push_notifications: boolean
          new_messages: boolean
          new_interests: boolean
          profile_views: boolean
          marketing_emails: boolean
          frequency: string
          updated_at: string
        }
        Insert: {
          user_id: string
          email_enabled?: boolean
          sms_enabled?: boolean
          push_enabled?: boolean
          email_notifications?: boolean
          push_notifications?: boolean
          new_messages?: boolean
          new_interests?: boolean
          profile_views?: boolean
          marketing_emails?: boolean
          frequency?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email_enabled?: boolean
          sms_enabled?: boolean
          push_enabled?: boolean
          email_notifications?: boolean
          push_notifications?: boolean
          new_messages?: boolean
          new_interests?: boolean
          profile_views?: boolean
          marketing_emails?: boolean
          frequency?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      photos: {
        Row: {
          id: string
          user_id: string
          url: string
          is_profile_picture: boolean
          privacy: 'premium' | 'public' | 'connections'
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          is_profile_picture?: boolean
          privacy?: 'premium' | 'public' | 'connections'
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          is_profile_picture?: boolean
          privacy?: 'premium' | 'public' | 'connections'
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      horoscope_details: {
        Row: {
          id: string
          user_id: string
          birth_date: string
          birth_time: string
          birth_place: string
          rashi: string
          nakshatra: string
          charan: string
          gan: string
          nadi: string
          devak: string
          manglik: string
          sunsign: string
          moonsign: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          birth_date: string
          birth_time: string
          birth_place: string
          rashi?: string
          nakshatra?: string
          charan?: string
          gan?: string
          nadi?: string
          devak?: string
          manglik?: string
          sunsign?: string
          moonsign?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          birth_date?: string
          birth_time?: string
          birth_place?: string
          rashi?: string
          nakshatra?: string
          charan?: string
          gan?: string
          nadi?: string
          devak?: string
          manglik?: string
          sunsign?: string
          moonsign?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "horoscope_details_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          plan: string
          status: string
          start_date: string
          end_date: string
          auto_renewal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          plan?: string
          status?: string
          start_date: string
          end_date: string
          auto_renewal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          plan?: string
          status?: string
          start_date?: string
          end_date?: string
          auto_renewal?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      reactions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_message_id_fkey"
            columns: ["message_id"]
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          partner_id: string
          partner_name: string
          partner_avatar: string | null
          last_message: string | null
          last_message_at: string | null
          unread_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          partner_id: string
          partner_name?: string
          partner_avatar?: string | null
          last_message?: string | null
          last_message_at?: string | null
          unread_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          partner_id?: string
          partner_name?: string
          partner_avatar?: string | null
          last_message?: string | null
          last_message_at?: string | null
          unread_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_partner_id_fkey"
            columns: ["partner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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

// ============================================
// HELPER TYPES FOR JOINED QUERIES
// ============================================
// These types help TypeScript understand the shape of data returned from queries with joins

export type ProfileWithRelations = Database['public']['Tables']['profiles']['Row'] & {
  interests?: string[]
  languages?: string[]
  full_name?: string
  first_name?: string
  last_name?: string
}

export type MessageWithSender = Database['public']['Tables']['messages']['Row'] & {
  sender: ProfileWithRelations | null
  receiver: ProfileWithRelations | null
  reactions?: Reaction[]
}

export type MessageWithProfiles = Database['public']['Tables']['messages']['Row'] & {
  sender: Pick<ProfileWithRelations, 'id' | 'user_id' | 'name' | 'profile_picture'> | null
  receiver: Pick<ProfileWithRelations, 'id' | 'user_id' | 'name' | 'profile_picture'> | null
  full_name?: string
  profile_picture?: string
}

export type ConversationWithPartner = Database['public']['Tables']['conversations']['Row'] & {
  partner: Pick<ProfileWithRelations, 'id' | 'user_id' | 'name' | 'profile_picture'> | null
  unread_count?: number
  totalUnread?: number
}

export type MatchWithProfiles = Database['public']['Tables']['matches']['Row'] & {
  profile: ProfileWithRelations | null
  matched_profile: ProfileWithRelations | null
  match_id?: string
}

export type ConnectionWithUsers = Database['public']['Tables']['connections']['Row'] & {
  user1: ProfileWithRelations | null
  user2: ProfileWithRelations | null
}

export type InterestWithUsers = Database['public']['Tables']['interests']['Row'] & {
  sender: ProfileWithRelations | null
  receiver: ProfileWithRelations | null
}

export type ForumPostWithUser = Database['public']['Tables']['forum_posts']['Row'] & {
  user: ProfileWithRelations | null
  views?: number
  likes?: number
  comment_count?: number
  is_liked?: boolean
}

export type ForumCommentWithUser = Database['public']['Tables']['forum_comments']['Row'] & {
  user: ProfileWithRelations | null
  reply_count?: number
}

export type ProfileViewWithProfile = Database['public']['Tables']['profile_views']['Row'] & {
  viewer: ProfileWithRelations | null
  viewed_profile: ProfileWithRelations | null
}

export type EventWithOrganizer = Database['public']['Tables']['events']['Row'] & {
  organizer: ProfileWithRelations | null
}

export type CompatibilityScoreWithProfiles = Database['public']['Tables']['compatibility_scores']['Row'] & {
  user1_profile: ProfileWithRelations | null
  user2_profile: ProfileWithRelations | null
}

export type Reaction = Database['public']['Tables']['reactions']['Row'] & {
  user: ProfileWithRelations | null
}

export type FollowWithUsers = Database['public']['Tables']['follows']['Row'] & {
  follower: ProfileWithRelations | null
  following: ProfileWithRelations | null
}

export type CommunityGroupWithCreator = Database['public']['Tables']['community_groups']['Row'] & {
  creator: ProfileWithRelations | null
}

export type ShortlistWithProfile = Database['public']['Tables']['shortlists']['Row'] & {
  shortlist_user: ProfileWithRelations | null
}

export type VDateWithUsers = Database['public']['Tables']['vdates']['Row'] & {
  user1: ProfileWithRelations | null
  user2: ProfileWithRelations | null
  meeting_url?: string
}

export type SubscriptionWithDetails = Database['public']['Tables']['user_subscriptions']['Row'] & {
  subscription_plans?: SubscriptionPlan[]
}

export type PaymentWithUser = Database['public']['Tables']['payments']['Row'] & {
  user: ProfileWithRelations | null
}

export type NotificationWithUser = Database['public']['Tables']['notifications']['Row'] & {
  sender: ProfileWithRelations | null
}

export type BlogPostWithAuthor = Database['public']['Tables']['blog_posts']['Row'] & {
  author: ProfileWithRelations | null
}

export type SuccessStoryWithUsers = Database['public']['Tables']['success_stories']['Row'] & {
  user1: ProfileWithRelations | null
  user2: ProfileWithRelations | null
}

export type UserActivityWithUser = Database['public']['Tables']['user_activity']['Row'] & {
  user: ProfileWithRelations | null
}

export type PhotoWithUser = Database['public']['Tables']['photos']['Row'] & {
  user: ProfileWithRelations | null
}

export type HoroscopeDetailsWithUser = Database['public']['Tables']['horoscope_details']['Row'] & {
  user: ProfileWithRelations | null
}

export type NotificationPreferencesWithUser = Database['public']['Tables']['notification_preferences']['Row'] & {
  user: ProfileWithRelations | null
}

export type EventRegistrationWithUser = Database['public']['Tables']['event_registrations']['Row'] & {
  event: EventWithOrganizer | null
  user: ProfileWithRelations | null
}

// Subscription plan type (for joined queries)
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  duration_days: number
  features: string[]
}

// ============================================
// SUPABASE QUERY HELPER TYPES
// ============================================

// Helper type for Supabase query results that can include joined data
export type SupabaseQueryResult<T> = T | null

// Helper for pages with cursor pagination
export interface PaginatedResult<T> {
  data: T[]
  nextCursor?: string
  hasMore: boolean
  totalCount?: number
}

// Helper for realtime subscription messages
export type RealtimeMessage<T> = {
  new: T
  old: T
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}

// ============================================
// COMPATIBILITY TYPES
// ============================================

export interface CompatibilityDetails {
  overall_score: number
  guna_milan_score: number
  personality_score: number
  lifestyle_score: number
  family_score: number
  details: {
    category: string
    score: number
    notes: string[]
  }[]
}

export interface HoroscopeInfo {
  sunsign: string
  moonsign: string
  rashi: string
  nakshatra: string
  charan: string
  gan: string
  nadi: string
  devak: string
  manglik: string | null
}

export interface ProfilePreferences {
  age_range: { min: number; max: number }
  height_range: { min: number; max: number }
  location_preference: string[]
  education_preference: string[]
  profession_preference: string[]
  religion_preference: string[]
  caste_preference: string[]
  marital_status_preference: string[]
}
 