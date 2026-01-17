import React from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-6">
            <Alert variant="destructive" className="border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-xl font-bold">Something went wrong</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-4">
                  The application encountered an unexpected error. This has been logged for our team to investigate.
                </p>
                {this.state.error && (
                  <details className="mt-4 p-4 bg-slate-100 rounded-lg text-sm">
                    <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                    <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-48">
                      {this.state.error.toString()}
                      {this.state.errorInfo && `\n\n${this.state.errorInfo.componentStack}`}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                size="lg"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              <Button 
                onClick={this.handleReset}
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;