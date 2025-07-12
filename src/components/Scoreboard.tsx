import React from 'react';
import { Trophy, Clock, Zap, Timer } from 'lucide-react';

interface ScoreboardProps {
  blueScore: number;
  pinkScore: number;
  timeRemaining: number;
  actionsRemaining: number;
  currentPlayerTeam?: 'blue' | 'pink';
  actionRefillTime?: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  blueScore,
  pinkScore,
  timeRemaining,
  actionsRemaining,
  currentPlayerTeam,
  actionRefillTime,
}) => {
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const totalTiles = blueScore + pinkScore;
  const bluePercentage = totalTiles > 0 ? (blueScore / totalTiles) * 100 : 50;
  const pinkPercentage = totalTiles > 0 ? (pinkScore / totalTiles) * 100 : 50;

  const isBlueWinning = blueScore > pinkScore;
  const isPinkWinning = pinkScore > blueScore;

  return (
    <div className="space-y-4">
      {/* Timer */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-pink-200">
        <div className="flex items-center justify-center space-x-2">
          <Clock className="w-5 h-5 text-pink-600" />
          <div className="text-center">
            <p className="text-sm text-gray-600">Time Remaining</p>
            <p className="text-xl font-bold text-gray-800">
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions Remaining */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-pink-200">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <div className="text-center">
            <p className="text-sm text-gray-600">Actions Remaining</p>
            <p className="text-xl font-bold text-gray-800">
              {actionsRemaining} / 5
            </p>
          </div>
        </div>
        {actionRefillTime && actionsRemaining < 2 && (
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
            <Timer className="w-4 h-4" />
            <span>Next action in {actionRefillTime}</span>
          </div>
        )}
      </div>

      {/* Scores */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-pink-200">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-800">Scoreboard</h3>
        </div>

        <div className="space-y-4">
          {/* Blue Team */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-700">Team Blue</span>
                {isBlueWinning && <Trophy className="w-4 h-4 text-yellow-500" />}
              </div>
              <span className="font-bold text-blue-700">{blueScore}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${bluePercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Pink Team */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
                <span className="font-medium text-pink-700">Team Pink</span>
                {isPinkWinning && <Trophy className="w-4 h-4 text-yellow-500" />}
              </div>
              <span className="font-bold text-pink-700">{pinkScore}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${pinkPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Player Team Indicator */}
        {currentPlayerTeam && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">You are on</p>
            <p className={`font-bold ${currentPlayerTeam === 'blue' ? 'text-blue-700' : 'text-pink-700'}`}>
              Team {currentPlayerTeam.charAt(0).toUpperCase() + currentPlayerTeam.slice(1)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};