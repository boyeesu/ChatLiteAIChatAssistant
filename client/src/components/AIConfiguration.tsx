import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useWidgetConfig } from '@/hooks/useWidgetConfig';
import { useToast } from '@/hooks/use-toast';

export default function AIConfiguration() {
  const { config, updateConfig, isLoading, isUpdating } = useWidgetConfig();
  const { toast } = useToast();
  
  if (isLoading || !config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateConfig(config);
      toast({
        title: 'Configuration saved',
        description: 'AI settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to save configuration: ${error}`,
        variant: 'destructive',
      });
    }
  };
  
  const getResponseLengthLabel = (value: number) => {
    const labels = ['Very Concise', 'Brief', 'Medium', 'Detailed', 'Comprehensive'];
    return labels[value - 1] || 'Medium';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tone">AI Tone</Label>
            <Select 
              value={config.aiTone} 
              onValueChange={(value) => updateConfig({ ...config, aiTone: value })}
            >
              <SelectTrigger id="tone" className="w-full">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Response Length</Label>
            <div className="flex items-center">
              <Slider 
                value={[config.responseLength]} 
                min={1} 
                max={5} 
                step={1}
                onValueChange={(value) => updateConfig({ ...config, responseLength: value[0] })}
                className="w-full mr-3"
              />
              <span className="text-sm font-medium whitespace-nowrap">
                {getResponseLengthLabel(config.responseLength)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="greeting">Default Greeting</Label>
            <Textarea 
              id="greeting"
              value={config.greeting}
              onChange={(e) => updateConfig({ ...config, greeting: e.target.value })}
              rows={2}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="block">DeepSeek API Integration</Label>
              <p className="text-xs text-gray-500">Using DeepSeek Coder LLM</p>
            </div>
            <Switch 
              checked={config.deepSeekEnabled} 
              onCheckedChange={(checked) => updateConfig({ ...config, deepSeekEnabled: checked })}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-5"
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Configuration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
