import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exampleService } from '../../../services/example.service';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

export const useExampleMutations = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const createExample = useMutation({
        mutationFn: exampleService.createExample,
        onSuccess: () => {
            message.success('Example created successfully');
            queryClient.invalidateQueries({ queryKey: ['examples'] });
            navigate('/dashboard/examples');
        },
        onError: (error: any) => {
            message.error('Failed to create example');
            console.error(error);
        }
    });

    const updateExample = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => exampleService.updateExample(id, data),
        onSuccess: () => {
            message.success('Example updated successfully');
            queryClient.invalidateQueries({ queryKey: ['examples'] });
            navigate('/dashboard/examples');
        },
        onError: (error: any) => {
            message.error('Failed to update example');
            console.error(error);
        }
    });

    const deleteExample = useMutation({
        mutationFn: exampleService.deleteExample,
        onSuccess: () => {
            message.success('Example deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['examples'] });
        },
        onError: (error: any) => {
            message.error('Failed to delete example');
            console.error(error);
        }
    });

    const updateExampleStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => exampleService.updateStatus(id, status),
        onSuccess: (_data, variables) => {
            const msg = variables.status === 'ACTIVE' ? 'Example activated successfully' : 'Example deactivated successfully';
            message.success(msg);
            queryClient.invalidateQueries({ queryKey: ['examples'] });
        },
        onError: (error: any) => {
            message.error('Failed to update status');
            console.error(error);
        }
    });

    return {
        createExample,
        updateExample,
        deleteExample,
        updateExampleStatus
    };
};
