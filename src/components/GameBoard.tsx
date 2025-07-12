import React, { useCallback, useState } from 'react';
import { GameTile } from '../types/game';

interface GameBoardProps {
  tiles: Record<string, GameTile>;
  onTileClick: (x: number, y: number) => boolean;
  currentPlayerTeam?: 'blue' | 'pink';
  isGameActive: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  tiles,
  onTileClick,
  currentPlayerTeam,
  isGameActive,
}) => {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);

  const getTileColor = useCallback((x: number, y: number, isHovered: boolean) => {
    const tileKey = `${x}-${y}`;
    const tile = tiles[tileKey];

    if (tile?.owner === 'blue') {
      return isHovered ? 'bg-blue-600' : 'bg-blue-500';
    }
    if (tile?.owner === 'pink') {
      return isHovered ? 'bg-pink-600' : 'bg-pink-500';
    }

    if (isHovered && isGameActive) {
      return currentPlayerTeam === 'blue' ? 'bg-blue-200' : 'bg-pink-200';
    }

    return 'bg-gray-100 hover:bg-gray-200';
  }, [tiles, currentPlayerTeam, isGameActive]);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!isGameActive) return;
    onTileClick(x, y);
  }, [onTileClick, isGameActive]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-pink-200">
      <div className="grid grid-cols-20 gap-px bg-gray-300 rounded-lg overflow-hidden" style={{ aspectRatio: '1' }}>
        {Array.from({ length: 100 }, (_, y) =>
          Array.from({ length: 100 }, (_, x) => {
            const tileKey = `${x}-${y}`;
            const isHovered = hoveredTile === tileKey;
            return (
              <div
                key={tileKey}
                className={`aspect-square cursor-pointer transition-colors duration-150 ${getTileColor(x, y, isHovered)}`}
                onClick={() => handleTileClick(x, y)}
                onMouseEnter={() => setHoveredTile(tileKey)}
                onMouseLeave={() => setHoveredTile(null)}
                title={`Tile (${x}, ${y})`}
              />
            );
          })
        )}
      </div>
    </div>
  );
};