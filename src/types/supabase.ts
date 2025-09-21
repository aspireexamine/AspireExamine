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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_inputs: {
        Row: {
          created_at: string | null
          difficulty: string | null
          id: string
          num_questions: number | null
          output_format: string
          prompt: string | null
          raw_output: string | null
          source_name: string | null
          source_ref: string | null
          source_type: string
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          id?: string
          num_questions?: number | null
          output_format: string
          prompt?: string | null
          raw_output?: string | null
          source_name?: string | null
          source_ref?: string | null
          source_type: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          id?: string
          num_questions?: number | null
          output_format?: string
          prompt?: string | null
          raw_output?: string | null
          source_name?: string | null
          source_ref?: string | null
          source_type?: string
        }
        Relationships: []
      }
      ai_provider_keys: {
        Row: {
          google_gemini_key: string | null
          groq_key: string | null
          id: string
          openrouter_key: string | null
          updated_at: string | null
        }
        Insert: {
          google_gemini_key?: string | null
          groq_key?: string | null
          id?: string
          openrouter_key?: string | null
          updated_at?: string | null
        }
        Update: {
          google_gemini_key?: string | null
          groq_key?: string | null
          id?: string
          openrouter_key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chapters: {
        Row: {
          created_at: string | null
          id: string
          name: string
          serial: number | null
          subject_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          serial?: number | null
          subject_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          serial?: number | null
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      notebook_folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notebooks: {
        Row: {
          created_at: string | null
          folder_id: string
          id: string
          name: string
          uploaded_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          folder_id: string
          id?: string
          name: string
          uploaded_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          folder_id?: string
          id?: string
          name?: string
          uploaded_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebooks_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "notebook_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      papers: {
        Row: {
          attempts: number | null
          chapter_id: string | null
          created_at: string | null
          difficulty: string
          duration: number
          id: string
          max_marks: number
          practiceSectionId: string | null
          stream_id: string | null
          subject_id: string | null
          testId: string | null
          title: string
          total_questions: number
          type: string | null
        }
        Insert: {
          attempts?: number | null
          chapter_id?: string | null
          created_at?: string | null
          difficulty: string
          duration: number
          id?: string
          max_marks: number
          practiceSectionId?: string | null
          stream_id?: string | null
          subject_id?: string | null
          testId?: string | null
          title: string
          total_questions: number
          type?: string | null
        }
        Update: {
          attempts?: number | null
          chapter_id?: string | null
          created_at?: string | null
          difficulty?: string
          duration?: number
          id?: string
          max_marks?: number
          practiceSectionId?: string | null
          stream_id?: string | null
          subject_id?: string | null
          testId?: string | null
          title?: string
          total_questions?: number
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "papers_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "papers_practiceSectionId_fkey"
            columns: ["practiceSectionId"]
            isOneToOne: false
            referencedRelation: "practice_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "papers_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "papers_streamId_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "papers_testId_fkey"
            columns: ["testId"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_section_chapters: {
        Row: {
          chapter_id: string
          practice_section_id: string
        }
        Insert: {
          chapter_id: string
          practice_section_id: string
        }
        Update: {
          chapter_id?: string
          practice_section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_section_chapters_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_section_chapters_practice_section_id_fkey"
            columns: ["practice_section_id"]
            isOneToOne: false
            referencedRelation: "practice_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_section_papers: {
        Row: {
          paper_id: string
          practice_section_id: string
        }
        Insert: {
          paper_id: string
          practice_section_id: string
        }
        Update: {
          paper_id?: string
          practice_section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_section_papers_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_section_papers_practice_section_id_fkey"
            columns: ["practice_section_id"]
            isOneToOne: false
            referencedRelation: "practice_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_section_subjects: {
        Row: {
          practice_section_id: string
          subject_id: string
        }
        Insert: {
          practice_section_id: string
          subject_id: string
        }
        Update: {
          practice_section_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_section_subjects_practice_section_id_fkey"
            columns: ["practice_section_id"]
            isOneToOne: false
            referencedRelation: "practice_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_section_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sections: {
        Row: {
          all_round_types: string[] | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          stream_id: string | null
          type: string
        }
        Insert: {
          all_round_types?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          stream_id?: string | null
          type: string
        }
        Update: {
          all_round_types?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          stream_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_sections_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          contact_number: string | null
          date_of_birth: string | null
          full_name: string | null
          id: string
          profile_picture: string | null
          role: string | null
        }
        Insert: {
          address?: string | null
          contact_number?: string | null
          date_of_birth?: string | null
          full_name?: string | null
          id: string
          profile_picture?: string | null
          role?: string | null
        }
        Update: {
          address?: string | null
          contact_number?: string | null
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          profile_picture?: string | null
          role?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: number
          created_at: string | null
          difficulty: string
          explanation: string | null
          file_path: string | null
          id: string
          image_url: string | null
          marks: number | null
          options: Json | null
          paper_id: string | null
          question: string
          subject: string | null
          test_id: string | null
          topic: string | null
        }
        Insert: {
          correct_answer: number
          created_at?: string | null
          difficulty: string
          explanation?: string | null
          file_path?: string | null
          id?: string
          image_url?: string | null
          marks?: number | null
          options?: Json | null
          paper_id?: string | null
          question: string
          subject?: string | null
          test_id?: string | null
          topic?: string | null
        }
        Update: {
          correct_answer?: number
          created_at?: string | null
          difficulty?: string
          explanation?: string | null
          file_path?: string | null
          id?: string
          image_url?: string | null
          marks?: number | null
          options?: Json | null
          paper_id?: string | null
          question?: string
          subject?: string | null
          test_id?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      streams: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string | null
          id: string
          name: string
          stream_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          stream_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          stream_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      test_series: {
        Row: {
          description: string | null
          id: string
          name: string
          stream_id: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          stream_id?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          stream_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_series_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          duration: number | null
          id: string
          name: string
          numquestions: number | null
          test_series_id: string | null
        }
        Insert: {
          duration?: number | null
          id?: string
          name: string
          numquestions?: number | null
          test_series_id?: string | null
        }
        Update: {
          duration?: number | null
          id?: string
          name?: string
          numquestions?: number | null
          test_series_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tests_test_series_id_fkey"
            columns: ["test_series_id"]
            isOneToOne: false
            referencedRelation: "test_series"
            referencedColumns: ["id"]
          },
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
