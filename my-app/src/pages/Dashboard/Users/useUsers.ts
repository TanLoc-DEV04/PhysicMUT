import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import { roleService } from '../../../services/roleService';
import { useEffect } from 'react';
import { message } from 'antd';

export const useUsers = (roleId?: string | null, search?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', roleId, search],
    queryFn: () => userService.getUsers({ roleId: roleId || undefined, search }),
  });

  useEffect(() => {
    if (error) {
        console.error(error);
        message.error('Failed to fetch users');
    }
  }, [error]);

  return { 
    data: data || [], 
    loading: isLoading, 
    error,
    refetch 
  };
};

export const useRoles = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['roles'],
        queryFn: roleService.getRoles,
    });

    useEffect(() => {
        if (error) {
            console.error(error);
            message.error('Failed to fetch roles');
        }
    }, [error]);

    return {
        roles: data || [],
        loadingRoles: isLoading,
    };
};
