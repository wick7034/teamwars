/*
  # Add Game Tables for Universal Storage

  1. New Tables
    - `game_tiles`
      - `id` (uuid, primary key)
      - `x` (integer, tile x coordinate)
      - `y` (integer, tile y coordinate)
      - `owner` (text, team that owns the tile)
      - `claimed_at` (timestamp)
      - `claimed_by` (text, username who claimed it)
    - `chat_messages`
      - `id` (uuid, primary key)
      - `username` (text, player username)
      - `team` (text, player team)
      - `message` (text, chat message)
      - `timestamp` (timestamp)
    - `games`
      - `id` (text, primary key)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `status` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read/write access

  3. Indexes
    - Add indexes for performance optimization
*/

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id text PRIMARY KEY,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz DEFAULT (now() + interval '72 hours'),
  status text DEFAULT 'active'
);

-- Create game_tiles table
CREATE TABLE IF NOT EXISTS game_tiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  x integer NOT NULL,
  y integer NOT NULL,
  owner text CHECK (owner IN ('blue', 'pink')),
  claimed_at timestamptz DEFAULT now(),
  claimed_by text NOT NULL,
  game_id text DEFAULT 'game-2025-01' REFERENCES games(id),
  UNIQUE(x, y, game_id)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  team text NOT NULL CHECK (team IN ('blue', 'pink')),
  message text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  game_id text DEFAULT 'game-2025-01' REFERENCES games(id)
);

-- Add game_id to players table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'game_id'
  ) THEN
    ALTER TABLE players ADD COLUMN game_id text DEFAULT 'game-2025-01';
  END IF;
END $$;

-- Add team to players table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'team'
  ) THEN
    ALTER TABLE players ADD COLUMN team text CHECK (team IN ('blue', 'pink'));
  END IF;
END $$;

-- Add actions_remaining to players table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'actions_remaining'
  ) THEN
    ALTER TABLE players ADD COLUMN actions_remaining integer DEFAULT 5;
  END IF;
END $$;

-- Add last_action_time to players table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'last_action_time'
  ) THEN
    ALTER TABLE players ADD COLUMN last_action_time timestamptz DEFAULT now();
  END IF;
END $$;

-- Add last_seen to players table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE players ADD COLUMN last_seen timestamptz DEFAULT now();
  END IF;
END $$;

-- Insert default game if it doesn't exist
INSERT INTO games (id, start_time, end_time, status)
VALUES ('game-2025-01', now(), now() + interval '72 hours', 'active')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_tiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for games
CREATE POLICY "Anyone can read games"
  ON games
  FOR SELECT
  TO public
  USING (true);

-- Create policies for game_tiles
CREATE POLICY "Anyone can read tiles"
  ON game_tiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert tiles"
  ON game_tiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update tiles"
  ON game_tiles
  FOR UPDATE
  TO public
  USING (true);

-- Create policies for chat_messages
CREATE POLICY "Anyone can read chat"
  ON chat_messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert chat"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_tiles_coords ON game_tiles(x, y, game_id);
CREATE INDEX IF NOT EXISTS idx_game_tiles_owner ON game_tiles(owner, game_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp DESC, game_id);
CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team, game_id);