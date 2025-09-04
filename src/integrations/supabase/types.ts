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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      airtime_purchases: {
        Row: {
          amount: number
          created_at: string
          id: string
          network_provider: string
          phone_number: string
          reference_number: string | null
          status: string
          transaction_fee: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          network_provider: string
          phone_number: string
          reference_number?: string | null
          status?: string
          transaction_fee?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          network_provider?: string
          phone_number?: string
          reference_number?: string | null
          status?: string
          transaction_fee?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      auto_save_rules: {
        Row: {
          amount: number | null
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          next_execution_date: string | null
          percentage: number | null
          rule_type: string
          savings_account_id: string
          trigger_condition: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          frequency: string
          id?: string
          is_active?: boolean
          next_execution_date?: string | null
          percentage?: number | null
          rule_type: string
          savings_account_id: string
          trigger_condition?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          next_execution_date?: string | null
          percentage?: number | null
          rule_type?: string
          savings_account_id?: string
          trigger_condition?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_save_rules_savings_account_id_fkey"
            columns: ["savings_account_id"]
            isOneToOne: false
            referencedRelation: "savings_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_providers: {
        Row: {
          bill_type: string
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          provider_name: string
        }
        Insert: {
          bill_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          provider_name: string
        }
        Update: {
          bill_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          provider_name?: string
        }
        Relationships: []
      }
      bills: {
        Row: {
          account_number: string
          amount: number
          bill_type: string
          created_at: string
          customer_name: string | null
          due_date: string | null
          id: string
          payment_date: string | null
          provider_name: string
          reference_number: string | null
          status: string
          transaction_fee: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          amount: number
          bill_type: string
          created_at?: string
          customer_name?: string | null
          due_date?: string | null
          id?: string
          payment_date?: string | null
          provider_name: string
          reference_number?: string | null
          status?: string
          transaction_fee?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          amount?: number
          bill_type?: string
          created_at?: string
          customer_name?: string | null
          due_date?: string | null
          id?: string
          payment_date?: string | null
          provider_name?: string
          reference_number?: string | null
          status?: string
          transaction_fee?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_participants: {
        Row: {
          chat_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_group: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cross_border_transactions: {
        Row: {
          created_at: string
          exchange_rate: number
          id: string
          kyc_verification_id: string | null
          provider: string | null
          provider_transaction_id: string | null
          purpose_of_transfer: string | null
          receive_amount: number
          recipient_country: string
          recipient_currency: string
          recipient_name: string
          recipient_phone: string | null
          reference_number: string | null
          send_amount: number
          send_currency: string
          status: string
          transaction_fee: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exchange_rate: number
          id?: string
          kyc_verification_id?: string | null
          provider?: string | null
          provider_transaction_id?: string | null
          purpose_of_transfer?: string | null
          receive_amount: number
          recipient_country: string
          recipient_currency: string
          recipient_name: string
          recipient_phone?: string | null
          reference_number?: string | null
          send_amount: number
          send_currency: string
          status?: string
          transaction_fee: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exchange_rate?: number
          id?: string
          kyc_verification_id?: string | null
          provider?: string | null
          provider_transaction_id?: string | null
          purpose_of_transfer?: string | null
          receive_amount?: number
          recipient_country?: string
          recipient_currency?: string
          recipient_name?: string
          recipient_phone?: string | null
          reference_number?: string | null
          send_amount?: number
          send_currency?: string
          status?: string
          transaction_fee?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_exchange_rates: {
        Row: {
          currency: string
          id: string
          last_updated: string
          market_cap: number | null
          ngn_price: number
          price_change_24h: number | null
          usd_price: number
          volume_24h: number | null
        }
        Insert: {
          currency: string
          id?: string
          last_updated?: string
          market_cap?: number | null
          ngn_price: number
          price_change_24h?: number | null
          usd_price: number
          volume_24h?: number | null
        }
        Update: {
          currency?: string
          id?: string
          last_updated?: string
          market_cap?: number | null
          ngn_price?: number
          price_change_24h?: number | null
          usd_price?: number
          volume_24h?: number | null
        }
        Relationships: []
      }
      crypto_transactions: {
        Row: {
          created_at: string
          exchange_rate: number | null
          from_amount: number | null
          from_currency: string | null
          id: string
          network_fee: number | null
          recipient_address: string | null
          reference_number: string | null
          status: string
          to_amount: number
          to_currency: string
          transaction_fee: number | null
          transaction_hash: string | null
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exchange_rate?: number | null
          from_amount?: number | null
          from_currency?: string | null
          id?: string
          network_fee?: number | null
          recipient_address?: string | null
          reference_number?: string | null
          status?: string
          to_amount: number
          to_currency: string
          transaction_fee?: number | null
          transaction_hash?: string | null
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exchange_rate?: number | null
          from_amount?: number | null
          from_currency?: string | null
          id?: string
          network_fee?: number | null
          recipient_address?: string | null
          reference_number?: string | null
          status?: string
          to_amount?: number
          to_currency?: string
          transaction_fee?: number | null
          transaction_hash?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          private_key_encrypted: string | null
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency: string
          id?: string
          private_key_encrypted?: string | null
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          private_key_encrypted?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          address: string
          created_at: string
          date_of_birth: string
          document_back_url: string | null
          document_front_url: string | null
          document_number: string
          document_type: string
          full_name: string
          id: string
          occupation: string | null
          phone_number: string
          rejected_reason: string | null
          selfie_url: string | null
          status: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          address: string
          created_at?: string
          date_of_birth: string
          document_back_url?: string | null
          document_front_url?: string | null
          document_number: string
          document_type: string
          full_name: string
          id?: string
          occupation?: string | null
          phone_number: string
          rejected_reason?: string | null
          selfie_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          date_of_birth?: string
          document_back_url?: string | null
          document_front_url?: string | null
          document_number?: string
          document_type?: string
          full_name?: string
          id?: string
          occupation?: string | null
          phone_number?: string
          rejected_reason?: string | null
          selfie_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          media_url: string | null
          message_type: string | null
          sender_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_networks: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          network_code: string | null
          network_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          network_code?: string | null
          network_name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          network_code?: string | null
          network_name?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          payment_method: string
          qr_code_data: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          description?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          payment_method: string
          qr_code_data: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string
          qr_code_data?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      savings_accounts: {
        Row: {
          account_name: string
          account_number: string
          balance: number
          created_at: string
          id: string
          interest_rate: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name?: string
          account_number: string
          balance?: number
          created_at?: string
          id?: string
          interest_rate?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          balance?: number
          created_at?: string
          id?: string
          interest_rate?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          created_at: string
          current_amount: number
          description: string | null
          id: string
          savings_account_id: string
          status: string
          target_amount: number
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          description?: string | null
          id?: string
          savings_account_id: string
          status?: string
          target_amount: number
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          description?: string | null
          id?: string
          savings_account_id?: string
          status?: string
          target_amount?: number
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_savings_account_id_fkey"
            columns: ["savings_account_id"]
            isOneToOne: false
            referencedRelation: "savings_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_transactions: {
        Row: {
          amount: number
          auto_save_rule_id: string | null
          created_at: string
          description: string | null
          id: string
          reference_number: string | null
          savings_account_id: string
          savings_goal_id: string | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          auto_save_rule_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reference_number?: string | null
          savings_account_id: string
          savings_goal_id?: string | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          auto_save_rule_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reference_number?: string | null
          savings_account_id?: string
          savings_goal_id?: string | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_transactions_auto_save_rule_id_fkey"
            columns: ["auto_save_rule_id"]
            isOneToOne: false
            referencedRelation: "auto_save_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_transactions_savings_account_id_fkey"
            columns: ["savings_account_id"]
            isOneToOne: false
            referencedRelation: "savings_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_transactions_savings_goal_id_fkey"
            columns: ["savings_goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_account_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_reference_number: {
        Args: { prefix: string }
        Returns: string
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_chat_participant: {
        Args: { chat_id_param: string; user_id_param: string }
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
  public: {
    Enums: {},
  },
} as const
