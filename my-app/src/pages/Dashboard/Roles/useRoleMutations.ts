import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../../../services/roleService';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

export const useRoleMutations = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const createRole = useMutation({
        mutationFn: roleService.createRole,
        onSuccess: () => {
            message.success('Role created successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            navigate('/dashboard/roles');
        },
        onError: (error: any) => {
            message.error('Failed to create role');
            console.error(error);
        }
    });

    const updateRole = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => roleService.updateRole(id, data),
        onSuccess: () => {
            message.success('Role updated successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            navigate('/dashboard/roles');
        },
        onError: (error: any) => {
            message.error('Failed to update role');
            console.error(error);
        }
    });

    const deleteRole = useMutation({
        mutationFn: roleService.deleteRole,
        onSuccess: () => {
            message.success('Role deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
        onError: (error: any) => {
            message.error('Failed to delete role');
            console.error(error);
        }
    });

    return {
        createRole,
        updateRole,
        deleteRole
    };
};
