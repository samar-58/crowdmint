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
interface NextTaskOption {
  id: string;
  imageUrl: string;
  taskId: string;
}

interface NextTaskResponse {
  task: {
    id: string;
    title: string;
    amount: number;
    options: NextTaskOption[];
  };
}

interface SubmissionPayload {
  taskId: string;
  optionId: string;
}

interface SubmissionResponse {
  message: string;
  nextTask?: {
    id: string;
    title: string;
    amount: number;
    options: NextTaskOption[];
  };
}

export const useNextTask = () => {
  return useQuery<NextTaskResponse, Error>({
    queryKey: ['nextTask'],
    queryFn: async () => {
      const response = await api.get<NextTaskResponse>('/api/worker/next-task', {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWh0ZXVwZXowMDAyc2V5NmZwNGx5c3BzIiwicm9sZSI6IndvcmtlciIsImlhdCI6MTc2MzE0NTI5MH0.EyESYZd1MX2mJ6LBNWRrRUz4u_nxF4mgNvl42pSvrtQ',
        }
      });
      return response.data;
    },
  });
};

export const useSubmitTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation<SubmissionResponse, Error, SubmissionPayload>({
    mutationFn: async (payload: SubmissionPayload) => {
      const response = await api.post<SubmissionResponse>('/api/worker/submission', payload, {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWh0ZXVwZXowMDAyc2V5NmZwNGx5c3BzIiwicm9sZSI6IndvcmtlciIsImlhdCI6MTc2MzE0NTI5MH0.EyESYZd1MX2mJ6LBNWRrRUz4u_nxF4mgNvl42pSvrtQ',
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Update the next task query with the new task data
      if (data.nextTask) {
        queryClient.setQueryData(['nextTask'], { task: data.nextTask });
      } else {
        // No more tasks, invalidate to show empty state
        queryClient.invalidateQueries({ queryKey: ['nextTask'] });
      }
    },
  });
};



