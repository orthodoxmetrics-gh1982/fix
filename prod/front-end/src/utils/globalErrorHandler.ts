export interface ErrorDetails {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  type: 'js_error' | 'unhandled_rejection';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const setupGlobalErrorHandlers = () => {
  // Handle JavaScript runtime errors
  window.onerror = (message, filename, lineno, colno, error) => {
    const errorDetails: ErrorDetails = {
      message: typeof message === 'string' ? message : 'Unknown error',
      filename,
      lineno,
      colno,
      stack: error?.stack,
      type: 'js_error',
      severity: determineSeverityFromError(message, error)
    };

    // Dispatch custom event for OMAI error handling
    window.dispatchEvent(new CustomEvent('omai-error', {
      detail: errorDetails
    }));

    // Don't prevent default error handling
    return false;
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const errorDetails: ErrorDetails = {
      message: event.reason?.message || event.reason?.toString() || 'Unhandled promise rejection',
      stack: event.reason?.stack,
      type: 'unhandled_rejection',
      severity: determineSeverityFromRejection(event.reason)
    };

    // Dispatch custom event for OMAI error handling
    window.dispatchEvent(new CustomEvent('omai-error', {
      detail: errorDetails
    }));

    // Log to console for debugging
    console.error('Unhandled promise rejection:', event.reason);
  });

  // Handle API errors by intercepting fetch
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // Check for HTTP error status codes
      if (!response.ok) {
        const errorDetails: ErrorDetails = {
          message: `API Error: ${response.status} ${response.statusText}`,
          type: 'js_error', // Using js_error type for API errors
          severity: response.status >= 500 ? 'high' : 'medium'
        };

        window.dispatchEvent(new CustomEvent('omai-error', {
          detail: {
            ...errorDetails,
            type: 'api_error',
            context: {
              url: args[0]?.toString(),
              status: response.status,
              statusText: response.statusText
            }
          }
        }));
      }
      
      return response;
    } catch (error) {
      // Handle network errors
      const errorDetails: ErrorDetails = {
        message: `Network Error: ${error instanceof Error ? error.message : 'Unknown network error'}`,
        stack: error instanceof Error ? error.stack : undefined,
        type: 'js_error',
        severity: 'high'
      };

      window.dispatchEvent(new CustomEvent('omai-error', {
        detail: {
          ...errorDetails,
          type: 'api_error',
          context: {
            url: args[0]?.toString(),
            networkError: true
          }
        }
      }));

      throw error;
    }
  };

  console.log('🔧 Global error handlers initialized for OMAI');
};

const determineSeverityFromError = (message: any, error?: Error): ErrorDetails['severity'] => {
  const messageStr = String(message).toLowerCase();
  
  if (messageStr.includes('script error') || messageStr.includes('network')) {
    return 'medium';
  }
  if (messageStr.includes('chunk') || messageStr.includes('loading')) {
    return 'low';
  }
  if (messageStr.includes('security') || messageStr.includes('permission')) {
    return 'high';
  }
  if (messageStr.includes('critical') || messageStr.includes('fatal')) {
    return 'critical';
  }
  
  return 'medium';
};

const determineSeverityFromRejection = (reason: any): ErrorDetails['severity'] => {
  if (!reason) return 'medium';
  
  const reasonStr = String(reason).toLowerCase();
  
  if (reasonStr.includes('aborted') || reasonStr.includes('canceled')) {
    return 'low';
  }
  if (reasonStr.includes('unauthorized') || reasonStr.includes('forbidden')) {
    return 'high';
  }
  if (reasonStr.includes('network') || reasonStr.includes('fetch')) {
    return 'medium';
  }
  if (reasonStr.includes('critical') || reasonStr.includes('timeout')) {
    return 'high';
  }
  
  return 'medium';
};