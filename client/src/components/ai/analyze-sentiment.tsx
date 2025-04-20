import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ThumbsDown, ThumbsUp, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AnalyzeSentimentProps {
  text: string;
}

export function AnalyzeSentiment({ text }: AnalyzeSentimentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sentiment, setSentiment] = useState<{sentiment: string, confidence: number} | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!text) {
      toast({
        title: 'Missing text',
        description: 'Please provide text to analyze',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/ai/sentiment', {
        text,
      });

      const data = await response.json();
      
      if (response.ok) {
        setSentiment(data);
        toast({
          title: 'Analysis complete',
          description: `Text analyzed as ${data.sentiment} with ${Math.round(data.confidence * 100)}% confidence`,
        });
      } else {
        throw new Error(data.message || 'Error analyzing sentiment');
      }
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Failed to analyze sentiment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSentimentIcon = () => {
    if (!sentiment) return null;
    
    switch(sentiment.sentiment.toLowerCase()) {
      case 'positive':
        return <ThumbsUp className="h-8 w-8 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="h-8 w-8 text-red-500" />;
      case 'neutral':
      default:
        return <Minus className="h-8 w-8 text-yellow-500" />;
    }
  };

  const sentimentColors = {
    positive: 'bg-green-500',
    negative: 'bg-red-500',
    neutral: 'bg-yellow-500',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Analysis</CardTitle>
        <CardDescription>
          Analyze the sentiment of text using Claude AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {sentiment ? 'Analysis results:' : 'Click the button below to analyze the sentiment of the provided text.'}
        </p>

        {sentiment && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {renderSentimentIcon()}
                <div>
                  <Badge variant="outline" className="mb-1">
                    {sentiment.sentiment.toUpperCase()}
                  </Badge>
                  <p className="text-sm">
                    {Math.round(sentiment.confidence * 100)}% confidence
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-xs mb-1">Confidence</p>
              <Progress 
                value={sentiment.confidence * 100}
                className={`h-2 ${
                  sentimentColors[sentiment.sentiment.toLowerCase() as keyof typeof sentimentColors] || 'bg-primary'
                }`}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleAnalyze} 
          disabled={isLoading || !text}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Sentiment'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AnalyzeSentiment;