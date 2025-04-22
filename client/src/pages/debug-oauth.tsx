import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default function DebugOAuthPage() {
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [dynamicCallbackUrl, setDynamicCallbackUrl] = useState<string>('');
  const [urlMismatch, setUrlMismatch] = useState<boolean>(false);

  useEffect(() => {
    // Get current base URL
    const baseUrl = window.location.origin;
    setCurrentUrl(baseUrl);
    
    // Calculate what the dynamic callback URL should be
    const calculatedCallbackUrl = `${baseUrl}/api/auth/github/callback`;
    setDynamicCallbackUrl(calculatedCallbackUrl);

    const fetchDebugInfo = async () => {
      try {
        const response = await apiRequest('GET', '/api/debug/oauth');
        const data = await response.json();
        setCallbackUrl(data.callbackUrl);
        setClientId(data.clientId);
        
        // Check if there's a mismatch between the callback URL in the config and what it should be
        if (data.callbackUrl !== calculatedCallbackUrl) {
          setUrlMismatch(true);
        }
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
  
  const handleDynamicAuth = () => {
    if (clientId) {
      // Create a direct GitHub OAuth URL with dynamic callback
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(dynamicCallbackUrl)}&scope=user:email`;
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
          {urlMismatch && (
            <Alert variant="destructive">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Callback URL Mismatch Detected</AlertTitle>
              <AlertDescription>
                The configured callback URL doesn't match the current application URL. This could be the cause of the GitHub OAuth error.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="p-4 border rounded-lg bg-muted/50">
            <h2 className="text-xl font-semibold mb-2">OAuth Configuration</h2>
            <div className="space-y-2">
              <p className="flex gap-2">
                <span className="font-medium">Current Site URL:</span> 
                <code className="bg-muted p-1 rounded">{currentUrl}</code>
              </p>
              <p className="flex gap-2">
                <span className="font-medium">Configured Callback URL:</span> 
                <code className={`bg-muted p-1 rounded ${urlMismatch ? 'text-destructive' : ''}`}>
                  {callbackUrl || 'Not configured'}
                </code>
              </p>
              {urlMismatch && (
                <p className="flex gap-2">
                  <span className="font-medium">Expected Callback URL:</span> 
                  <code className="bg-muted p-1 rounded text-green-600">{dynamicCallbackUrl}</code>
                </p>
              )}
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
                <h3 className="text-lg font-medium mb-2">Direct OAuth Flow (Configured URL)</h3>
                <Button 
                  onClick={handleDirectAuth}
                  variant="outline"
                  disabled={!clientId || !callbackUrl}
                >
                  Try Direct GitHub Auth with Configured URL
                </Button>
              </div>
              
              {urlMismatch && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Direct OAuth Flow (Dynamic URL)</h3>
                  <Button 
                    onClick={handleDynamicAuth}
                    variant="outline"
                    className="bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                    disabled={!clientId}
                  >
                    Try Direct GitHub Auth with Current URL
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will try authentication using the current site URL to generate the callback URL.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <h2 className="text-xl font-semibold mb-4">Instructions to Fix GitHub OAuth</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to your GitHub account settings</li>
              <li>Navigate to Developer settings → OAuth Apps</li>
              <li>Find your application and click on it</li>
              <li>Change the callback URL to <b>exactly</b> match the <b>Expected Callback URL</b> shown above</li>
              <li>Save your changes in GitHub</li>
              <li>Update the callback URL in server/auth.ts with the same URL</li>
              <li>Restart the server after making the changes</li>
            </ol>
            
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Why GitHub OAuth is Failing</h3>
              <p className="text-sm">
                GitHub requires the callback URL in your OAuth application settings to <b>exactly match</b> the URL your application uses. 
                This is a common issue in development environments where URLs can change between sessions. The error "redirect_uri_mismatch" 
                occurs when these don't match perfectly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}