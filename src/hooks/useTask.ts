import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface CreateTaskPayload {
  title?: string;
  type: "TEXT" | "IMAGE";
  signature: string;
  amount: number;
  options: Array<{ imageUrl: string }>;
}

interface CreateTaskResponse {
  message: string;
  taskId: string;
}

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateTaskResponse, Error, CreateTaskPayload>({
    mutationFn: async (payload: CreateTaskPayload) => {
      const response = await api.post<CreateTaskResponse>('/api/user/tasks', payload, {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWh0ZXh0MGowMDAzc2V5NjJiNnBuYWR4Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjI5NzI1NTN9.7upGD1Gm-k8A1sLk56nwvs25JEt8YESr3k2AplZTC8c',
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

