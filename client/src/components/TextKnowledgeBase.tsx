
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const TextKnowledgeBase: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTextSubmit = async () => {
    if (!text.trim()) {
      toast({
        title: 'Empty text',
        description: 'Please enter some text to use as knowledge base.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/knowledge/text', { text });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to add text to knowledge base');
      }

      setText('');
      toast({
        title: 'Success',
        description: 'Text added to knowledge base.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to add text: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paste Text Knowledge</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Paste your text knowledge here..."
            className="min-h-[200px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button 
            onClick={handleTextSubmit} 
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Add to Knowledge Base'}
          </Button>
          <p className="text-xs text-gray-500">
            Text will be processed, chunked, and used to answer queries.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextKnowledgeBase;
