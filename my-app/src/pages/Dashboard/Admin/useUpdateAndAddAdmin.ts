import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import { message } from 'antd';

export const useUpdateAndAddAdmin = (onSuccess: () => void) => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      message.success('Thêm Admin thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess();
    },
    onError: (error) => {
      console.error(error);
      message.error('Có lỗi xảy ra khi thêm admin');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) => userService.updateUser(id, values),
    onSuccess: () => {
      message.success('Cập nhật Admin thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess();
    },
    onError: (error) => {
      console.error(error);
      message.error('Có lỗi xảy ra khi cập nhật admin');
    }
  });

  return {
    addAdmin: addMutation.mutateAsync,
    updateAdmin: (id: string, values: any) => updateMutation.mutateAsync({ id, values }),
    loading: addMutation.isPending || updateMutation.isPending,
  };
};
