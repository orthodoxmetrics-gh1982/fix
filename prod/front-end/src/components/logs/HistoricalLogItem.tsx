import React from 'react';

interface HistoricalLogItemProps {
  level: 'INFO' | 'WARN' | 'ERROR';
  source: 'frontend' | 'backend' | 'dev';
  description: string;
  firstOccurrence: Date;
  occurrences: number;
  details: string[];
  expanded: boolean;
  onToggleExpand: () => void;
}

export const HistoricalLogItem: React.FC<HistoricalLogItemProps> = ({
  level,
  source,
  description,
  firstOccurrence,
  occurrences,
  details,
  expanded,
  onToggleExpand
}) => {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'ERROR':
        return {
          badge: 'text-red-400 bg-red-900/20 border-red-700/50',
          text: 'text-red-400'
        };
      case 'WARN':
        return {
          badge: 'text-yellow-400 bg-yellow-900/20 border-yellow-700/50',
          text: 'text-yellow-400'
        };
      case 'INFO':
        return {
          badge: 'text-blue-400 bg-blue-900/20 border-blue-700/50',
          text: 'text-blue-400'
        };
      default:
        return {
          badge: 'text-gray-400 bg-gray-900/20 border-gray-700/50',
          text: 'text-gray-400'
        };
    }
  };

  const getSourceColor = (source: string) => {
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

  const styles = getLevelStyles(level);

  return (
    <div className="rounded-lg border bg-gray-900/50 border-gray-700 transition-all duration-200 hover:shadow-lg">
      {/* Collapsible Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Badges and Meta */}
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles.badge}`}>
                {level}
              </span>
              <span className={`text-xs font-mono ${getSourceColor(source)}`}>
                [{source}]
              </span>
              <span className="text-xs text-gray-400">
                {formatTimestamp(firstOccurrence)}
              </span>
              {occurrences > 1 && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400">
                  Occurred {occurrences} times
                </span>
              )}
            </div>
            
            {/* Description */}
            <div className="font-medium text-white text-sm">
              {description}
            </div>
          </div>
          
          {/* Expand/Collapse Chevron */}
          <div className="ml-4 text-lg text-gray-400 transition-transform duration-200" 
               style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            ▶
          </div>
        </div>
      </div>
      
      {/* Collapsible Content */}
      {expanded && (
        <div className="border-t border-gray-700 p-4 bg-gray-800/30">
          <div className="space-y-3">
            <div className="text-xs text-gray-300 font-medium">
              Additional Details:
            </div>
            
            {details.length > 0 ? (
              <div className="space-y-2">
                {details.map((detail, index) => (
                  <div key={index} className="text-sm text-gray-400 p-2 bg-gray-900/50 rounded border-l-2 border-gray-600">
                    {detail}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No additional details available
              </div>
            )}
            
            {/* Occurrence Statistics */}
            <div className="pt-2 border-t border-gray-700/50">
              <div className="text-xs text-gray-400">
                <span className="font-medium">First seen:</span> {formatTimestamp(firstOccurrence)}
              </div>
              <div className="text-xs text-gray-400">
                <span className="font-medium">Total occurrences:</span> {occurrences}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalLogItem;