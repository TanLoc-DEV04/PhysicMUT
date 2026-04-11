import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import { message } from 'antd';

export const useUpdateAndAddAdmin = (onSuccess: () => void) => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      message.success('Add Admin successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess();
    },
    onError: (error: any) => {
      console.error(error);
      message.error(error?.response?.data?.error || 'Failed to add admin');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) => userService.updateUser(id, values),
    onSuccess: () => {
      message.success('Update Admin successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess();
    },
    onError: (error: any) => {
      console.error(error);
      message.error(error?.response?.data?.error || 'Failed to update admin');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      message.success('Delete Admin successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess();
    },
    onError: (error: any) => {
      console.error(error);
      message.error(error?.response?.data?.error || 'Failed to delete admin');
    }
  });

  return {
    addAdmin: addMutation.mutateAsync,
    updateAdmin: (id: string, values: any) => updateMutation.mutateAsync({ id, values }),
    deleteAdmin: (id: string) => deleteMutation.mutateAsync(id),
    loading: addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};
