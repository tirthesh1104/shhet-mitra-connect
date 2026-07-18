export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      community_posts: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          title: string
          upvotes: number
          user_id: string
          village: string | null
        }
        Insert: {
          author_name?: string
          body: string
          created_at?: string
          id?: string
          title: string
          upvotes?: number
          user_id: string
          village?: string | null
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          title?: string
          upvotes?: number
          user_id?: string
          village?: string | null
        }
        Relationships: []
      }
      community_replies: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          author_name?: string
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          area_acres: number | null
          created_at: string
          health_status: string
          id: string
          name: string
          notes: string | null
          soil_type: string | null
          sown_at: string | null
          user_id: string
        }
        Insert: {
          area_acres?: number | null
          created_at?: string
          health_status?: string
          id?: string
          name: string
          notes?: string | null
          soil_type?: string | null
          sown_at?: string | null
          user_id: string
        }
        Update: {
          area_acres?: number | null
          created_at?: string
          health_status?: string
          id?: string
          name?: string
          notes?: string | null
          soil_type?: string | null
          sown_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expense_logs: {
        Row: {
          amount_inr: number
          category: string
          created_at: string
          crop_name: string
          id: string
          note: string | null
          spent_on: string
          user_id: string
        }
        Insert: {
          amount_inr: number
          category: string
          created_at?: string
          crop_name: string
          id?: string
          note?: string | null
          spent_on?: string
          user_id: string
        }
        Update: {
          amount_inr?: number
          category?: string
          created_at?: string
          crop_name?: string
          id?: string
          note?: string | null
          spent_on?: string
          user_id?: string
        }
        Relationships: []
      }
      expert_queue: {
        Row: {
          created_at: string
          id: string
          scan_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scan_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scan_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_queue_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      fasal_calendar_events: {
        Row: {
          created_at: string
          crop_id: string | null
          event_date: string
          event_type: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          crop_id?: string | null
          event_date: string
          event_type: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          crop_id?: string | null
          event_date?: string
          event_type?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fasal_calendar_events_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      krishi_kendras: {
        Row: {
          created_at: string
          district: string
          hours: string | null
          id: string
          name: string
          phone: string | null
          taluka: string
          type: string
        }
        Insert: {
          created_at?: string
          district: string
          hours?: string | null
          id?: string
          name: string
          phone?: string | null
          taluka: string
          type: string
        }
        Update: {
          created_at?: string
          district?: string
          hours?: string | null
          id?: string
          name?: string
          phone?: string | null
          taluka?: string
          type?: string
        }
        Relationships: []
      }
      labour_listings: {
        Row: {
          created_at: string
          date_needed: string | null
          description: string | null
          id: string
          kind: string
          offer_or_need: string
          phone: string | null
          poster_name: string
          rate_per_day: number | null
          user_id: string
          village: string | null
        }
        Insert: {
          created_at?: string
          date_needed?: string | null
          description?: string | null
          id?: string
          kind: string
          offer_or_need: string
          phone?: string | null
          poster_name?: string
          rate_per_day?: number | null
          user_id: string
          village?: string | null
        }
        Update: {
          created_at?: string
          date_needed?: string | null
          description?: string | null
          id?: string
          kind?: string
          offer_or_need?: string
          phone?: string | null
          poster_name?: string
          rate_per_day?: number | null
          user_id?: string
          village?: string | null
        }
        Relationships: []
      }
      mandi_prices: {
        Row: {
          arrival_date: string
          commodity: string
          district: string
          fetched_at: string
          id: string
          market: string
          max_price: number | null
          min_price: number | null
          modal_price: number | null
          state: string
        }
        Insert: {
          arrival_date: string
          commodity: string
          district: string
          fetched_at?: string
          id?: string
          market: string
          max_price?: number | null
          min_price?: number | null
          modal_price?: number | null
          state?: string
        }
        Update: {
          arrival_date?: string
          commodity?: string
          district?: string
          fetched_at?: string
          id?: string
          market?: string
          max_price?: number | null
          min_price?: number | null
          modal_price?: number | null
          state?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          created_at: string
          crop_name: string
          id: string
          phone: string | null
          price_per_qtl: number
          quantity_qtl: number
          seller_name: string
          status: string
          user_id: string
          village: string | null
        }
        Insert: {
          created_at?: string
          crop_name: string
          id?: string
          phone?: string | null
          price_per_qtl: number
          quantity_qtl: number
          seller_name?: string
          status?: string
          user_id: string
          village?: string | null
        }
        Update: {
          created_at?: string
          crop_name?: string
          id?: string
          phone?: string | null
          price_per_qtl?: number
          quantity_qtl?: number
          seller_name?: string
          status?: string
          user_id?: string
          village?: string | null
        }
        Relationships: []
      }
      outbreak_signals: {
        Row: {
          created_at: string
          disease_key: string
          id: string
          village: string
        }
        Insert: {
          created_at?: string
          disease_key: string
          id?: string
          village: string
        }
        Update: {
          created_at?: string
          disease_key?: string
          id?: string
          village?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          language: string
          onboarded: boolean
          state: string
          updated_at: string
          village: string
          voice_mode: boolean
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          language?: string
          onboarded?: boolean
          state?: string
          updated_at?: string
          village?: string
          voice_mode?: boolean
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          language?: string
          onboarded?: boolean
          state?: string
          updated_at?: string
          village?: string
          voice_mode?: boolean
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          done: boolean
          due_date: string
          id: string
          kind: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          due_date: string
          id?: string
          kind?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          due_date?: string
          id?: string
          kind?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          ai_analysis: Json | null
          confidence: number
          cost_estimate: number | null
          created_at: string
          crop_name: string
          disease_key: string
          id: string
          image_url: string | null
          sent_to_expert: boolean
          severity: string
          user_id: string
          village: string | null
          weather_snapshot: Json | null
        }
        Insert: {
          ai_analysis?: Json | null
          confidence: number
          cost_estimate?: number | null
          created_at?: string
          crop_name: string
          disease_key: string
          id?: string
          image_url?: string | null
          sent_to_expert?: boolean
          severity: string
          user_id: string
          village?: string | null
          weather_snapshot?: Json | null
        }
        Update: {
          ai_analysis?: Json | null
          confidence?: number
          cost_estimate?: number | null
          created_at?: string
          crop_name?: string
          disease_key?: string
          id?: string
          image_url?: string | null
          sent_to_expert?: boolean
          severity?: string
          user_id?: string
          village?: string | null
          weather_snapshot?: Json | null
        }
        Relationships: []
      }
      seed_codes: {
        Row: {
          brand: string
          code: string
          created_at: string
          crop: string
          id: string
          notes: string | null
          status: string
          variety: string
        }
        Insert: {
          brand: string
          code: string
          created_at?: string
          crop: string
          id?: string
          notes?: string | null
          status?: string
          variety: string
        }
        Update: {
          brand?: string
          code?: string
          created_at?: string
          crop?: string
          id?: string
          notes?: string | null
          status?: string
          variety?: string
        }
        Relationships: []
      }
      yield_estimates: {
        Row: {
          area_acres: number
          created_at: string
          crop_name: string
          estimated_revenue_inr: number
          estimated_yield_qtl: number
          id: string
          inputs: Json
          user_id: string
        }
        Insert: {
          area_acres: number
          created_at?: string
          crop_name: string
          estimated_revenue_inr: number
          estimated_yield_qtl: number
          id?: string
          inputs?: Json
          user_id: string
        }
        Update: {
          area_acres?: number
          created_at?: string
          crop_name?: string
          estimated_revenue_inr?: number
          estimated_yield_qtl?: number
          id?: string
          inputs?: Json
          user_id?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
