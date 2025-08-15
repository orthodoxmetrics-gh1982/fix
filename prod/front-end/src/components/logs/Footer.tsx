import React, { useState, useEffect } from 'react';

interface FooterProps {
  isLive: boolean;
  activeFilters: number;
}

export const Footer: React.FC<FooterProps> = ({ isLive, activeFilters }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <footer className="border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between text-sm font-mono">
          {/* Left: Status and Filters */}
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span className={isLive ? 'text-green-500' : 'text-yellow-500'}>
                Status: {isLive ? 'Live' : 'Paused'}
              </span>
            </span>
            <span className="text-gray-300">
              Active Filters: <span className="font-medium">{activeFilters}</span>
            </span>
          </div>
          
          {/* Right: Branding and Time */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">
              {window.location.hostname}
            </span>
            <span className="text-gray-400">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;