import { useQuery } from '@tanstack/react-query';
import { exampleService } from '../../../services/exampleService';

export const useExampleManagement = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['examples'],
        queryFn: exampleService.getExamples,
    });

    return { 
        data: data || [], 
        loading: isLoading, 
        error,
        refetch 
    };
};
