import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface EarningsSummary {
    totalEarned: number;
    pendingBalance: number;
    lockedBalance: number;
    totalTasks: number;
}

export interface SubmissionHistory {
    id: string;
    taskTitle: string;
    amount: number;
    createdAt: string;
}

export interface PayoutHistory {
    id: string;
    amount: number;
    status: 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'PENDING';
    signature: string | null;
    createdAt: string;
}

export interface EarningsResponse {
    summary: EarningsSummary;
    submissions: SubmissionHistory[];
    payouts: PayoutHistory[];
}

export const useEarnings = () => {
    return useQuery<EarningsResponse, Error>({
        queryKey: ['workerEarnings'],
        queryFn: async () => {
            const response = await api.get<EarningsResponse>('/api/worker/earnings');
            return response.data;
        },
    });
};

export const formatSolAmount = (lamports: number) => {
    return (lamports / 1_000_000_000).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    });
};
