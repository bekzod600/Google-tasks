/*
  # Add due_date column to tasks

  1. Modified Tables
    - `tasks`
      - Added `due_date` (date, nullable) for task due dates

  2. Notes
    - due_date is optional to support existing tasks without due dates
    - Defaults to null
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE tasks ADD COLUMN due_date date DEFAULT NULL;
  END IF;
END $$;