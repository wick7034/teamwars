export interface Player {
  id: string;
  username: string;
  team: 'blue' | 'pink';
  actionsRemaining: number;
  lastActionTime: number;
  lastSeen: number;
}

export interface GameTile {
  x: number;
  y: number;
  owner: 'blue' | 'pink' | null;
  claimedAt?: number;
  claimedBy?: string;
}

export interface ChatMessage {
  id: string;
  username: string;
  team: 'blue' | 'pink';
  message: string;
  timestamp: number;
}

export interface GameState {
  tiles: Record<string, GameTile>;
  players: Record<string, Player>;
  chat: ChatMessage[];
  gameEndTime: number;
  gameStartTime: number;
  gameId: string;
}