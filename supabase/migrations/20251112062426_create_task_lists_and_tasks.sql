/*
  # Task Management Schema

  1. New Tables
    - `task_lists`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tasks`
      - `id` (uuid, primary key)
      - `list_id` (uuid, foreign key to task_lists)
      - `title` (text, required)
      - `completed` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (since no auth is required for this app)
    - Allow all operations (SELECT, INSERT, UPDATE, DELETE) for demonstration purposes

  3. Notes
    - This is a local-first app without authentication
    - All users share the same data
    - Timestamps track creation and modification times
*/

CREATE TABLE IF NOT EXISTS task_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to task_lists"
  ON task_lists FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to task_lists"
  ON task_lists FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to task_lists"
  ON task_lists FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to task_lists"
  ON task_lists FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to tasks"
  ON tasks FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to tasks"
  ON tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to tasks"
  ON tasks FOR DELETE
  USING (true);

INSERT INTO task_lists (name) VALUES ('My Tasks');

INSERT INTO tasks (list_id, title) 
SELECT id, 'Sample Task - Get started!' 
FROM task_lists 
WHERE name = 'My Tasks' 
LIMIT 1;