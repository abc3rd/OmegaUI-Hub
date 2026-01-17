import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center p-6">
                    <Card className="bg-black/50 border-red-500/30 max-w-2xl w-full">
                        <CardHeader>
                            <CardTitle className="text-red-400 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6" />
                                Something went wrong
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-[#c3c3c3]/80 text-sm">
                                An unexpected error occurred. This has been logged for debugging.
                            </p>
                            
                            {this.state.error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                    <div className="text-xs text-red-400 font-mono">
                                        {this.state.error.toString()}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3]"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reload Page
                                </Button>
                                <Button
                                    onClick={() => window.location.href = '/'}
                                    variant="outline"
                                    className="border-[#ea00ea]/30 text-[#c3c3c3]"
                                >
                                    Go Home
                                </Button>
                            </div>

                            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                                <details className="text-xs text-[#c3c3c3]/60">
                                    <summary className="cursor-pointer">Stack trace</summary>
                                    <pre className="mt-2 overflow-auto bg-black/50 p-3 rounded">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;