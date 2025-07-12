import React from 'react';
import { useGameState } from './hooks/useGameState';
import { AuthModal } from './components/AuthModal';
import { GameBoard } from './components/GameBoard';
import { Chat } from './components/Chat';
import { Scoreboard } from './components/Scoreboard';
import { TeamMembers } from './components/TeamMembers';
import { Footer } from './components/Footer';
import { Gamepad2, Users } from 'lucide-react';

function App() {
  const {
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
  } = useGameState();

  const scores = getTeamScores();
  const timeRemaining = getTimeRemaining();
  const gameActive = isGameActive();
  const teamMembers = currentPlayer ? getTeamMembers(currentPlayer.team) : [];
  const actionRefillTime = formatActionRefillTime();

  const handlePingPlayer = (username: string) => {
    const tweetText = `Hey @${username}! Join me in Succinct Team Wars - let's dominate the grid together! 🎮⚔️ #SuccinctTeamWars`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  };

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
        <AuthModal onLogin={loginPlayer} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Succinct Team Wars
                </h1>
                <p className="text-sm text-gray-600">
                  {gameActive ? 'Battle in progress' : 'Game ended'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">{Object.keys(gameState.players).length} players</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className={`font-medium ${currentPlayer.team === 'blue' ? 'text-blue-600' : 'text-pink-600'}`}>
                  @{currentPlayer.username}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Battlefield</h2>
              <p className="text-gray-600 text-sm">
                Click tiles to claim them for your team. You have {currentPlayer.actionsRemaining} actions remaining.
              </p>
            </div>
            <GameBoard
              tiles={gameState.tiles}
              onTileClick={claimTile}
              currentPlayerTeam={currentPlayer.team}
              isGameActive={gameActive}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Scoreboard
              blueScore={scores.blue}
              pinkScore={scores.pink}
              timeRemaining={timeRemaining}
              actionsRemaining={currentPlayer.actionsRemaining}
              currentPlayerTeam={currentPlayer.team}
              actionRefillTime={actionRefillTime}
            />

            <TeamMembers
              teamMembers={teamMembers}
              currentPlayerTeam={currentPlayer.team}
              onPingPlayer={handlePingPlayer}
            />

            <div className="h-96">
              <Chat
                messages={gameState.chat}
                onSendMessage={sendChatMessage}
                currentPlayerTeam={currentPlayer.team}
              />
            </div>
          </div>
        </div>

        {/* Game End Notice */}
        {!gameActive && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border border-pink-200 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Game Over!</h2>
                <p className="text-gray-600">The 72-hour battle has ended</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Final Scores</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-600 font-medium">Team Blue</span>
                    <span className="font-bold">{scores.blue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-600 font-medium">Team Pink</span>
                    <span className="font-bold">{scores.pink}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  {scores.blue > scores.pink ? (
                    <p className="text-xl font-bold text-blue-600">🎉 Team Blue Wins!</p>
                  ) : scores.pink > scores.blue ? (
                    <p className="text-xl font-bold text-pink-600">🎉 Team Pink Wins!</p>
                  ) : (
                    <p className="text-xl font-bold text-gray-600">🤝 It's a Tie!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;