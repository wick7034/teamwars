import React, { useState } from 'react';
import { User, Users } from 'lucide-react';

interface AuthModalProps {
  onLogin: (username: string, team: 'blue' | 'pink') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<'blue' | 'pink'>('blue');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim(), selectedTeam);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border border-pink-200">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Join Team Wars
          </h2>
          <p className="text-gray-600 mt-2">Enter your X username and choose your team</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Your Team
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTeam('blue')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTeam === 'blue'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
                <span className="font-medium text-blue-700">Team Blue</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTeam('pink')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTeam === 'pink'
                    ? 'border-pink-500 bg-pink-50 shadow-lg'
                    : 'border-gray-200 hover:border-pink-300'
                }`}
              >
                <div className="w-8 h-8 bg-pink-500 rounded-full mx-auto mb-2"></div>
                <span className="font-medium text-pink-700">Team Pink</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-medium transition-all hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
};