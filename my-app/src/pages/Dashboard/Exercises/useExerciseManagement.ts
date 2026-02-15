import { useQuery } from '@tanstack/react-query';
import { exerciseService } from '../../../services/exerciseService';

export const useExerciseManagement = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['exercises'],
        queryFn: exerciseService.getExercises,
    });

    return { 
        data: data || [], 
        loading: isLoading, 
        error,
        refetch 
    };
};
