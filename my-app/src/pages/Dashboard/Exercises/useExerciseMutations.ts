import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseService } from '../../../services/exercise.service';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

export const useExerciseMutations = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const createExercise = useMutation({
        mutationFn: exerciseService.createExercise,
        onSuccess: () => {
            message.success('Exercise created successfully');
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
            navigate('/dashboard/exercises');
        },
        onError: (error: any) => {
            message.error('Failed to create exercise');
            console.error(error);
        }
    });

    const updateExercise = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => exerciseService.updateExercise(id, data),
        onSuccess: () => {
            message.success('Exercise updated successfully');
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
            navigate('/dashboard/exercises');
        },
        onError: (error: any) => {
            message.error('Failed to update exercise');
            console.error(error);
        }
    });

    const deleteExercise = useMutation({
        mutationFn: exerciseService.deleteExercise,
        onSuccess: () => {
            message.success('Exercise deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
        onError: (error: any) => {
            message.error('Failed to delete exercise');
            console.error(error);
        }
    });

    const updateExerciseStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => exerciseService.updateStatus(id, status),
        onSuccess: (_data, variables) => {
            const msg = variables.status === 'ACTIVE' ? 'Exercise activated successfully' : 'Exercise deactivated successfully';
            message.success(msg);
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
        onError: (error: any) => {
            message.error('Failed to update status');
            console.error(error);
        }
    });

    return {
        createExercise,
        updateExercise,
        deleteExercise,
        updateExerciseStatus
    };
};
