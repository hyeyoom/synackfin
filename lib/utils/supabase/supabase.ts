export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_articles: {
        Row: {
          author_id: string
          board_type: string
          comment_count: number | null
          content: string | null
          created_at: string
          id: number
          points: number
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          author_id?: string
          board_type?: string
          comment_count?: number | null
          content?: string | null
          created_at?: string
          id?: number
          points?: number
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          author_id?: string
          board_type?: string
          comment_count?: number | null
          content?: string | null
          created_at?: string
          id?: number
          points?: number
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["author_id"]
          },
        ]
      }
      user_comments: {
        Row: {
          article_id: number
          author_id: string
          content: string
          created_at: string
          id: number
          response_to: number | null
        }
        Insert: {
          article_id: number
          author_id?: string
          content: string
          created_at?: string
          id?: number
          response_to?: number | null
        }
        Update: {
          article_id?: number
          author_id?: string
          content?: string
          created_at?: string
          id?: number
          response_to?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "user_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "user_comments_response_to_fkey"
            columns: ["response_to"]
            isOneToOne: false
            referencedRelation: "user_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          author_id: string
          bio: string | null
          created_at: string
          id: number
          name: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string
          bio?: string | null
          created_at?: string
          id?: number
          name?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          bio?: string | null
          created_at?: string
          id?: number
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_votes: {
        Row: {
          article_id: number
          author_id: string
          created_at: string
          id: number
        }
        Insert: {
          article_id: number
          author_id?: string
          created_at?: string
          id?: number
        }
        Update: {
          article_id?: number
          author_id?: string
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_votes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "user_articles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_points: {
        Args: {
          row_id: number
        }
        Returns: number
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
