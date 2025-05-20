import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import DocumentUploader from './DocumentUploader';
import AIConfiguration from './AIConfiguration';
import WidgetCustomization from './WidgetCustomization';
import ChatAnalytics from './ChatAnalytics';
import { useWidgetConfig } from '@/hooks/useWidgetConfig';
import { Analytics } from '@/lib/types';

export default function AdminDashboard() {
  const { config } = useWidgetConfig();
  
  // Query analytics data
  const { data: analytics } = useQuery<Analytics[]>({
    queryKey: ['/api/analytics', { days: 1 }],
  });
  
  // Get documents count from analytics
  const documentCount = 42; // Hardcoded for now, would come from API
  
  // Get latest analytics
  const latestAnalytics = analytics?.[0];
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">AI Chat Assistant Dashboard</h1>
          <div className="flex gap-3">
            <span className="text-sm text-gray-500">Welcome, Admin</span>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              A
            </div>
          </div>
        </div>
        
        <Card className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row md:justify-between mb-4">
            <div>
              <h3 className="font-semibold">Overview</h3>
              <p className="text-sm text-gray-500">Configure and manage your AI chat assistant</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-all">
                <Settings className="mr-1 h-4 w-4" /> Configure Widget
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Active Conversations</h4>
                <span className="text-xs px-2 py-1 bg-primary bg-opacity-10 text-primary rounded-full">Live</span>
              </div>
              <p className="text-2xl font-semibold">{latestAnalytics?.conversationCount || 23}</p>
              <p className="text-xs text-gray-500">+5% from yesterday</p>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Knowledge Base Size</h4>
                <span className="text-xs px-2 py-1 bg-green-500 bg-opacity-10 text-green-500 rounded-full">Indexed</span>
              </div>
              <p className="text-2xl font-semibold">156 MB</p>
              <p className="text-xs text-gray-500">{documentCount} documents</p>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">API Usage</h4>
                <span className="text-xs px-2 py-1 bg-yellow-500 bg-opacity-10 text-yellow-500 rounded-full">75%</span>
              </div>
              <p className="text-2xl font-semibold">{latestAnalytics?.messageCount || 1523}</p>
              <p className="text-xs text-gray-500">API calls today</p>
            </div>
          </div>
        </Card>
      </header>
      
      <div className="admin-grid">
        <DocumentUploader />
        <AIConfiguration />
        <WidgetCustomization />
        <ChatAnalytics />
        
        {/* API Integration Guide Card */}
        <Card className="bg-white p-5 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Widget Integration Guide</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">1. Get Your Embed Code</h3>
              <p className="text-sm text-gray-600">
                From the Widget Customization panel, copy the embed code after configuring your widget appearance.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">2. Add to Your Website</h3>
              <p className="text-sm text-gray-600">
                Paste the code right before the closing &lt;/body&gt; tag on any page where you want the chat widget to appear.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">3. Test Your Integration</h3>
              <p className="text-sm text-gray-600">
                Open your website and verify the widget appears in the specified position. Try sending a test message.
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Supported Document Types</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-gray-50 p-2 rounded text-center">
                <div className="bg-primary bg-opacity-10 text-primary rounded-full w-8 h-8 mx-auto flex items-center justify-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                </div>
                <p className="text-sm">PDF</p>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <div className="bg-primary bg-opacity-10 text-primary rounded-full w-8 h-8 mx-auto flex items-center justify-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                </div>
                <p className="text-sm">DOCX</p>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <div className="bg-primary bg-opacity-10 text-primary rounded-full w-8 h-8 mx-auto flex items-center justify-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <p className="text-sm">TXT</p>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <div className="bg-primary bg-opacity-10 text-primary rounded-full w-8 h-8 mx-auto flex items-center justify-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
                <p className="text-sm">HTML</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
