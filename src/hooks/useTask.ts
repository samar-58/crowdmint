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
      const response = await api.post<CreateTaskResponse>('/api/user/tasks', payload);
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
      const response = await api.get<TasksResponse>('/api/user/all-tasks');
      
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
    maximumSubmissions: number;
    options: NextTaskOption[];
  } | null;
  pendingBalance: number;
  lockedBalance: number;
  message?: string;
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
  } | null;
  pendingBalance: number;
  lockedBalance: number;
}

export const useNextTask = (enabled: boolean = true) => {
  return useQuery<NextTaskResponse, Error>({
    queryKey: ['nextTask'],
    queryFn: async () => {
      const response = await api.get<NextTaskResponse>('/api/worker/next-task');
      return response.data;
    },
    enabled,
  });
};

export const useSubmitTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation<SubmissionResponse, Error, SubmissionPayload>({
    mutationFn: async (payload: SubmissionPayload) => {
      const response = await api.post<SubmissionResponse>('/api/worker/submission', payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.nextTask) {
        queryClient.setQueryData(['nextTask'], { 
          task: data.nextTask,
          pendingBalance: data.pendingBalance,
          lockedBalance: data.lockedBalance
        });
      } else {
        queryClient.setQueryData(['nextTask'], { 
          task: null,
          pendingBalance: data.pendingBalance,
          lockedBalance: data.lockedBalance,
          message: 'No more tasks available'
        });
      }
    },
  });
};



