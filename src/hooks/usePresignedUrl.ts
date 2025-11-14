import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface PresignedUrlResponse {
  url: string;
  fields: Record<string, string>;
}

interface UsePresignedUrlOptions {
  headers?: Record<string, string>;
}

export const usePresignedUrl = (options?: UsePresignedUrlOptions) => {
  const queryClient = useQueryClient();
  
  const query = useQuery<PresignedUrlResponse>({
    queryKey: ['presignedUrl', options?.headers],
    queryFn: async () => {
      const response = await api.get<PresignedUrlResponse>('/api/user/presignedurl', {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWh0ZXh0MGowMDAzc2V5NjJiNnBuYWR4Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjI5NzI1NTN9.7upGD1Gm-k8A1sLk56nwvs25JEt8YESr3k2AplZTC8c',
          ...options?.headers,
        }
      });
      return response.data;
    },
    enabled: false, 
  });

  const refetchWithHeaders = async (customHeaders: Record<string, string>) => {
    const uniqueKey = `${Date.now()}-${Math.random()}`;
    return queryClient.fetchQuery<PresignedUrlResponse>({
      queryKey: ['presignedUrl', customHeaders, uniqueKey],
      queryFn: async () => {
        const response = await api.get<PresignedUrlResponse>('/api/user/presignedurl', {
          headers: {
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWh0ZXh0MGowMDAzc2V5NjJiNnBuYWR4Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjI5NzI1NTN9.7upGD1Gm-k8A1sLk56nwvs25JEt8YESr3k2AplZTC8c',
            ...customHeaders,
          }
        });
        return response.data;
      },
      staleTime: 0,
      gcTime: 0,
    });
  };

  return {
    ...query,
    refetch: refetchWithHeaders,
  };
};

