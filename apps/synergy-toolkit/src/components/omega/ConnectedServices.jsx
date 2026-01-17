import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Connection } from '@/entities/Connection';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Chrome } from 'lucide-react';
import { toast } from 'sonner';

export default function ConnectedServices() {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const user = await User.me();
        const userConnections = await Connection.filter({ user_email: user.email });
        setConnections(userConnections);
      } catch (error) {
        console.error("Failed to fetch connections:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConnections();
  }, []);

  const handleConnectGoogle = () => {
    // Redirect to the backend function that starts the OAuth flow
    window.location.href = '/functions/googleOauthStart';
  };

  const handleDelete = async (connectionId) => {
    if (!confirm("Are you sure you want to remove this connection?")) return;
    try {
      await Connection.delete(connectionId);
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      toast.success("Connection removed successfully.");
    } catch (error) {
      console.error("Failed to delete connection:", error);
      toast.error("Failed to remove connection.");
    }
  };

  const hasGoogleConnection = connections.some(c => c.service === 'google');

  if (isLoading) {
    return <div className="flex justify-center items-center h-20"><Loader2 className="animate-spin text-cyan-400"/></div>;
  }

  return (
    <div className="space-y-4">
      {hasGoogleConnection ? (
        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Chrome className="w-6 h-6 text-white" />
            <span className="font-medium text-white">Google Connected</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(connections.find(c => c.service === 'google').id)} className="text-red-400 hover:bg-red-500/10 hover:text-red-300">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button onClick={handleConnectGoogle} variant="outline" className="w-full bg-gray-800 border-gray-700 hover:bg-gray-700">
          <Chrome className="w-5 h-5 mr-2" />
          Connect Google Account
        </Button>
      )}
      {/* Placeholder for other services */}
      <Button variant="outline" disabled className="w-full bg-gray-800 border-gray-700 opacity-50">
        Connect GitHub (Soon)
      </Button>
    </div>
  );
}