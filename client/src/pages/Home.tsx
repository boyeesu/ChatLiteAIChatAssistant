import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { MessageCircle, Settings, FileText, Bot } from 'lucide-react';
import { useWidgetContext } from '@/context/WidgetContext';

export default function Home() {
  const { openChat } = useWidgetContext();

  return (
    <>
      <Helmet>
        <title>AI Chat Assistant | Powered by DeepSeek</title>
        <meta name="description" content="An intelligent AI chat assistant powered by DeepSeek with RAG capabilities for accurate and context-aware responses." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center">
              <MessageCircle className="text-primary mr-2 h-6 w-6" />
              <h1 className="text-xl font-bold text-gray-800">AI Chat Assistant</h1>
            </div>
            <nav>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 text-gray-600 hover:text-primary"
                onClick={() => window.location.href = "/admin"}
              >
                <Settings className="h-4 w-4" />
                Admin Dashboard
              </Button>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-grow flex items-center justify-center bg-gradient-to-b from-white to-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Intelligent Customer Support</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Powered by DeepSeek AI and RAG technology to provide accurate, context-aware responses based on your knowledge base.
            </p>
            
            <Button
              size="lg"
              onClick={openChat}
              className="mb-8 bg-primary hover:bg-primary/90 text-white"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Try the Chat Assistant
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Support</h3>
                <p className="text-gray-600">
                  Provide 24/7 support to your customers with our AI assistant that responds instantly.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Custom Knowledge</h3>
                <p className="text-gray-600">
                  Upload your own documents to customize the AI's knowledge base for accurate responses.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Customizable AI</h3>
                <p className="text-gray-600">
                  Configure the AI's tone, response length, and appearance to match your brand.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  <span className="font-semibold">AI Chat Assistant</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">Powered by DeepSeek AI</p>
              </div>
              
              <div className="flex gap-6">
                <span 
                  className="text-gray-300 hover:text-white cursor-pointer"
                  onClick={() => window.location.href = "/admin"}
                >
                  Admin Dashboard
                </span>
                <a href="#" className="text-gray-300 hover:text-white">Documentation</a>
                <a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
              &copy; {new Date().getFullYear()} AI Chat Assistant. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
