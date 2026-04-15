import { useQuery } from '@tanstack/react-query';
import { roleService } from '../../../../../services/role.service';

export const useRole = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getRoles,
  });

  return { 
    data: data || [], 
    loading: isLoading,
    error,
    refetch 
  };
};
