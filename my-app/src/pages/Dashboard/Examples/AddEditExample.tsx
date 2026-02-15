import { Form, Button, Input, Card, Tabs } from 'antd';
import MathJaxPreview from '../../../components/shared/MathJaxPreview';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import RenderFormItem from '../Admin/RenderFormItem';
import { useQuery } from '@tanstack/react-query';
import { chapterService } from '../../../services/chapterService';
import { exampleService } from '../../../services/exampleService';
import { useExampleMutations } from './useExampleMutations';

const AddEditExample = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { createExample, updateExample } = useExampleMutations();

  // Fetch Chapters to get Lessons
  const { data: chapters = [] } = useQuery({
    queryKey: ['chapters'],
    queryFn: chapterService.getChapters
  });

  const lessons = chapters.flatMap((ch: any) => 
    (ch.lessons || []).map((l: any) => ({
        label: `${ch.name} - ${l.name}`,
        value: l.id
    }))
  );

  // Fetch Example Details
  const { data: exampleData, isLoading: isLoadingExample } = useQuery({
    queryKey: ['example', id],
    queryFn: async () => {
        const all = await exampleService.getExamples();
        return all.find((e: any) => String(e.id) === String(id));
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (exampleData) {
        form.setFieldsValue({
            ...exampleData,
            name: exampleData.title, 
        });
    }
  }, [exampleData, form]);

  const handleSubmit = async (values: any) => {
    const submissionData = {
        ...values,
        title: values.name, 
    };

    if (isEditMode && id) {
        updateExample.mutate({ id, data: submissionData });
    } else {
        createExample.mutate(submissionData);
    }
  };

  const loading = isLoadingExample || createExample.isPending || updateExample.isPending;

  return (
    <div className="p-6">
       <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/dashboard/examples')}
        className="mb-4"
      >
        Back to List
      </Button>

      <Card title={isEditMode ? 'View/Edit Example' : 'Add New Example'} className="shadow-md">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RenderFormItem 
                    label="Lesson" 
                    name="lesson_id" 
                    type="select" 
                    required 
                    options={lessons} 
                    placeholder="Select Lesson"
                />

                <RenderFormItem 
                    label="Example Title" 
                    name="name" 
                    type="text" 
                    required 
                    placeholder="Enter example title"
                />

                <RenderFormItem 
                    label="Type" 
                    name="type" 
                    type="select" 
                    required 
                    options={[
                        { label: 'Calculation', value: 'Calculation' },
                        { label: 'Theory Application', value: 'Application' }
                    ]} 
                    placeholder="Select Type"
                />

                <Form.Item name="reference" label="Reference">
                    <Input placeholder="e.g. SGK Page 45" />
                </Form.Item>

                {isEditMode && (
                    <Form.Item name="updated_at" label="Last Update">
                         <Input disabled />
                    </Form.Item>
                )}


            </div>

            <div className="mb-4">
                <label className="block mb-2 font-medium">Problem Statement (HTML with MathJax)</label>
                <Tabs 
                    defaultActiveKey="1"
                    items={[
                        {
                            key: '1',
                            label: 'Edit HTML',
                            children: (
                                <Form.Item name="problem" noStyle rules={[{ required: true }]}>
                                    <Input.TextArea 
                                        rows={6} 
                                        placeholder="Enter the problem statement... Use normal HTML and LaTeX for math (e.g. $$ E=mc^2 $$)" 
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                </Form.Item>
                            )
                        },
                        {
                            key: '2',
                            label: 'Preview',
                            children: <MathJaxPreview form={form} name="problem" placeholder="No problem statement to preview" />
                        }
                    ]}
                />
            </div>

            <div className="mb-4">
                <label className="block mb-2 font-medium">Solution (HTML with MathJax)</label>
                <Tabs 
                    defaultActiveKey="1"
                    items={[
                        {
                            key: '1',
                            label: 'Edit HTML',
                            children: (
                                <Form.Item name="solution" noStyle rules={[{ required: true }]}>
                                    <Input.TextArea 
                                        rows={10} 
                                        placeholder="Enter the solution... Use normal HTML and LaTeX for math" 
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                </Form.Item>
                            )
                        },
                        {
                            key: '2',
                            label: 'Preview',
                            children: <MathJaxPreview form={form} name="solution" placeholder="No solution to preview" />
                        }
                    ]}
                />
            </div>

            <div className="flex justify-end mt-4">
                 <Button type="primary" htmlType="submit" loading={loading} size="large">
                    {isEditMode ? 'Update Example' : 'Save Example'}
                 </Button>
            </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditExample;
