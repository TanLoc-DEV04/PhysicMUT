import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/api';
// import { User } from '../../../services/api'; 

export const useAdmin = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users'], // We fetch all users, then filter in component or here if needed
    queryFn: userService.getUsers,
  });

  // Optional: Filter for admins only if that's the intention
  // const admins = data?.filter((u: any) => u.role?.name === 'Admin' || u.role?.name === 'System Admin');

  return {
    data: data || [], // Return all users for now, let component filter
    loading: isLoading,
    refetch,
  };
};
