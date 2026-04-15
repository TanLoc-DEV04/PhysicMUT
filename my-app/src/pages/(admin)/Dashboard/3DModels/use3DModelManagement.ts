import { useQuery } from '@tanstack/react-query';
import { model3DService } from '../../../../services/models.service';
import { message } from 'antd';
import { useEffect } from 'react';

export const use3DModelManagement = (type?: string | null, search?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['models3d', type, search],
    queryFn: () => model3DService.getModels3D(type, search),
  });

  useEffect(() => {
    if (error) {
        console.error(error);
        message.error('Failed to fetch 3D models');
    }
  }, [error]);

  return {
    data: data || [],
    loading: isLoading,
    refetch,
  };
};

export const use3DModelTypes = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['models3d', 'types'],
        queryFn: model3DService.getModel3DTypes,
    });

    useEffect(() => {
        if (error) {
            console.error(error);
            message.error('Failed to fetch 3D model types');
        }
    }, [error]);

    return {
        types: data || [],
        loadingTypes: isLoading,
    };
};
