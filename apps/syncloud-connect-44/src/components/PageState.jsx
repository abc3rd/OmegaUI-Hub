import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Loading state component
 */
export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#ea00ea] mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * Error state component
 */
export function ErrorState({ 
  message = 'Something went wrong', 
  onRetry = null,
  showRetry = true 
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-[#3c3c3c] mb-2">
          Error
        </h3>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {showRetry && onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
export function EmptyState({ 
  icon: Icon = null,
  title = 'No data',
  message = 'Nothing to display yet',
  action = null 
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {Icon && (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Icon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        <h3 className="text-xl font-semibold text-[#3c3c3c] mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {action}
      </div>
    </div>
  );
}