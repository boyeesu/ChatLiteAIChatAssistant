import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BadgePoundSterling, Drill, HeadphonesIcon, HelpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Analytics } from '@/lib/types';

export default function ChatAnalytics() {
  // Query analytics data for the last 7 days
  const { data: analytics, isLoading } = useQuery<Analytics[]>({
    queryKey: ['/api/analytics', { days: 7 }],
  });

  // Convert analytics data for chart display
  const chartData = React.useMemo(() => {
    if (!analytics) return [];
    
    return analytics.map(day => {
      const date = new Date(day.date);
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: day.conversationCount,
      };
    });
  }, [analytics]);

  // Get the latest day's data for topic distribution
  const latestDay = React.useMemo(() => {
    if (!analytics || analytics.length === 0) return null;
    return analytics[analytics.length - 1];
  }, [analytics]);

  // Format topic counts into an array for display
  const topicData = React.useMemo(() => {
    if (!latestDay) return [];
    
    const topics = latestDay.topicCounts;
    return Object.entries(topics).map(([name, value]) => ({
      name,
      value: typeof value === 'number' ? value : parseInt(value.toString()),
      percentage: typeof value === 'number' 
        ? Math.round((value / Object.values(topics).reduce((sum, v) => sum + (typeof v === 'number' ? v : parseInt(v.toString())), 0)) * 100) 
        : 0
    }));
  }, [latestDay]);

  // Get icon for topic
  const getTopicIcon = (topic: string) => {
    switch (topic) {
      case 'Pricing Questions':
        return <BadgePoundSterling className="h-4 w-4" />;
      case 'Technical Support':
        return <Drill className="h-4 w-4" />;
      case 'Account Issues':
        return <HeadphonesIcon className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-40"></div>
            <div className="bg-gray-100 rounded-md p-4 h-32"></div>
            <div className="h-4 bg-gray-200 rounded w-36"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center p-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Chat Engagement</h3>
            <div className="text-xs text-gray-500">
              Last 7 days
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-md p-4 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Popular Topics</h3>
          
          {topicData.length > 0 ? (
            topicData.map((topic, index) => (
              <div key={index} className="flex justify-between items-center p-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className={`bg-primary bg-opacity-10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3`}>
                    {getTopicIcon(topic.name)}
                  </div>
                  <span className="text-sm">{topic.name}</span>
                </div>
                <span className="text-sm font-medium">{topic.percentage}%</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 p-2">No topic data available.</p>
          )}
        </div>
        
        <Button variant="outline" className="mt-5 w-full">
          View Full Analytics
        </Button>
      </CardContent>
    </Card>
  );
}
