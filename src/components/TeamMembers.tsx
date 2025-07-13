import React from 'react';
import { Users, MessageSquare, Clock } from 'lucide-react';
import { Player } from '../types/game';

interface TeamMembersProps {
  teamMembers: Player[];
  currentPlayerTeam: 'blue' | 'pink';
  onPingPlayer: (username: string) => void;
}

export const TeamMembers: React.FC<TeamMembersProps> = ({
  teamMembers,
  currentPlayerTeam,
  onPingPlayer,
}) => {
  const getLastSeenText = (lastSeen: number) => {
    const now = Date.now();
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const isOnline = (lastSeen: number) => {
    return Date.now() - lastSeen < 5 * 60 * 1000; // 5 minutes
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-pink-200">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-5 h-5 text-pink-600" />
        <h3 className="font-semibold text-gray-800">
          Team {currentPlayerTeam ? currentPlayerTeam.charAt(0).toUpperCase() + currentPlayerTeam.slice(1) : 'Members'}
        </h3>
        <span className="text-sm text-gray-500">({teamMembers.length})</span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {teamMembers.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No team members yet. Invite friends to join!
          </p>
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full ${
                    currentPlayerTeam === 'blue' ? 'bg-blue-500' : 'bg-pink-500'
                  }`}></div>
                  {isOnline(member.lastSeen) && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">@{member.username}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{getLastSeenText(member.lastSeen)}</span>
                    <span>•</span>
                    <span>{member.actionsRemaining}/5 actions</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => onPingPlayer(member.username)}
                className={`p-2 rounded-lg transition-colors ${
                  currentPlayerTeam === 'blue'
                    ? 'hover:bg-blue-100 text-blue-600'
                    : 'hover:bg-pink-100 text-pink-600'
                }`}
                title={`Ping @${member.username}`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};