
  # AI Agent Hub Database Schema

  1. New Tables
    - `agents`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `category` (text)
      - `example_input` (jsonb)
      - `example_output` (jsonb)
      - `webhook_url` (text, not null)
      - `embedding` (vector(768))
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamp)
    
    - `agent_usage_logs`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, references agents)
      - `user_id` (uuid, references auth.users)
      - `input_data` (jsonb)
      - `output_data` (jsonb)
      - `created_at` (timestamp)
    
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `agent_id` (uuid, references agents)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable vector extension
create extension if not exists vector;

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  example_input jsonb,
  example_output jsonb,
  webhook_url text NOT NULL,
  embedding vector(768),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create agent usage logs table
CREATE TABLE IF NOT EXISTS agent_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id),
  user_id uuid REFERENCES auth.users(id),
  input_data jsonb,
  output_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  agent_id uuid REFERENCES agents(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Agents policies (public read, authenticated create)
CREATE POLICY "Anyone can read agents"
  ON agents
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create agents"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own agents"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Usage logs policies
CREATE POLICY "Users can read their own usage logs"
  ON agent_usage_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create usage logs"
  ON agent_usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can manage their own favorites"
  ON favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS agents_category_idx ON agents(category);
CREATE INDEX IF NOT EXISTS agents_created_by_idx ON agents(created_by);
CREATE INDEX IF NOT EXISTS agents_embedding_idx ON agents USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS usage_logs_user_id_idx ON agent_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS usage_logs_agent_id_idx ON agent_usage_logs(agent_id);
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);

-- Insert sample agents for demo
INSERT INTO agents (name, description, category, example_input, example_output, webhook_url) VALUES 
('Text Summarizer', 'Summarizes long text content into concise key points', 'Text Processing', 
 '{"text": "This is a very long article about artificial intelligence..."}',
 '{"summary": "Key points: 1. AI is transforming industries 2. Machine learning drives innovation 3. Future looks promising"}',
 'https://example-n8n.com/webhook/text-summarizer'),

('Email Generator', 'Generates professional emails based on context and tone', 'Content Creation',
 '{"context": "Follow up meeting", "tone": "professional", "recipient": "client"}',
 '{"email": "Subject: Follow-up on Our Meeting\n\nDear Client,\n\nI hope this email finds you well..."}',
 'https://example-n8n.com/webhook/email-generator'),

('Data Validator', 'Validates and cleans CSV data according to specified rules', 'Data Processing',
 '{"csv_data": "name,email,age\nJohn,john@email,25\nJane,invalid-email,thirty"}',
 '{"valid_rows": 1, "errors": ["Invalid email format", "Invalid age format"], "cleaned_data": "..."}',
 'https://example-n8n.com/webhook/data-validator'),

('Image Analyzer', 'Analyzes images and provides detailed descriptions and insights', 'AI Vision',
 '{"image_url": "https://example.com/image.jpg", "analysis_type": "detailed"}',
 '{"description": "A modern office space with natural lighting...", "objects": ["desk", "computer", "plants"]}',
 'https://example-n8n.com/webhook/image-analyzer'),

('Code Reviewer', 'Reviews code for best practices, bugs, and improvements', 'Development',
 '{"code": "function add(a, b) { return a + b; }", "language": "javascript"}',
 '{"score": 8, "issues": [], "suggestions": ["Add type checking", "Consider using const"]}',
 'https://example-n8n.com/webhook/code-reviewer');