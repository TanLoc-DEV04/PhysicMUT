import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/userService';

export const useUsers = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  });

  return { 
    data: data || [], 
    loading: isLoading, 
    error,
    refetch 
  };
};
