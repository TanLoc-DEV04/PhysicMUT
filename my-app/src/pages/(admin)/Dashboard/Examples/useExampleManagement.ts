import { useQuery } from '@tanstack/react-query';
import { exampleService } from '../../../../../services/example.service';
import { message } from 'antd';
import { useEffect } from 'react';

export const useExampleManagement = (model_type_name?: string | null, example_type_name?: string | null, search?: string) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['examples', model_type_name, example_type_name, search],
        queryFn: () => exampleService.getExamples(model_type_name, example_type_name, search),
    });

    return { 
        data: data || [], 
        loading: isLoading, 
        error,
        refetch 
    };
};

export const useExampleCategories = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['examples', 'categories'],
        queryFn: exampleService.getExampleCategories,
    });

    useEffect(() => {
        if (error) {
            console.error(error);
            message.error('Failed to fetch example categories');
        }
    }, [error]);

    return {
        categories: data || [],
        loadingCategories: isLoading,
    };
};
