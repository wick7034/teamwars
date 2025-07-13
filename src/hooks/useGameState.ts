import { useState, useCallback } from 'react';

export interface GameState {
  currentPlayer: 'X' | 'O';
  board: (string | null)[];
  winner: string | null;
  gameOver: boolean;
  scores: {
    X: number;
    O: number;
    draws: number;
  };
}

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: 'X',
    board: Array(9).fill(null),
    winner: null,
    gameOver: false,
    scores: {
      X: 0,
      O: 0,
      draws: 0,
    },
  });

  const checkWinner = useCallback((board: (string | null)[]): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  }, []);

  const makeMove = useCallback((index: number) => {
    setGameState(prevState => {
      if (prevState.board[index] || prevState.gameOver) {
        return prevState;
      }

      const newBoard = [...prevState.board];
      newBoard[index] = prevState.currentPlayer;

      const winner = checkWinner(newBoard);
      const isDraw = !winner && newBoard.every(cell => cell !== null);
      const gameOver = winner !== null || isDraw;

      const newScores = { ...prevState.scores };
      if (winner) {
        newScores[winner as 'X' | 'O']++;
      } else if (isDraw) {
        newScores.draws++;
      }

      return {
        ...prevState,
        board: newBoard,
        currentPlayer: prevState.currentPlayer === 'X' ? 'O' : 'X',
        winner,
        gameOver,
        scores: newScores,
      };
    });
  }, [checkWinner]);

  const resetGame = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      currentPlayer: 'X',
      board: Array(9).fill(null),
      winner: null,
      gameOver: false,
    }));
  }, []);

  const resetScores = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      scores: {
        X: 0,
        O: 0,
        draws: 0,
      },
    }));
  }, []);

  return {
    gameState,
    makeMove,
    resetGame,
    resetScores,
  };
};