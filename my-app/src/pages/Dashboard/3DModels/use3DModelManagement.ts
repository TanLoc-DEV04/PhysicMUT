import { useQuery } from '@tanstack/react-query';
import { model3DService } from '../../../services/model3DService';
import { message } from 'antd';
import { useEffect } from 'react';

export const use3DModelManagement = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['models3d'],
    queryFn: model3DService.getModels3D,
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
