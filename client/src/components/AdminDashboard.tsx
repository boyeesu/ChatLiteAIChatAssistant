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
        
        {/* Success Stories Card */}
        <Card className="bg-white p-5 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Success Stories</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <svg className="rounded-md bg-gray-100 w-full h-32" viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#f5f7fa" />
              <circle cx="200" cy="140" r="50" fill="#cbd5e0" />
              <rect x="170" y="80" width="60" height="40" rx="10" fill="#a0aec0" />
              <rect x="150" y="200" width="100" height="20" rx="5" fill="#a0aec0" />
            </svg>
            
            <svg className="rounded-md bg-gray-100 w-full h-32" viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#f5f7fa" />
              <rect x="100" y="90" width="200" height="100" rx="5" fill="#a0aec0" />
              <rect x="120" y="110" width="160" height="10" rx="2" fill="#cbd5e0" />
              <rect x="120" y="130" width="160" height="10" rx="2" fill="#cbd5e0" />
              <rect x="120" y="150" width="160" height="10" rx="2" fill="#cbd5e0" />
            </svg>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Case Studies</h3>
            <p className="text-sm text-gray-600 mb-2">Our AI Chat Assistant helped companies reduce support response time by up to 80% while maintaining high customer satisfaction scores.</p>
            <div className="flex gap-2">
              <div className="bg-gray-100 rounded-md p-2 flex items-center justify-center flex-1">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">-45%</p>
                  <p className="text-xs text-gray-500">Support Costs</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-md p-2 flex items-center justify-center flex-1">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">+28%</p>
                  <p className="text-xs text-gray-500">CSAT Score</p>
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-sm font-medium mb-2">Supported Document Types</h3>
          <div className="grid grid-cols-2 gap-3">
            <svg className="rounded-md bg-gray-100 w-full h-24" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#f5f7fa" />
              <rect x="100" y="60" width="60" height="80" fill="#cbd5e0" />
              <rect x="170" y="60" width="60" height="80" fill="#cbd5e0" />
              <rect x="240" y="60" width="60" height="80" fill="#cbd5e0" />
              <rect x="100" y="150" width="200" height="10" rx="2" fill="#a0aec0" />
              <rect x="100" y="170" width="150" height="10" rx="2" fill="#a0aec0" />
            </svg>
            
            <svg className="rounded-md bg-gray-100 w-full h-24" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#f5f7fa" />
              <rect x="130" y="60" width="140" height="100" rx="2" fill="#cbd5e0" />
              <rect x="150" y="80" width="100" height="10" rx="2" fill="#a0aec0" />
              <rect x="150" y="100" width="100" height="10" rx="2" fill="#a0aec0" />
              <rect x="150" y="120" width="100" height="10" rx="2" fill="#a0aec0" />
              <rect x="150" y="140" width="80" height="10" rx="2" fill="#a0aec0" />
            </svg>
          </div>
        </Card>
      </div>
    </div>
  );
}
