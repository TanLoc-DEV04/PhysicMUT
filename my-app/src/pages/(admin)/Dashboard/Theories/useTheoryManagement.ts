import { useQuery } from '@tanstack/react-query';
import { theoryService } from '../../../../services/theory.service';
import { message } from 'antd';
import { useEffect } from 'react';

export const useTheoryManagement = (model_type_name?: string | null, theory_type_name?: string | null, search?: string) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['theories', model_type_name, theory_type_name, search],
        queryFn: () => theoryService.getTheories(model_type_name, theory_type_name, search),
    });

    return { 
        data: data || [], 
        loading: isLoading, 
        error,
        refetch 
    };
};

export const useTheoryCategories = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['theories', 'categories'],
        queryFn: theoryService.getTheoryCategories,
    });

    useEffect(() => {
        if (error) {
            console.error(error);
            message.error('Failed to fetch theory categories');
        }
    }, [error]);

    return {
        categories: data || [],
        loadingCategories: isLoading,
    };
};
