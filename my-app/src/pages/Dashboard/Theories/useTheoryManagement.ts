import { useQuery } from '@tanstack/react-query';
import { theoryService } from '../../../services/theoryService';

export const useTheoryManagement = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['theories'],
        queryFn: theoryService.getTheories,
    });

    return { 
        data: data || [], 
        loading: isLoading, 
        error,
        refetch 
    };
};
