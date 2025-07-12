import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../types/game';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentPlayerTeam?: 'blue' | 'pink';
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, currentPlayerTeam }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTeamColor = (team: 'blue' | 'pink') => {
    return team === 'blue' ? 'text-blue-600' : 'text-pink-600';
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200 flex flex-col h-full">
      <div className="p-4 border-b border-pink-200">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-gray-800">Global Chat</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`font-medium text-sm ${getTeamColor(message.team)}`}>
                @{message.username}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(message.timestamp)}
              </span>
            </div>
            <p className="text-gray-800 text-sm bg-gray-50 rounded-lg px-3 py-2">
              {message.message}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-pink-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-sm"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              currentPlayerTeam === 'blue'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-pink-500 hover:bg-pink-600 text-white'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};