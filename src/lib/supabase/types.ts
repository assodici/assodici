export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      associations: {
        Row: {
          adrg_achemine: string | null
          adrg_codepostal: string | null
          adrg_complemgeo: string | null
          adrg_complemid: string | null
          adrg_declarant: string | null
          adrg_distrib: string | null
          adrg_libvoie: string | null
          adrg_pays: string | null
          adrs_codeinsee: string | null
          adrs_codepostal: string | null
          adrs_complement: string | null
          adrs_distrib: string | null
          adrs_libcommune: string | null
          adrs_libvoie: string | null
          adrs_numvoie: string | null
          adrs_repetition: string | null
          adrs_typevoie: string | null
          created_at: string | null
          date_creat: string | null
          date_decla: string | null
          date_disso: string | null
          date_publi: string | null
          dir_civilite: string | null
          email: string | null
          gestion: string | null
          groupement: string | null
          id: string
          id_ex: string | null
          maj_time: string | null
          nature: string | null
          objet: string | null
          objet_social1: string | null
          objet_social2: string | null
          observation: string | null
          position: string | null
          publiweb: string | null
          rup_mi: string | null
          siret: string | null
          siteweb: string | null
          source: string
          telephone: string | null
          titre: string
          titre_court: string | null
          updated_at: string | null
        }
        Insert: {
          adrg_achemine?: string | null
          adrg_codepostal?: string | null
          adrg_complemgeo?: string | null
          adrg_complemid?: string | null
          adrg_declarant?: string | null
          adrg_distrib?: string | null
          adrg_libvoie?: string | null
          adrg_pays?: string | null
          adrs_codeinsee?: string | null
          adrs_codepostal?: string | null
          adrs_complement?: string | null
          adrs_distrib?: string | null
          adrs_libcommune?: string | null
          adrs_libvoie?: string | null
          adrs_numvoie?: string | null
          adrs_repetition?: string | null
          adrs_typevoie?: string | null
          created_at?: string | null
          date_creat?: string | null
          date_decla?: string | null
          date_disso?: string | null
          date_publi?: string | null
          dir_civilite?: string | null
          email?: string | null
          gestion?: string | null
          groupement?: string | null
          id: string
          id_ex?: string | null
          maj_time?: string | null
          nature?: string | null
          objet?: string | null
          objet_social1?: string | null
          objet_social2?: string | null
          observation?: string | null
          position?: string | null
          publiweb?: string | null
          rup_mi?: string | null
          siret?: string | null
          siteweb?: string | null
          source?: string
          telephone?: string | null
          titre: string
          titre_court?: string | null
          updated_at?: string | null
        }
        Update: {
          adrg_achemine?: string | null
          adrg_codepostal?: string | null
          adrg_complemgeo?: string | null
          adrg_complemid?: string | null
          adrg_declarant?: string | null
          adrg_distrib?: string | null
          adrg_libvoie?: string | null
          adrg_pays?: string | null
          adrs_codeinsee?: string | null
          adrs_codepostal?: string | null
          adrs_complement?: string | null
          adrs_distrib?: string | null
          adrs_libcommune?: string | null
          adrs_libvoie?: string | null
          adrs_numvoie?: string | null
          adrs_repetition?: string | null
          adrs_typevoie?: string | null
          created_at?: string | null
          date_creat?: string | null
          date_decla?: string | null
          date_disso?: string | null
          date_publi?: string | null
          dir_civilite?: string | null
          email?: string | null
          gestion?: string | null
          groupement?: string | null
          id?: string
          id_ex?: string | null
          maj_time?: string | null
          nature?: string | null
          objet?: string | null
          objet_social1?: string | null
          objet_social2?: string | null
          observation?: string | null
          position?: string | null
          publiweb?: string | null
          rup_mi?: string | null
          siret?: string | null
          siteweb?: string | null
          source?: string
          telephone?: string | null
          titre?: string
          titre_court?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      associations_search: {
        Row: {
          adrs_codepostal: string | null
          adrs_libcommune: string | null
          id: string
          objet: string | null
          search_vector: unknown
          titre: string
        }
        Insert: {
          adrs_codepostal?: string | null
          adrs_libcommune?: string | null
          id: string
          objet?: string | null
          search_vector?: unknown
          titre: string
        }
        Update: {
          adrs_codepostal?: string | null
          adrs_libcommune?: string | null
          id?: string
          objet?: string | null
          search_vector?: unknown
          titre?: string
        }
        Relationships: []
      }
      ingestion_runs: {
        Row: {
          error_message: string | null
          filesize: number | null
          id: number
          imported_at: string | null
          last_modified: string | null
          resource_id: string
          row_count: number | null
          status: string
        }
        Insert: {
          error_message?: string | null
          filesize?: number | null
          id?: never
          imported_at?: string | null
          last_modified?: string | null
          resource_id: string
          row_count?: number | null
          status: string
        }
        Update: {
          error_message?: string | null
          filesize?: number | null
          id?: never
          imported_at?: string | null
          last_modified?: string | null
          resource_id?: string
          row_count?: number | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_associations: {
        Args: { lim?: number; query: string }
        Returns: {
          adrs_codepostal: string
          adrs_libcommune: string
          id: string
          objet: string
          rank: number
          titre: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
