import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { GameState, Player, Tile, ChatMessage } from '../types/game';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    tiles: Array(100).fill(null).map((_, index) => ({
      id: index,
      ownedBy: null,
      claimedAt: null,
    })),
    players: [],
    chatMessages: [],
    gameStartTime: null,
    gameEndTime: null,
    isActive: false,
  });

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('game-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tiles' }, () => {
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
      // Fetch tiles
      const { data: tiles } = await supabase
        .from('tiles')
        .select('*')
        .order('id');

      // Fetch players
      const { data: players } = await supabase
        .from('players')
        .select('*');

      // Fetch game settings
      const { data: gameSettings } = await supabase
        .from('game_settings')
        .select('*')
        .single();

      if (tiles && players && gameSettings) {
        setGameState(prev => ({
          ...prev,
          tiles: tiles.map(tile => ({
            id: tile.id,
            ownedBy: tile.owned_by,
            claimedAt: tile.claimed_at ? new Date(tile.claimed_at) : null,
          })),
          players: players.map(player => ({
            id: player.id,
            name: player.name,
            team: player.team,
            actionsRemaining: player.actions_remaining,
            lastActionTime: player.last_action_time ? new Date(player.last_action_time) : null,
            isOnline: player.is_online,
          })),
          gameStartTime: gameSettings.start_time ? new Date(gameSettings.start_time) : null,
          gameEndTime: gameSettings.end_time ? new Date(gameSettings.end_time) : null,
          isActive: gameSettings.is_active,
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
        .select(`
          *,
          players (name, team)
        `)
        .order('created_at', { ascending: true })
        .limit(100);

      if (messages) {
        setGameState(prev => ({
          ...prev,
          chatMessages: messages.map(msg => ({
            id: msg.id,
            playerId: msg.player_id,
            playerName: msg.players?.name || 'Unknown',
            playerTeam: msg.players?.team || 'red',
            message: msg.message,
            timestamp: new Date(msg.created_at),
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

  const loginPlayer = useCallback(async (name: string, team: 'red' | 'blue') => {
    try {
      const { data, error } = await supabase
        .from('players')
        .upsert({
          name,
          team,
          actions_remaining: 3,
          is_online: true,
          last_action_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const player: Player = {
        id: data.id,
        name: data.name,
        team: data.team,
        actionsRemaining: data.actions_remaining,
        lastActionTime: data.last_action_time ? new Date(data.last_action_time) : null,
        isOnline: data.is_online,
      };

      setCurrentPlayer(player);
      return player;
    } catch (error) {
      console.error('Error logging in player:', error);
      throw error;
    }
  }, []);

  const claimTile = useCallback(async (tileId: number) => {
    if (!currentPlayer || currentPlayer.actionsRemaining <= 0) {
      throw new Error('No actions remaining');
    }

    try {
      // Update tile ownership
      const { error: tileError } = await supabase
        .from('tiles')
        .update({
          owned_by: currentPlayer.id,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', tileId);

      if (tileError) throw tileError;

      // Update player actions
      const { error: playerError } = await supabase
        .from('players')
        .update({
          actions_remaining: currentPlayer.actionsRemaining - 1,
          last_action_time: new Date().toISOString(),
        })
        .eq('id', currentPlayer.id);

      if (playerError) throw playerError;

      // Update local state
      setCurrentPlayer(prev => prev ? {
        ...prev,
        actionsRemaining: prev.actionsRemaining - 1,
        lastActionTime: new Date(),
      } : null);

    } catch (error) {
      console.error('Error claiming tile:', error);
      throw error;
    }
  }, [currentPlayer]);

  const sendChatMessage = useCallback(async (message: string) => {
    if (!currentPlayer) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          player_id: currentPlayer.id,
          message,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }, [currentPlayer]);

  const getTeamScores = useCallback(() => {
    const redScore = gameState.tiles.filter(tile => {
      const player = gameState.players.find(p => p.id === tile.ownedBy);
      return player?.team === 'red';
    }).length;

    const blueScore = gameState.tiles.filter(tile => {
      const player = gameState.players.find(p => p.id === tile.ownedBy);
      return player?.team === 'blue';
    }).length;

    return { red: redScore, blue: blueScore };
  }, [gameState.tiles, gameState.players]);

  const getTeamMembers = useCallback((team: 'red' | 'blue') => {
    return gameState.players.filter(player => player.team === team);
  }, [gameState.players]);

  const isGameActive = useCallback(() => {
    return gameState.isActive;
  }, [gameState.isActive]);

  const getTimeRemaining = useCallback(() => {
    if (!gameState.gameEndTime) return null;
    
    const now = new Date();
    const timeLeft = gameState.gameEndTime.getTime() - now.getTime();
    
    if (timeLeft <= 0) return null;
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  }, [gameState.gameEndTime]);

  const formatActionRefillTime = useCallback(() => {
    if (!currentPlayer?.lastActionTime) return null;
    
    const nextRefill = new Date(currentPlayer.lastActionTime.getTime() + 10 * 60 * 1000); // 10 minutes
    const now = new Date();
    const timeLeft = nextRefill.getTime() - now.getTime();
    
    if (timeLeft <= 0) return null;
    
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [currentPlayer?.lastActionTime]);

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