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
      const response = await api.get<NextTaskResponse>('/api/worker/next-task');
      return response.data;
    },
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
      // Update the next task query with the new task data
      if (data.nextTask) {
        queryClient.setQueryData(['nextTask'], { task: data.nextTask });
      } else {
        // No more tasks, set query data to undefined to show "All Done" state
        queryClient.setQueryData(['nextTask'], undefined);
      }
    },
  });
};



