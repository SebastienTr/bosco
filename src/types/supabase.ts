export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      geocode_cache: {
        Row: {
          country: string | null
          country_code: string | null
          created_at: string | null
          lat_key: string
          lon_key: string
          name: string
        }
        Insert: {
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          lat_key: string
          lon_key: string
          name: string
        }
        Update: {
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          lat_key?: string
          lon_key?: string
          name?: string
        }
        Relationships: []
      }
      legs: {
        Row: {
          avg_speed_kts: number | null
          created_at: string
          distance_nm: number | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          max_speed_kts: number | null
          started_at: string | null
          track_geojson: Json
          voyage_id: string
        }
        Insert: {
          avg_speed_kts?: number | null
          created_at?: string
          distance_nm?: number | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          max_speed_kts?: number | null
          started_at?: string | null
          track_geojson: Json
          voyage_id: string
        }
        Update: {
          avg_speed_kts?: number | null
          created_at?: string
          distance_nm?: number | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          max_speed_kts?: number | null
          started_at?: string | null
          track_geojson?: Json
          voyage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legs_voyage_id_fkey"
            columns: ["voyage_id"]
            isOneToOne: false
            referencedRelation: "voyages"
            referencedColumns: ["id"]
          },
        ]
      }
      log_entries: {
        Row: {
          created_at: string
          entry_date: string
          id: string
          leg_id: string | null
          photo_urls: Json
          stopover_id: string | null
          text: string
          updated_at: string
          voyage_id: string
        }
        Insert: {
          created_at?: string
          entry_date: string
          id?: string
          leg_id?: string | null
          photo_urls?: Json
          stopover_id?: string | null
          text: string
          updated_at?: string
          voyage_id: string
        }
        Update: {
          created_at?: string
          entry_date?: string
          id?: string
          leg_id?: string | null
          photo_urls?: Json
          stopover_id?: string | null
          text?: string
          updated_at?: string
          voyage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "log_entries_leg_id_fkey"
            columns: ["leg_id"]
            isOneToOne: false
            referencedRelation: "legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_entries_stopover_id_fkey"
            columns: ["stopover_id"]
            isOneToOne: false
            referencedRelation: "stopovers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_entries_voyage_id_fkey"
            columns: ["voyage_id"]
            isOneToOne: false
            referencedRelation: "voyages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          boat_name: string | null
          boat_photo_url: string | null
          boat_type: string | null
          created_at: string
          disabled_at: string | null
          id: string
          is_admin: boolean
          preferred_language: string
          profile_photo_url: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          bio?: string | null
          boat_name?: string | null
          boat_photo_url?: string | null
          boat_type?: string | null
          created_at?: string
          disabled_at?: string | null
          id: string
          is_admin?: boolean
          preferred_language?: string
          profile_photo_url?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          bio?: string | null
          boat_name?: string | null
          boat_photo_url?: string | null
          boat_type?: string | null
          created_at?: string
          disabled_at?: string | null
          id?: string
          is_admin?: boolean
          preferred_language?: string
          profile_photo_url?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      stopovers: {
        Row: {
          arrived_at: string | null
          country: string | null
          country_code: string | null
          created_at: string
          departed_at: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          voyage_id: string
        }
        Insert: {
          arrived_at?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          departed_at?: string | null
          id?: string
          latitude: number
          longitude: number
          name?: string
          voyage_id: string
        }
        Update: {
          arrived_at?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          departed_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          voyage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stopovers_voyage_id_fkey"
            columns: ["voyage_id"]
            isOneToOne: false
            referencedRelation: "voyages"
            referencedColumns: ["id"]
          },
        ]
      }
      voyages: {
        Row: {
          boat_flag: string | null
          boat_length_m: number | null
          boat_name: string | null
          boat_type: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          home_port: string | null
          id: string
          is_public: boolean
          name: string
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          boat_flag?: string | null
          boat_length_m?: number | null
          boat_name?: string | null
          boat_type?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          home_port?: string | null
          id?: string
          is_public?: boolean
          name: string
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          boat_flag?: string | null
          boat_length_m?: number | null
          boat_name?: string | null
          boat_type?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          home_port?: string | null
          id?: string
          is_public?: boolean
          name?: string
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voyages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voyages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          bio: string | null
          boat_name: string | null
          boat_photo_url: string | null
          boat_type: string | null
          id: string | null
          profile_photo_url: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_pseudo_availability: {
        Args: { exclude_user_id?: string; input_pseudo: string }
        Returns: boolean
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

