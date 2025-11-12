import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TaskList = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  list_id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};
