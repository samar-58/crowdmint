import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface PresignedUrlResponse {
  url: string;
  fields: Record<string, string>;
}

export const usePresignedUrl = () => {
  return useQuery<PresignedUrlResponse>({
    queryKey: ['presignedUrl'],
    queryFn: async () => {
      const response = await api.get<PresignedUrlResponse>('/api/user/presignedurl');
      return response.data;
    },
    enabled: false, // Don't fetch automatically, only when manually triggered
  });
};

