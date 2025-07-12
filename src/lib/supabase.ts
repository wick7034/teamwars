import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type Database = {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          start_time: string | null;
          end_time: string | null;
          status: string | null;
        };
        Insert: {
          id: string;
          start_time?: string | null;
          end_time?: string | null;
          status?: string | null;
        };
        Update: {
          id?: string;
          start_time?: string | null;
          end_time?: string | null;
          status?: string | null;
        };
      };
      game_tiles: {
        Row: {
          id: string;
          x: number;
          y: number;
          owner: string | null;
          claimed_at: string | null;
          claimed_by: string;
          game_id: string | null;
        };
        Insert: {
          id?: string;
          x: number;
          y: number;
          owner?: string | null;
          claimed_at?: string | null;
          claimed_by: string;
          game_id?: string | null;
        };
        Update: {
          id?: string;
          x?: number;
          y?: number;
          owner?: string | null;
          claimed_at?: string | null;
          claimed_by?: string;
          game_id?: string | null;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          username: string;
          team: string;
          message: string;
          timestamp: string | null;
          game_id: string | null;
        };
        Insert: {
          id?: string;
          username: string;
          team: string;
          message: string;
          timestamp?: string | null;
          game_id?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          team?: string;
          message?: string;
          timestamp?: string | null;
          game_id?: string | null;
        };
      };
      scores: {
        Row: {
          id: string;
          player_id: string | null;
          score: number;
          created_at: string | null;
          game_duration: number | null;
        };
        Insert: {
          id?: string;
          player_id?: string | null;
          score?: number;
          created_at?: string | null;
          game_duration?: number | null;
        };
        Update: {
          id?: string;
          player_id?: string | null;
          score?: number;
          created_at?: string | null;
          game_duration?: number | null;
        };
      };
      players: {
        Row: {
          id: string;
          username: string;
          created_at: string | null;
          updated_at: string | null;
          game_id: string | null;
          team: string | null;
          actions_remaining: number | null;
          last_action_time: string | null;
          last_seen: string | null;
        };
        Insert: {
          id?: string;
          username: string;
          created_at?: string | null;
          updated_at?: string | null;
          game_id?: string | null;
          team?: string | null;
          actions_remaining?: number | null;
          last_action_time?: string | null;
          last_seen?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          created_at?: string | null;
          updated_at?: string | null;
          game_id?: string | null;
          team?: string | null;
          actions_remaining?: number | null;
          last_action_time?: string | null;
          last_seen?: string | null;
        };
      };
    };
  };
};