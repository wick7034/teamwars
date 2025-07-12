import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-pink-200 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <span>Proof of love</span>
          <Heart className="w-4 h-4 text-pink-500 fill-current" />
          <a
            href="https://x.com/arpanberwal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
          >
            @arpanberwal
          </a>
        </div>
      </div>
    </footer>
  );
};