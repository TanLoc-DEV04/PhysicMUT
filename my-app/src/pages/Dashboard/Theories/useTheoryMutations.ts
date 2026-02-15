import { useMutation, useQueryClient } from '@tanstack/react-query';
import { theoryService } from '../../../services/theoryService';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

export const useTheoryMutations = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const createTheory = useMutation({
        mutationFn: theoryService.createTheory,
        onSuccess: () => {
            message.success('Theory created successfully');
            queryClient.invalidateQueries({ queryKey: ['theories'] });
            navigate('/dashboard/theory');
        },
        onError: (error: any) => {
            message.error('Failed to create theory');
            console.error(error);
        }
    });

    const updateTheory = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => theoryService.updateTheory(id, data),
        onSuccess: () => {
            message.success('Theory updated successfully');
            queryClient.invalidateQueries({ queryKey: ['theories'] });
            navigate('/dashboard/theory');
        },
        onError: (error: any) => {
            message.error('Failed to update theory');
            console.error(error);
        }
    });

    const deleteTheory = useMutation({
        mutationFn: theoryService.deleteTheory,
        onSuccess: () => {
            message.success('Theory deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['theories'] });
        },
        onError: (error: any) => {
            message.error('Failed to delete theory');
            console.error(error);
        }
    });

    const updateTheoryStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => theoryService.updateTheory(id, { status }),
        onSuccess: () => {
            message.success('Theory status updated');
            queryClient.invalidateQueries({ queryKey: ['theories'] });
        },
        onError: (error: any) => {
            message.error('Failed to update status');
            console.error(error);
        }
    });

    return {
        createTheory,
        updateTheory,
        deleteTheory,
        updateTheoryStatus
    };
};
