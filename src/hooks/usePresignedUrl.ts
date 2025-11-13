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
      const response = await api.get<PresignedUrlResponse>('/api/user/presignedurl', {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWh0ZXh0MGowMDAzc2V5NjJiNnBuYWR4Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjI5NzI1NTN9.7upGD1Gm-k8A1sLk56nwvs25JEt8YESr3k2AplZTC8c'
        }
      });
      return response.data;
    },
    enabled: false, 
  });
};

