export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: Record<string, {
      Row: Record<string, Json>
      Insert: Record<string, Json>
      Update: Record<string, Json>
    }>
    Views: Record<string, {
      Row: Record<string, Json>
    }>
    Functions: Record<string, unknown>
    Enums: Record<string, string[]>
  }
}
