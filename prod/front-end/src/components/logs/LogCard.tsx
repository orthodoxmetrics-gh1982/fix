import React from 'react';

interface LogCardProps {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';
  source: 'frontend' | 'backend' | 'dev';
  message: string;
  service?: string;
  meta?: any;
}

export const LogCard: React.FC<LogCardProps> = ({
  timestamp,
  level,
  source,
  message,
  service,
  meta
}) => {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-400 bg-red-900/20 border-red-700/50';
      case 'WARN':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/50';
      case 'SUCCESS':
        return 'text-green-400 bg-green-900/20 border-green-700/50';
      case 'INFO':
        return 'text-blue-400 bg-blue-900/20 border-blue-700/50';
      case 'DEBUG':
        return 'text-gray-400 bg-gray-900/20 border-gray-700/50';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-700/50';
    }
  };

  const getSourceStyles = (source: string) => {
    switch (source) {
      case 'frontend':
        return 'text-green-400';
      case 'backend':
        return 'text-purple-400';
      case 'dev':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="log-entry flex items-start space-x-3 text-gray-300 hover:bg-gray-800/50 p-1 rounded">
      {/* Timestamp */}
      <span className="text-gray-500 text-xs w-20 flex-shrink-0 font-mono">
        {formatTimestamp(timestamp)}
      </span>
      
      {/* Level Badge */}
      <span className={`px-2 py-0.5 rounded text-xs font-medium border w-16 flex-shrink-0 text-center ${getLevelStyles(level)}`}>
        {level}
      </span>
      
      {/* Source */}
      <span className={`text-xs w-16 flex-shrink-0 font-mono ${getSourceStyles(source)}`}>
        [{source}]
      </span>
      
      {/* Message */}
      <div className="flex-1 text-gray-300">
        <div className="text-sm font-mono leading-relaxed">
          {message}
        </div>
        
        {/* Service Info */}
        {service && (
          <div className="text-xs text-gray-400 mt-1">
            Service: <span className="font-medium">{service}</span>
          </div>
        )}
        
        {/* Meta Data */}
        {meta && (
          <div className="text-xs text-gray-500 mt-1">
            <details className="cursor-pointer">
              <summary className="text-gray-400 hover:text-gray-300">Details</summary>
              <pre className="mt-1 p-2 bg-gray-800/50 rounded text-xs overflow-x-auto">
                {JSON.stringify(meta, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogCard;