import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';

export default function DebugOAuthPage() {
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await apiRequest('GET', '/api/debug/oauth');
        const data = await response.json();
        setCallbackUrl(data.callbackUrl);
        setClientId(data.clientId);
      } catch (error) {
        console.error('Failed to fetch debug info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, []);

  const handleDirectAuth = () => {
    if (clientId) {
      // Create a direct GitHub OAuth URL
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl || '')}&scope=user:email`;
      window.location.href = authUrl;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">GitHub OAuth Debug</h1>
      
      {loading ? (
        <p>Loading configuration...</p>
      ) : (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-muted/50">
            <h2 className="text-xl font-semibold mb-2">OAuth Configuration</h2>
            <div className="space-y-2">
              <p className="flex gap-2">
                <span className="font-medium">Callback URL:</span> 
                <code className="bg-muted p-1 rounded">{callbackUrl || 'Not configured'}</code>
              </p>
              <p className="flex gap-2">
                <span className="font-medium">Client ID:</span> 
                <code className="bg-muted p-1 rounded">{clientId ? `${clientId.substring(0, 8)}...` : 'Not configured'}</code>
              </p>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <h2 className="text-xl font-semibold mb-2">Test Authentication</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Standard OAuth Flow</h3>
                <Button 
                  onClick={() => window.location.href = '/api/auth/github'}
                  variant="default"
                >
                  Try Standard GitHub Auth
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Direct OAuth Flow</h3>
                <Button 
                  onClick={handleDirectAuth}
                  variant="outline"
                  disabled={!clientId || !callbackUrl}
                >
                  Try Direct GitHub Auth
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <h2 className="text-xl font-semibold mb-4">Instructions to Fix GitHub OAuth</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to your GitHub account settings</li>
              <li>Navigate to Developer settings → OAuth Apps</li>
              <li>Find your application and click on it</li>
              <li>Ensure the callback URL matches <b>exactly</b> what's displayed above</li>
              <li>Save your changes</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}