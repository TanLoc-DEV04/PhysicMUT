import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

export const useUserMutations = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const createUser = useMutation({
        mutationFn: userService.createUser,
        onSuccess: () => {
            message.success('User created successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            navigate('/dashboard/users');
        },
        onError: (error: any) => {
            message.error('Failed to create user');
            console.error(error);
        }
    });

    const updateUser = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => userService.updateUser(id, data),
        onSuccess: () => {
            message.success('User updated successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            navigate('/dashboard/users');
        },
        onError: (error: any) => {
            message.error('Failed to update user');
            console.error(error);
        }
    });

    const deleteUser = useMutation({
        mutationFn: userService.deleteUser,
        onSuccess: () => {
            message.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            message.error('Failed to delete user');
            console.error(error);
        }
    });

    const updateUserStatus = useMutation({
        mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => userService.updateUserStatus(id, is_active),
        onSuccess: (_data, variables) => {
            const msg = variables.is_active ? 'User account activated successfully' : 'User account deactivated successfully';
            message.success(msg);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            message.error('Failed to update user status');
            console.error(error);
        }
    });

    return {
        createUser,
        updateUser,
        deleteUser,
        updateUserStatus
    };
};
