import { Form, Upload, Button, Input, Card } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import RenderFormItem from '../Admin/RenderFormItem';
import { useQuery } from '@tanstack/react-query';
import { model3DService } from '../../../services/model3DService';
import { use3DModelMutations } from './use3DModelMutations';

const AddEdit3DModel = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { typeName } = useParams();
  const isEditMode = !!typeName;
  
  const { createModel, updateModel } = use3DModelMutations();

  // Fetch Model Details
  const { data: modelData, isLoading: isLoadingModel } = useQuery({
    queryKey: ['model3d', typeName],
    queryFn: async () => {
        return await model3DService.getModels3D(null, typeName).then(all => 
            all.find((m: any) => m.model_type_name === typeName)
        );
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (modelData) {
        form.setFieldsValue({
            ...modelData,
        });
    }
  }, [modelData, form]);

  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    formData.append('model_type_name', values.model_type_name);
    formData.append('name', values.name);
    formData.append('description', values.description || '');
    formData.append('status', 'ACTIVE'); 
    
    // Handle Thumbnail
    if (values.thumbnail && values.thumbnail.length > 0) {
        const file = values.thumbnail[0].originFileObj;
        if (file) {
            formData.append('thumbnail', file);
        }
    }

    if (isEditMode && typeName) {
        updateModel.mutate({ typeName, data: formData });
    } else {
        createModel.mutate(formData);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const loading = isLoadingModel || createModel.isPending || updateModel.isPending;

  return (
    <div className="p-6">
       <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/dashboard/3d-models')}
        className="mb-4"
      >
        Back to List
      </Button>

      <Card title={isEditMode ? 'View/Edit 3D Model' : 'Add New 3D Model'} className="shadow-md">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RenderFormItem 
                    label="Model Type Name" 
                    name="model_type_name" 
                    required 
                    placeholder="e.g. CYCLOTRON" 
                    disabled={isEditMode}
                />
                
                <RenderFormItem label="Display Name" name="name" required placeholder="Enter model name" />

                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={4} placeholder="Enter description" />
                </Form.Item>

                {isEditMode && (
                    <Form.Item name="updated_at" label="Last Update">
                        <Input disabled />
                    </Form.Item>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Form.Item
                    name="thumbnail"
                    label="Thumbnail Image"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                >
                    <Upload 
                        beforeUpload={() => false} 
                        listType="picture" 
                        maxCount={1}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />}>Select Thumbnail</Button>
                    </Upload>
                </Form.Item>
            </div>

            <div className="flex justify-end mt-4">
                 <Button type="primary" htmlType="submit" loading={loading} size="large">
                    {isEditMode ? 'Update Model' : 'Save Model'}
                 </Button>
            </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddEdit3DModel;
