import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useWidgetConfig } from '@/hooks/useWidgetConfig';
import { useToast } from '@/hooks/use-toast';
import { WidgetConfig } from '@/lib/types';

export default function AIConfiguration() {
  const { config, updateConfig, isLoading, isUpdating } = useWidgetConfig();
  const { toast } = useToast();
  const [localConfig, setLocalConfig] = useState<WidgetConfig | null>(null);

  useEffect(() => {
    if (config) setLocalConfig(config);
  }, [config]);

  const handleChange = (changes: Partial<WidgetConfig>) => {
    setLocalConfig((prev) => prev ? { ...prev, ...changes } : null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!localConfig) return;
    try {
      await updateConfig(localConfig);
      toast({
        title: 'Configuration saved',
        description: 'AI settings have been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to save configuration: ${error?.message || error}`,
        variant: 'destructive',
      });
    }
  };

  const getResponseLengthLabel = useCallback((value: number) => {
    const labels = ['Very Concise', 'Brief', 'Medium', 'Detailed', 'Comprehensive'];
    return labels[value - 1] || 'Medium';
  }, []);

  if (isLoading || !localConfig) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="AI Configuration Form">
          <div className="space-y-2">
            <Label htmlFor="tone">AI Tone</Label>
            <Select
              value={localConfig.aiTone}
              onValueChange={(value) => handleChange({ aiTone: value })}
            >
              <SelectTrigger id="tone" className="w-full" aria-label="AI Tone">
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

          <div
