import React, { useState, useEffect, useRef } from 'react';

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';
  source: string;
  message: string;
  service?: string;
  user_email?: string;
  meta?: any;
}

interface RealTimeLogsProps {
  isLive: boolean;
  autoScroll: boolean;
  onAutoScrollChange: (enabled: boolean) => void;
  isDarkMode: boolean;
}

export const RealTimeLogs: React.FC<RealTimeLogsProps> = ({
  isLive,
  autoScroll,
  onAutoScrollChange,
  isDarkMode
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logCount, setLogCount] = useState(10);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new logs arrive and auto-scroll is enabled
  useEffect(() => {
    if (autoScroll && isScrolledToBottom) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isScrolledToBottom]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
      setIsScrolledToBottom(isAtBottom);
    }
  };

  // Fetch real-time logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Use the backend server port (3002 for dev server)
        const apiUrl = process.env.NODE_ENV === 'production' 
          ? `/api/logs/database?limit=${logCount}&level=ALL&sort=desc`
          : `http://localhost:3002/api/logs/database?limit=${logCount}&level=ALL&sort=desc`;
        
        console.log('Fetching logs from:', apiUrl);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received log data:', data);
        
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
          console.log(`Loaded ${data.logs.length} logs from database`);
        } else {
          console.warn('Invalid data structure received:', data);
          setLogs([]);
        }
      } catch (error) {
        console.error('Failed to fetch logs from database:', error);
        
        // Only use mock data as absolute fallback when database is unavailable
        const mockLogs: LogEntry[] = [
          {
            id: 1,
            timestamp: new Date().toISOString(),
            level: 'INFO',
            source: 'backend',
            message: 'User authentication successful',
            service: 'auth-service',
            meta: { userId: 123 }
          },
          {
            id: 2,
            timestamp: new Date(Date.now() - 5000).toISOString(),
            level: 'WARN',
            source: 'frontend',
            message: 'API response time exceeded threshold',
            service: 'api-gateway',
            meta: { responseTime: 2.3 }
          },
          {
            id: 3,
            timestamp: new Date(Date.now() - 10000).toISOString(),
            level: 'ERROR',
            source: 'backend',
            message: 'Database connection failed',
            service: 'db-service',
            meta: { error: 'Connection timeout' }
          },
          {
            id: 4,
            timestamp: new Date(Date.now() - 15000).toISOString(),
            level: 'SUCCESS',
            source: 'frontend',
            message: 'Page load completed successfully',
            service: 'ui-service',
            meta: { loadTime: 1.2 }
          },
          {
            id: 5,
            timestamp: new Date(Date.now() - 20000).toISOString(),
            level: 'DEBUG',
            source: 'dev',
            message: 'Component mounted and initialized',
            service: 'logger-service',
            meta: { component: 'RealTimeLogs' }
          }
        ];
        setLogs(mockLogs);
        console.warn('Using mock data due to database connection failure');
      }
    };

    // Initial fetch
    fetchLogs();

    // Only setup WebSocket if isLive is true
    if (!isLive) return;

    // Setup WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NODE_ENV === 'production' 
      ? window.location.host 
      : 'localhost:3002';
    const wsUrl = `${protocol}//${wsHost}/ws/logs`;
    
    console.log('Attempting WebSocket connection to:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ Connected to log stream');
        // Send filter preferences
        ws.send(JSON.stringify({
          type: 'setFilters',
          filters: { limit: logCount }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'log') {
            setLogs(prev => {
              const newLogs = [data.log, ...prev];
              return newLogs.slice(0, logCount); // Keep only the latest logs
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('❌ Disconnected from log stream');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        console.log('Closing WebSocket connection');
        ws.close();
      };
    } catch (error) {
      console.warn('WebSocket not available, falling back to polling');
      // Fallback to polling every 2 seconds
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [isLive, logCount]);

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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`h-full rounded-xl border-0 shadow-xl overflow-hidden ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-white via-gray-50 to-white'
    }`}>
      {/* Compact Header */}
      <div className={`backdrop-blur-sm border-b ${
        isDarkMode 
          ? 'bg-slate-800/50 border-slate-700/50' 
          : 'bg-white/70 border-gray-200/50'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${
                isDarkMode 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Real-Time Logs
                </h3>
              </div>
              
              {/* Live Status Badge */}
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
                isLive 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-red-500/20 border border-red-500/30'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`} />
                <span className={`text-xs font-medium ${
                  isLive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isLive ? 'LIVE' : 'PAUSED'}
                </span>
              </div>
            </div>
            
            {/* Log Count Display - Fixed to "100 logs" as per Figma */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
              isDarkMode 
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                : 'bg-blue-100 text-blue-600 border-blue-300'
            }`}>
              100 logs
            </div>
          </div>

          {/* Compact Controls */}
          <div className="flex items-center gap-4">
            {/* Auto-scroll Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => onAutoScrollChange(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-8 h-4 rounded-full transition-all duration-200 ${
                  autoScroll 
                    ? 'bg-blue-500' 
                    : isDarkMode ? 'bg-slate-600' : 'bg-gray-300'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-all duration-200 transform ${
                    autoScroll ? 'translate-x-4' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </div>
              <span className={`text-xs ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Auto-scroll
              </span>
            </label>

            {/* Log Count Selector */}
            <div className="flex items-center gap-2">
              <span className={`text-xs ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Show:
              </span>
              <select
                value={logCount}
                onChange={(e) => setLogCount(Number(e.target.value))}
                className={`px-2 py-1 rounded text-xs border ${
                  isDarkMode 
                    ? 'bg-slate-700/50 border-slate-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Logs Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-2 dark-scrollbar"
        style={{ height: '300px' }}
      >
        {logs.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1">
              {isLive ? 'Waiting for logs...' : 'No logs available'}
            </p>
            <p className="text-xs">
              {isLive ? 'New entries will appear automatically' : 'Click refresh to load logs'}
            </p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={log.id}
              className={`group relative p-3 rounded-lg border transition-all duration-200 hover:scale-[1.01] ${
                isDarkMode 
                  ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60' 
                  : 'bg-white/80 border-gray-200/50 hover:bg-white'
              }`}
            >
              {/* Compact Log Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                    isDarkMode ? 'bg-slate-700/50 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${getSourceColor(log.source)}`}>
                    {log.source}
                  </span>
                </div>
                
                {/* Copy Action */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className={`p-1 rounded text-xs ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
                    <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Log Message */}
              <div className={`text-sm font-mono leading-relaxed ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {log.message}
              </div>
              
              {/* Service Info */}
              {log.service && (
                <div className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Service: <span className="font-medium">{log.service}</span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
