import React, { useState, useEffect } from 'react';

interface HistoricalLog {
  id: number;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';
  source: string;
  message: string;
  service?: string;
  user_email?: string;
  occurrence_count?: number;
  meta?: any;
  expanded?: boolean;
}

interface HistoricalLogsProps {
  isDarkMode: boolean;
}

type TimeFilter = 'yesterday' | 'today' | '24h' | 'week' | 'month';

export const HistoricalLogs: React.FC<HistoricalLogsProps> = ({ isDarkMode }) => {
  const [logs, setLogs] = useState<HistoricalLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('yesterday');
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  const getDateRange = (filter: TimeFilter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday,
          end: today
        };
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        };
      case '24h':
        return {
          start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          end: now
        };
      case 'week':
        return {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now
        };
      case 'month':
        return {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now
        };
      default:
        return { start: today, end: now };
    }
  };

  useEffect(() => {
    const fetchHistoricalLogs = async () => {
      setLoading(true);
      try {
        const { start, end } = getDateRange(timeFilter);
        const startDate = start.toISOString();
        const endDate = end.toISOString();
        
        const response = await fetch(
          `/api/logs/database?start_date=${startDate}&end_date=${endDate}&limit=50&sort=desc&group_similar=true`
        );
        const data = await response.json();
        
        const historicalLogs: HistoricalLog[] = (data.logs || []).map((log: any, index: number) => ({
          id: log.id || index,
          timestamp: log.latest_timestamp || log.timestamp,
          level: log.level,
          source: log.source,
          message: log.message,
          service: log.service,
          user_email: log.user_email,
          occurrence_count: log.occurrence_count || 1,
          meta: log.meta,
          expanded: false
        }));

        setLogs(historicalLogs);
      } catch (error) {
        console.warn('Failed to fetch historical logs, using mock data');
        // Mock data fallback
        const mockLogs: HistoricalLog[] = [
          {
            id: 1,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            level: 'ERROR',
            source: 'backend',
            message: 'Database connection timeout',
            service: 'api-gateway',
            occurrence_count: 27,
            meta: { error: 'Connection timeout after 30s', query: 'SELECT * FROM users' }
          },
          {
            id: 2,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            level: 'WARN',
            source: 'frontend',
            message: 'API response time exceeded threshold',
            service: 'web-client',
            occurrence_count: 15,
            meta: { responseTime: 2.3, endpoint: '/api/users', threshold: 2.0 }
          },
          {
            id: 3,
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            level: 'INFO',
            source: 'backend',
            message: 'User session expired',
            service: 'auth-service',
            occurrence_count: 8,
            meta: { sessionId: 'sess_123', userId: 456 }
          },
          {
            id: 4,
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            level: 'ERROR',
            source: 'backend',
            message: 'Payment processing failed',
            service: 'payment-gateway',
            occurrence_count: 3,
            meta: { orderId: 'ord_789', error: 'Card declined', amount: 99.99 }
          }
        ];
        setLogs(mockLogs);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalLogs();
  }, [timeFilter]);

  const toggleLogExpansion = (logId: number) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'WARN': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'SUCCESS': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'INFO': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'backend': return 'text-cyan-400 bg-cyan-500/20';
      case 'frontend': return 'text-purple-400 bg-purple-500/20';
      case 'dev': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatMetaData = (meta: any) => {
    if (!meta) return null;
    
    if (typeof meta === 'string') return meta;
    if (typeof meta === 'object') {
      return JSON.stringify(meta, null, 2);
    }
    return String(meta);
  };

  const getTimeFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case 'yesterday': return 'Yesterday';
      case 'today': return 'Today';
      case '24h': return 'Last 24h';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'Yesterday';
    }
  };

  return (
    <div className={`h-full rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300'} shadow-lg`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Historical Logs
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className={`px-3 py-1 rounded text-sm border ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="yesterday">Yesterday</option>
              <option value="today">Today</option>
              <option value="24h">Last 24h</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              logs.length > 0 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              {logs.length} entries
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 h-80">
        {loading ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Loading historical logs...
          </div>
        ) : logs.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-4xl mb-4">📈</div>
            <div className="text-lg font-medium mb-2">No logs found</div>
            <div className="text-sm">No entries for {getTimeFilterLabel(timeFilter).toLowerCase()}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const isExpanded = expandedLogs.has(log.id);
              return (
                <div
                  key={log.id}
                  className={`rounded-lg border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50/50 border-gray-200'}`}
                >
                  <div 
                    className="p-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => toggleLogExpansion(log.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getLevelColor(log.level)}`}>
                            {log.level}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSourceColor(log.source)}`}>
                            [{log.source}]
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatTimestamp(log.timestamp)}
                          </span>
                          {log.occurrence_count && log.occurrence_count > 1 && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                            }`}>
                              Occurred {log.occurrence_count} times
                            </span>
                          )}
                        </div>
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {log.message}
                        </div>
                        {log.service && (
                          <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Service: {log.service}
                          </div>
                        )}
                      </div>
                      <div className={`ml-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {isExpanded ? '▼' : '▶'}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && log.meta && (
                    <div className={`px-4 pb-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <div className={`mt-3 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <strong>Details:</strong>
                      </div>
                      <pre className={`mt-2 p-3 rounded text-xs overflow-x-auto ${
                        isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {formatMetaData(log.meta)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
