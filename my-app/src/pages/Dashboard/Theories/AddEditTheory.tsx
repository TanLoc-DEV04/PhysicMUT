import { Form, Button, Input, Card, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import RenderFormItem from '../Admin/RenderFormItem';
import { useQuery } from '@tanstack/react-query';
import { model3DService } from '../../../services/model3DService';
import { theoryService } from '../../../services/theoryService';
import { useTheoryMutations } from './useTheoryMutations';
import { use3DModelTypes } from '../3DModels/use3DModelManagement';
import MathJaxPreview from '../../../components/shared/MathJaxPreview';

const AddEditTheory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('1');
  const { id } = useParams();
  const isEditMode = !!id;

  const { createTheory, updateTheory } = useTheoryMutations();
  const { types: categoryOptions, loadingTypes: loadingCategories } = use3DModelTypes();

  // Fetch 3D Models to associate with theory
  const { data: models = [] } = useQuery({
    queryKey: ['models3d'],
    queryFn: () => model3DService.getModels3D()
  });

  // Fetch Theory Details
  const { data: theoryData, isLoading: isLoadingTheory } = useQuery({
    queryKey: ['theory', id],
    queryFn: async () => {
        const all = await theoryService.getTheories(); 
        return all.find((t: any) => String(t.id) === String(id));
    },
    enabled: isEditMode,
  });

  // Prepare models for selection
  const modelOptions = (models || []).map((m: any) => ({
      label: m.name || m.model_type_name,
      value: m.model_type_name
  }));

  useEffect(() => {
    if (theoryData) {
        form.setFieldsValue({
            ...theoryData,
            name: theoryData.title,
            content: theoryData.content_html // Map backend content_html to form name 'content'
        });
    }
  }, [theoryData, form]);

  const handleSubmit = async (values: any) => {
    // Map UI 'name' to 'title' if needed
    const submissionData = {
        ...values,
        title: values.name, 
        content_html: values.content 
    };

    if (isEditMode && id) {
        updateTheory.mutate({ id, data: submissionData });
    } else {
        createTheory.mutate(submissionData);
    }
  };

  const loading = isLoadingTheory || createTheory.isPending || updateTheory.isPending;

  return (
    <div className="p-6">
       <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/dashboard/theory')}
        className="mb-4"
      >
        Back to List
      </Button>

      <Card title={isEditMode ? 'View/Edit Theory' : 'Add New Theory'} className="shadow-md">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RenderFormItem 
                    label="3D Model" 
                    name="model_type_name" 
                    type="select" 
                    required 
                    options={modelOptions} 
                    placeholder="Select 3D Model"
                />

                <RenderFormItem 
                    label="Theory Title" 
                    name="name" 
                    type="text"
                    required 
                    placeholder="Enter Theory Title"
                />

                <RenderFormItem 
                    label="Scientific Category" 
                    name="theory_type_name" 
                    type="select" 
                    required 
                    options={categoryOptions.map((t: string) => ({ label: t, value: t }))} 
                    loading={loadingCategories}
                    placeholder="Select Scientific Category"
                />

                <RenderFormItem 
                    label="Type" 
                    name="type" 
                    type="select" 
                    required 
                    options={[
                        { label: 'General', value: 'General' },
                        { label: 'Formula', value: 'Formula' }
                    ]} 
                    placeholder="Select Type"
                />
                
                {isEditMode && (
                    <Form.Item name="updated_at" label="Last Update">
                         <Input disabled />
                    </Form.Item>
                )}


            </div>

            <div className="mb-4">
                <label className="block mb-2 font-medium">Theory Content (HTML with MathJax)</label>
                <Tabs 
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: '1',
                            label: 'Edit HTML',
                            children: (
                                <Form.Item name="content" noStyle rules={[{ required: true }]}>
                                    <Input.TextArea 
                                        rows={15} 
                                        placeholder="Enter theory content here... Use normal HTML and LaTeX for math (e.g. $$ E=mc^2 $$)" 
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                </Form.Item>
                            )
                        },
                        {
                            key: '2',
                            label: 'Preview',
                            children: <MathJaxPreview form={form} name="content" />
                        }
                    ]}
                />
            </div>

            <div className="flex justify-end mt-4 gap-2">
                 <Button 
                    type="default" 
                    size="large" 
                    onClick={() => setActiveTab('2')}
                 >
                    Preview Data
                 </Button>
                 <Button type="primary" htmlType="submit" loading={loading} size="large">
                    {isEditMode ? 'Update Theory' : 'Save Theory'}
                 </Button>
            </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditTheory;
