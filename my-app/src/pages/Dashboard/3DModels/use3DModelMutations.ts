import { useMutation, useQueryClient } from '@tanstack/react-query';
import { model3DService } from '../../../services/model3DService';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

export const use3DModelMutations = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const createModel = useMutation({
        mutationFn: model3DService.createModel3D,
        onSuccess: () => {
            message.success('Model created successfully');
            queryClient.invalidateQueries({ queryKey: ['models3d'] });
            navigate('/dashboard/3d-models');
        },
        onError: (error: any) => {
            message.error('Failed to create model');
            console.error(error);
        }
    });

    const updateModel = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => model3DService.updateModel3D(id, data),
        onSuccess: () => {
            message.success('Model updated successfully');
            queryClient.invalidateQueries({ queryKey: ['models3d'] });
            navigate('/dashboard/3d-models');
        },
        onError: (error: any) => {
            message.error('Failed to update model');
            console.error(error);
        }
    });

    const deleteModel = useMutation({
        mutationFn: model3DService.deleteModel3D,
        onSuccess: () => {
            message.success('Model deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['models3d'] });
        },
        onError: (error: any) => {
            message.error('Failed to delete model');
            console.error(error);
        }
    });

    const updateModelStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => {
             // For status update, we might need a workaround if main update requires FormData
             // But if passing plain object works for partial updates or if we use a specific endpoint
             // Assuming updateModel3D checks if data is FormData or JSON
             // If service forces Content-Type multipart/form-data for all updates, we need to wrap status in FormData
             const formData = new FormData();
             formData.append('status', status);
             return model3DService.updateModel3D(id, formData);
        },
        onSuccess: () => {
            message.success('Model status updated');
            queryClient.invalidateQueries({ queryKey: ['models3d'] });
        },
        onError: (error: any) => {
            message.error('Failed to update status');
            console.error(error);
        }
    });

    return {
        createModel,
        updateModel,
        deleteModel,
        updateModelStatus
    };
};
