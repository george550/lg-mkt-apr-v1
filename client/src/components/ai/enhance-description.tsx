import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EnhanceDescriptionProps {
  title: string;
  description: string;
  tags?: string[];
  onSuccess: (enhancedDescription: string) => void;
}

export function EnhanceDescription({ title, description, tags = [], onSuccess }: EnhanceDescriptionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEnhance = async () => {
    if (!title || !description) {
      toast({
        title: 'Missing information',
        description: 'Title and description are required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/ai/enhance-description', {
        title,
        description,
        tags,
      });

      const data = await response.json();
      
      if (response.ok) {
        onSuccess(data.enhancedDescription);
        toast({
          title: 'Description enhanced',
          description: 'The AI has improved your listing description',
        });
      } else {
        throw new Error(data.message || 'Error enhancing description');
      }
    } catch (error) {
      console.error('Failed to enhance description:', error);
      toast({
        title: 'Enhancement failed',
        description: error instanceof Error ? error.message : 'Failed to enhance description',
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
          <Sparkles className="h-5 w-5 text-primary" />
          <span>AI Description Enhancement</span>
        </CardTitle>
        <CardDescription>
          Let Claude AI enhance your listing description to make it more appealing and SEO-friendly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Click the button below to have Claude analyze your listing's title, description, and tags to generate
          an improved description that highlights features, benefits, and technologies.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleEnhance} 
          disabled={isLoading || !title || !description}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Enhance with AI
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default EnhanceDescription;