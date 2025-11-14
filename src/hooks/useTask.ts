import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

interface TaskOption {
  id: string;
  imageUrl: string | null;
  count: number;
}

interface TaskFromAPI {
  id: string;
  title: string;
  amount: number;
  type: string;
  done: boolean;
  options: TaskOption[];
}

interface Task extends TaskFromAPI {
  totalVotes: number;
}

interface TasksResponse {
  res: TaskFromAPI[];
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

export const useAllTasks = () => {
  return useQuery<Task[], Error>({
    queryKey: ['allTasks'],
    queryFn: async () => {
      const response = await api.get<TasksResponse>('/api/user/all-tasks',{
        headers:{
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWh0ZXh0MGowMDAzc2V5NjJiNnBuYWR4Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjI5NzI1NTN9.7upGD1Gm-k8A1sLk56nwvs25JEt8YESr3k2AplZTC8c',
        }
      });
      
      const transformedTasks: Task[] = response.data.res.map(task => ({
        ...task,
        totalVotes: task.options.reduce((sum, option) => sum + option.count, 0)
      }));
      
      return transformedTasks;
    },
  });
};



