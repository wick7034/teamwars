import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { GameState, Player, Tile, ChatMessage } from '../types/game';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    tiles: {},
    players: {},
    chatMessages: [],
    gameStartTime: Date.now(),
    gameEndTime: Date.now() + (72 * 60 * 60 * 1000), // 72 hours from now
    gameId: 'game-2025-01',
  });

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('game-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_tiles' }, () => {
        fetchGameState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        fetchGameState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        fetchChatMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchGameState = useCallback(async () => {
    try {
      // Fetch game tiles
      const { data: gameTiles } = await supabase
        .from('game_tiles')
        .select('*')
        .eq('game_id', 'game-2025-01');

      // Fetch players
      const { data: players } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', 'game-2025-01');

      // Fetch game info
      const { data: games } = await supabase
        .from('games')
        .select('*')
        .eq('id', 'game-2025-01')
        .single();

      if (players) {
        setGameState(prev => ({
          ...prev,
          tiles: gameTiles ? gameTiles.reduce((acc, tile) => {
            acc[`${tile.x}-${tile.y}`] = {
              x: tile.x,
              y: tile.y,
              owner: tile.owner as 'blue' | 'pink' | null,
              claimedAt: tile.claimed_at ? new Date(tile.claimed_at).getTime() : undefined,
              claimedBy: tile.claimed_by,
            };
            return acc;
          }, {} as Record<string, GameTile>) : {},
          players: players.reduce((acc, player) => {
            acc[player.id] = {
              id: player.id,
              username: player.username,
              team: player.team,
              actionsRemaining: player.actions_remaining,
              lastActionTime: player.last_action_time ? new Date(player.last_action_time).getTime() : Date.now(),
              lastSeen: player.last_seen ? new Date(player.last_seen).getTime() : Date.now(),
            };
            return acc;
          }, {} as Record<string, Player>),
          gameStartTime: games?.start_time ? new Date(games.start_time).getTime() : Date.now(),
          gameEndTime: games?.end_time ? new Date(games.end_time).getTime() : Date.now() + (72 * 60 * 60 * 1000),
        }));
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  }, []);

  const fetchChatMessages = useCallback(async () => {
    try {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('id, username, team, message, timestamp')
        .eq('game_id', 'game-2025-01')
        .order('timestamp', { ascending: true })
        .limit(100);

      if (messages) {
        setGameState(prev => ({
          ...prev,
          chatMessages: messages.map(msg => ({
            id: msg.id,
            username: msg.username,
            team: msg.team,
            message: msg.message,
            timestamp: new Date(msg.timestamp).getTime(),
          })),
        }));
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchGameState();
    fetchChatMessages();
  }, [fetchGameState, fetchChatMessages]);

  const loginPlayer = useCallback(async (username: string, team: 'blue' | 'pink') => {
    try {
      const { data, error } = await supabase
        .from('players')
        .upsert({
          username,
          team,
          actions_remaining: 5,
          last_action_time: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          game_id: 'game-2025-01',
        })
        .select()
        .single();

      if (error) throw error;

      const player: Player = {
        id: data.id,
        username: data.username,
        team: data.team,
        actionsRemaining: data.actions_remaining,
        lastActionTime: data.last_action_time ? new Date(data.last_action_time).getTime() : Date.now(),
        lastSeen: data.last_seen ? new Date(data.last_seen).getTime() : Date.now(),
      };

      setCurrentPlayer(player);
      
      // Add player to game state
      setGameState(prev => ({
        ...prev,
        players: {
          ...prev.players,
          [player.id]: player,
        },
      }));
      
      return player;
    } catch (error) {
      console.error('Error logging in player:', error);
      throw error;
    }
  }, []);

  const claimTile = useCallback(async (x: number, y: number) => {
    if (!currentPlayer || currentPlayer.actionsRemaining <= 0) {
      return false;
    }

    try {
      // Insert or update tile ownership
      const { error: tileError } = await supabase
        .from('game_tiles')
        .upsert({
          x,
          y,
          owner: currentPlayer.team,
          claimed_at: new Date().toISOString(),
          claimed_by: currentPlayer.username,
          game_id: 'game-2025-01',
        })
        .eq('x', x)
        .eq('y', y)
        .eq('game_id', 'game-2025-01');

      if (tileError) throw tileError;

      // Update player actions
      const { error: playerError } = await supabase
        .from('players')
        .update({
          actions_remaining: currentPlayer.actionsRemaining - 1,
          last_action_time: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        })
        .eq('id', currentPlayer.id);

      if (playerError) throw playerError;

      // Update local state
      setCurrentPlayer(prev => prev ? {
        ...prev,
        actionsRemaining: prev.actionsRemaining - 1,
        lastActionTime: Date.now(),
        lastSeen: Date.now(),
      } : null);

      // Update game state
      setGameState(prev => ({
        ...prev,
        tiles: {
          ...prev.tiles,
          [`${x}-${y}`]: {
            x,
            y,
            owner: currentPlayer.team,
            claimedAt: Date.now(),
            claimedBy: currentPlayer.username,
          },
        },
        players: {
          ...prev.players,
          [currentPlayer.id]: {
            ...prev.players[currentPlayer.id],
            actionsRemaining: currentPlayer.actionsRemaining - 1,
            lastActionTime: Date.now(),
            lastSeen: Date.now(),
          },
        },
      }));

      return true;
    } catch (error) {
      console.error('Error claiming tile:', error);
      return false;
    }
  }, [currentPlayer]);

  const sendChatMessage = useCallback(async (message: string) => {
    if (!currentPlayer) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          username: currentPlayer.username,
          team: currentPlayer.team,
          message,
          game_id: 'game-2025-01',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  }, [currentPlayer]);

  const getTeamScores = useCallback(() => {
    const tiles = Object.values(gameState.tiles);
    const blueScore = tiles.filter(tile => tile.owner === 'blue').length;
    const pinkScore = tiles.filter(tile => tile.owner === 'pink').length;

    return { blue: blueScore, pink: pinkScore };
  }, [gameState.tiles]);

  const getTeamMembers = useCallback((team: 'blue' | 'pink') => {
    return Object.values(gameState.players).filter(player => player.team === team);
  }, [gameState.players]);

  const isGameActive = useCallback(() => {
    const now = Date.now();
    return now < gameState.gameEndTime;
  }, [gameState.gameEndTime]);

  const getTimeRemaining = useCallback(() => {
    const now = Date.now();
    const timeLeft = gameState.gameEndTime - now;
    
    if (timeLeft <= 0) return null;
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  }, [gameState.gameEndTime]);

  const formatActionRefillTime = useCallback(() => {
    if (!currentPlayer?.lastActionTime || currentPlayer.actionsRemaining >= 5) return null;
    
    const nextRefill = currentPlayer.lastActionTime + (12 * 60 * 1000); // 12 minutes (5 actions per hour)
    const now = Date.now();
    const timeLeft = nextRefill - now;
    
    if (timeLeft <= 0) return null;
    
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [currentPlayer?.lastActionTime, currentPlayer?.actionsRemaining]);

  return {
    gameState,
    currentPlayer,
    loginPlayer,
    claimTile,
    sendChatMessage,
    getTeamScores,
    getTeamMembers,
    isGameActive,
    getTimeRemaining,
    formatActionRefillTime,
  };
};