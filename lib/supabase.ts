import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kgcnbxghgzpkbhjldtxu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnY25ieGdoZ3pwa2JoamxkdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTQ4NDUsImV4cCI6MjA3MDQ3MDg0NX0.gHjSIIFk6fi5NFuQtG0jEXt3iqCdmQWLc6hlqzEw40A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Agent = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  workflow_json: any;
  example_input: any;
  example_output: any;
  webhook_url: string;
  created_by: string | null;
  created_at: string;
};

export type UsageLog = {
  id: string;
  agent_id: string;
  user_id: string;
  input_data: any;
  output_data: any;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  agent_id: string;
  created_at: string;
};