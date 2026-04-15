import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../../../services/role.service';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

export const useRoleMutations = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const createRole = useMutation({
        mutationFn: roleService.createRole,
        onSuccess: () => {
            message.success('Create role successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            navigate('/dashboard/roles');
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.error || 'Failed to create role');
            console.error(error);
        }
    });

    const updateRole = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => roleService.updateRole(id, data),
        onSuccess: () => {
            message.success('Update role successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            navigate('/dashboard/roles');
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.error || 'Failed to update role');
            console.error(error);
        }
    });

    const deleteRole = useMutation({
        mutationFn: roleService.deleteRole,
        onSuccess: () => {
            message.success('Delete role successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
        onError: (error: any) => {
            // Show backend error message (e.g. role is in use)
            message.error(error?.response?.data?.error || 'Failed to delete role');
            console.error(error);
        }
    });

    const toggleRoleStatus = useMutation({
        mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
            roleService.toggleRoleStatus(id, is_active),
        onSuccess: (_, variables) => {
            message.success(variables.is_active ? 'Role has been activated' : 'Role has been deactivated');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.error || 'Failed to update role status');
            console.error(error);
        }
    });

    return {
        createRole,
        updateRole,
        deleteRole,
        toggleRoleStatus,
    };
};
