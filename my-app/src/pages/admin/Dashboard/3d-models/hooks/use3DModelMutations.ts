import { useMutation, useQueryClient } from '@tanstack/react-query';
import { model3DService } from '../../../../../services/models.service';
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
        mutationFn: ({ typeName, data }: { typeName: string; data: any }) => model3DService.updateModel3D(typeName, data),
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
        mutationFn: ({ typeName, status }: { typeName: string; status: string }) => model3DService.updateStatus(typeName, status),
        onSuccess: (_data, variables) => {
            const msg = variables.status === 'ACTIVE' ? 'Model activated successfully' : 'Model deactivated successfully';
            message.success(msg);
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
