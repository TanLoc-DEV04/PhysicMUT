import { useQuery } from '@tanstack/react-query';
import { exerciseService } from '../../../../../services/exercise.service';
import { message } from 'antd';
import { useEffect } from 'react';

export const useExerciseManagement = (model_type_name?: string | null, exercise_type_name?: string | null, type?: string | null, search?: string) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['exercises', model_type_name, exercise_type_name, type, search],
        queryFn: () => exerciseService.getExercises(model_type_name, exercise_type_name, type, search),
    });

    return { 
        data: data || [], 
        loading: isLoading, 
        error,
        refetch 
    };
};

export const useExerciseCategories = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['exercises', 'categories'],
        queryFn: exerciseService.getExerciseCategories,
    });

    useEffect(() => {
        if (error) {
            console.error(error);
            message.error('Failed to fetch exercise categories');
        }
    }, [error]);

    return {
        categories: data || [],
        loadingCategories: isLoading,
    };
};
