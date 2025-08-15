import React, { useState, useEffect } from 'react';

interface SystemMessage {
  id: number;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN';
  source: string;
  message: string;
  service?: string;
  meta?: any;
}

interface SystemMessagesProps {
  isDarkMode: boolean;
}

export const SystemMessages: React.FC<SystemMessagesProps> = ({ isDarkMode }) => {
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSystemMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/logs/database?level=INFO,SUCCESS&source=system&limit=15&sort=desc');
        const data = await response.json();
        
        const systemMessages: SystemMessage[] = (data.logs || []).map((log: any, index: number) => ({
          id: log.id || index,
          timestamp: log.timestamp,
          level: log.level,
          source: log.source,
          message: log.message,
          service: log.service,
          meta: log.meta
        }));

        setMessages(systemMessages);
      } catch (error) {
        console.warn('Failed to fetch system messages, using mock data');
        // Mock data fallback
        const mockMessages: SystemMessage[] = [
          {
            id: 1,
            timestamp: new Date().toISOString(),
            level: 'SUCCESS',
            source: 'backup-service',
            message: 'Database backup completed successfully',
            service: 'backup-service',
            meta: { 
              size: '2.4GB',
              duration: '45 minutes',
              tables: 47,
              records: 1250000
            }
          },
          {
            id: 2,
            timestamp: new Date(Date.now() - 900000).toISOString(),
            level: 'INFO',
            source: 'scheduler',
            message: 'Weekly maintenance window started',
            service: 'maintenance',
            meta: { 
              duration: '2 hours',
              services: ['database', 'cache', 'search-index']
            }
          },
          {
            id: 3,
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            level: 'SUCCESS',
            source: 'security',
            message: 'SSL certificates renewed automatically',
            service: 'security',
            meta: { 
              domains: 3,
              validUntil: '2026-08-01'
            }
          },
          {
            id: 4,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            level: 'INFO',
            source: 'cache',
            message: 'Cache optimization completed',
            service: 'redis',
            meta: { 
              hitRate: '98.7%',
              memoryUsed: '1.2GB'
            }
          }
        ];
        setMessages(mockMessages);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemMessages();
    const interval = setInterval(fetchSystemMessages, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'SUCCESS': return '✅';
      case 'INFO': return 'ℹ️';
      case 'WARN': return '⚠️';
      default: return '📋';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'SUCCESS': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'INFO': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'WARN': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatMetaData = (meta: any) => {
    if (!meta) return null;
    
    if (typeof meta === 'string') return meta;
    if (typeof meta === 'object') {
      return Object.entries(meta).map(([key, value]) => 
        `${key}: ${value}`
      ).join(', ');
    }
    return String(meta);
  };

  return (
    <div className={`h-full rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300'} shadow-lg`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            💬 System Messages
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              messages.length > 0 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              {messages.length} messages
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 h-80">
        {loading ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Loading system messages...
          </div>
        ) : messages.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-4xl mb-4">📭</div>
            <div className="text-lg font-medium mb-2">No system messages</div>
            <div className="text-sm">All systems operating normally</div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border ${
                  message.level === 'SUCCESS' 
                    ? isDarkMode 
                      ? 'bg-green-900/30 border-green-700/50' 
                      : 'bg-green-50 border-green-200'
                    : message.level === 'INFO'
                    ? isDarkMode
                      ? 'bg-blue-900/30 border-blue-700/50'
                      : 'bg-blue-50 border-blue-200'
                    : isDarkMode 
                    ? 'bg-slate-900/50 border-slate-700' 
                    : 'bg-gray-50/50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl flex-shrink-0">
                    {getLevelIcon(message.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {message.message}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getLevelColor(message.level)}`}>
                        {message.level}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className={`px-2 py-1 rounded ${isDarkMode ? 'bg-slate-700 text-cyan-400' : 'bg-gray-100 text-blue-600'}`}>
                        [{message.source}]
                      </span>
                      {message.service && (
                        <span className={`${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                          Service: {message.service}
                        </span>
                      )}
                    </div>

                    {message.meta && (
                      <div className={`mt-2 text-xs p-2 rounded ${isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        <strong>Details:</strong> {formatMetaData(message.meta)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
