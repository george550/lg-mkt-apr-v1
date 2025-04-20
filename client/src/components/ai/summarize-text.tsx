import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SummarizeTextProps {
  text: string;
  onSuccess?: (summary: string) => void;
}

export function SummarizeText({ text, onSuccess }: SummarizeTextProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!text) {
      toast({
        title: 'Missing text',
        description: 'Please provide text to summarize',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/ai/summarize', {
        text,
      });

      const data = await response.json();
      
      if (response.ok) {
        setSummary(data.summary);
        if (onSuccess) {
          onSuccess(data.summary);
        }
        toast({
          title: 'Text summarized',
          description: 'Claude AI has successfully summarized your text',
        });
      } else {
        throw new Error(data.message || 'Error summarizing text');
      }
    } catch (error) {
      console.error('Failed to summarize text:', error);
      toast({
        title: 'Summarization failed',
        description: error instanceof Error ? error.message : 'Failed to summarize text',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>AI Text Summarization</span>
        </CardTitle>
        <CardDescription>
          Let Claude AI summarize long text into key points
        </CardDescription>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Summary</h4>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm whitespace-pre-wrap">{summary}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click the button below to have Claude analyze and summarize your text while
            preserving the most important information.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSummarize} 
          disabled={isLoading || !text}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            'Summarize Text'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default SummarizeText;