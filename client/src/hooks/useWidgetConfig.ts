import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WidgetConfig } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';

export function useWidgetConfig() {
  const queryClient = useQueryClient();

  // Query for fetching widget configuration
  const { data: config, isLoading, error } = useQuery<WidgetConfig>({
    queryKey: ['/api/widget/config'],
  });

  // Mutation for updating widget configuration
  const { mutate: updateConfig, isPending: isUpdating } = useMutation({
    mutationFn: async (updates: Partial<WidgetConfig>) => {
      const response = await apiRequest('PATCH', '/api/widget/config', updates);
      if (!response.ok) {
        throw new Error('Failed to update widget configuration');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the widget config query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/widget/config'] });
    },
  });

  return {
    config,
    isLoading,
    error,
    updateConfig,
    isUpdating,
  };
}
