import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WidgetConfig } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';

interface WidgetContextType {
  config: WidgetConfig | null;
  isLoading: boolean;
  isOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  updateConfig: (updates: Partial<WidgetConfig>) => Promise<void>;
}

const defaultContext: WidgetContextType = {
  config: null,
  isLoading: true,
  isOpen: false,
  toggleChat: () => {},
  openChat: () => {},
  closeChat: () => {},
  updateConfig: async () => {},
};

const WidgetContext = createContext<WidgetContextType>(defaultContext);

export const useWidgetContext = () => useContext(WidgetContext);

export const WidgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await apiRequest('GET', '/api/widget/config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        } else {
          console.error('Failed to fetch widget config');
        }
      } catch (error) {
        console.error('Error fetching widget config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const openChat = () => {
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const updateConfig = async (updates: Partial<WidgetConfig>) => {
    try {
      setIsLoading(true);
      const response = await apiRequest('PATCH', '/api/widget/config', updates);
      
      if (response.ok) {
        const updatedConfig = await response.json();
        setConfig(updatedConfig);
      } else {
        throw new Error('Failed to update widget configuration');
      }
    } catch (error) {
      console.error('Error updating widget config:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WidgetContext.Provider 
      value={{ 
        config, 
        isLoading, 
        isOpen, 
        toggleChat, 
        openChat, 
        closeChat, 
        updateConfig 
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
};
