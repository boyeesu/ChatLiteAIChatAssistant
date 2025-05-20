import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, HeadphonesIcon, Bot, HelpCircle } from 'lucide-react';
import { useWidgetConfig } from '@/hooks/useWidgetConfig';
import { useToast } from '@/hooks/use-toast';
import { WidgetConfig } from '@/lib/types';

export default function WidgetCustomization() {
  const { config, updateConfig, isLoading, isUpdating } = useWidgetConfig();
  const { toast } = useToast();
  
  // Generate embed code based on current configuration
  const generateEmbedCode = (config: WidgetConfig | null) => {
    if (!config) return '';
    
    const domain = window.location.origin;
    return `<!-- AI Chat Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AIChatWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','aiChat','${domain}/widget.js'));
  aiChat('init', {
    widgetId: 'default',
    primaryColor: '${config.primaryColor}',
    position: '${config.position}',
    title: '${config.chatTitle}'
  });
</script>
<!-- End AI Chat Widget -->`
  };

  if (isLoading || !config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Widget Customization</CardTitle>
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
        title: 'Changes applied',
        description: 'Widget customization has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to apply changes: ${error}`,
        variant: 'destructive',
      });
    }
  };
  
  const icons = [
    { id: 'message', name: 'Message', icon: <MessageCircle className="h-5 w-5" /> },
    { id: 'customer-service', name: 'Support', icon: <HeadphonesIcon className="h-5 w-5" /> },
    { id: 'robot', name: 'Robot', icon: <Bot className="h-5 w-5" /> },
    { id: 'question-answer', name: 'Help', icon: <HelpCircle className="h-5 w-5" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Widget Customization</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chatTitle">Chat Title</Label>
            <Input
              id="chatTitle"
              value={config.chatTitle}
              onChange={(e) => updateConfig({ ...config, chatTitle: e.target.value })}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Widget Colors</Label>
            <div className="flex gap-2">
              <div className="flex flex-col items-center">
                <div 
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-white shadow-sm"
                  style={{ backgroundColor: config.primaryColor }}
                  onClick={() => {
                    const color = prompt('Enter primary color (hex):', config.primaryColor);
                    if (color) updateConfig({ ...config, primaryColor: color });
                  }}
                ></div>
                <span className="text-xs mt-1">Primary</span>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-200 shadow-sm"
                  style={{ backgroundColor: config.backgroundColor }}
                  onClick={() => {
                    const color = prompt('Enter background color (hex):', config.backgroundColor);
                    if (color) updateConfig({ ...config, backgroundColor: color });
                  }}
                ></div>
                <span className="text-xs mt-1">Bg</span>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-white shadow-sm"
                  style={{ backgroundColor: config.textColor }}
                  onClick={() => {
                    const color = prompt('Enter text color (hex):', config.textColor);
                    if (color) updateConfig({ ...config, textColor: color });
                  }}
                ></div>
                <span className="text-xs mt-1">Text</span>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-white shadow-sm"
                  style={{ backgroundColor: config.accentColor }}
                  onClick={() => {
                    const color = prompt('Enter accent color (hex):', config.accentColor);
                    if (color) updateConfig({ ...config, accentColor: color });
                  }}
                ></div>
                <span className="text-xs mt-1">Accent</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Chat Icon</Label>
            <div className="flex gap-3">
              {icons.map((icon) => (
                <div 
                  key={icon.id}
                  className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
                    config.iconType === icon.id 
                      ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  onClick={() => updateConfig({ ...config, iconType: icon.id })}
                >
                  {icon.icon}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Widget Position</Label>
            <Select 
              value={config.position} 
              onValueChange={(value) => updateConfig({ ...config, position: value })}
            >
              <SelectTrigger id="position" className="w-full">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="showAvatar">Show Avatar in Messages</Label>
              <Switch 
                id="showAvatar"
                checked={config.showAvatar} 
                onCheckedChange={(checked) => updateConfig({ ...config, showAvatar: checked })}
              />
            </div>
          </div>
          
          {/* Embed code section */}
          <div className="space-y-2 mt-6 pt-6 border-t border-gray-100">
            <Label htmlFor="embedCode">Widget Embed Code</Label>
            <div className="relative">
              <Textarea 
                id="embedCode"
                value={generateEmbedCode(config)}
                readOnly
                rows={6}
                className="w-full font-mono text-xs pr-10"
              />
              <Button 
                className="absolute top-2 right-2"
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generateEmbedCode(config));
                  toast({
                    title: "Copied!",
                    description: "Embed code copied to clipboard"
                  });
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Use this code to embed the chat widget on any website. Copy and paste it right before the closing &lt;/body&gt; tag.
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-5"
            disabled={isUpdating}
          >
            {isUpdating ? 'Applying...' : 'Apply Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
