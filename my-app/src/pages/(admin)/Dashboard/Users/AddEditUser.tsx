import { useEffect } from 'react';
import { Form, Button, Input, Card, Select } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../../../services/user.service';
import { roleService } from '../../../../../services/role.service';
import { useUserMutations } from './useUserMutations';

const AddEditUser = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isEditMode = !!id;
    const isViewMode = searchParams.get('view') === 'true';
    
    // Hooks
    const { createUser, updateUser } = useUserMutations();

    // Fetch Roles for dropdown
    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: roleService.getRoles
    });

    // Fetch User Data if Edit Mode
    const { data: userData, isLoading: isLoadingUser } = useQuery({
        queryKey: ['user', id],
        queryFn: () => userService.getUserById(id!),
        enabled: isEditMode
    });

    useEffect(() => {
        if (userData) {
            form.setFieldsValue({
                ...userData,
                role_id: userData.role?.id || userData.role_id // Ensure role_id is mapped
            });
        }
    }, [userData, form]);

    const handleSubmit = async (values: any) => {
        if (isViewMode) return; // Should not happen if button hidden
        if (isEditMode && id) {
            updateUser.mutate({ id, data: values });
        } else {
            createUser.mutate(values);
        }
    };

    const loading = isLoadingUser || createUser.isPending || updateUser.isPending;

    return (
        <div className="p-6">
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/dashboard/users')}
                className="mb-4"
            >
                Back to List
            </Button>

            <Card title={isViewMode ? 'View User Details' : (isEditMode ? 'Edit User' : 'Add New User')} className="shadow-md">
                <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={isViewMode}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                            <Input placeholder="Enter username" disabled={isEditMode} />
                        </Form.Item>

                        <Form.Item 
                            name="email" 
                            label="Email" 
                            rules={[{ required: true, type: 'email' }]}
                        >
                            <Input placeholder="Enter email" />
                        </Form.Item>

                        <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
                            <Input placeholder="Enter full name" />
                        </Form.Item>

                        <Form.Item name="role_id" label="Role" rules={[{ required: true }]}>
                            <Select placeholder="Select Role">
                                {roles.map((role: any) => (
                                    <Select.Option key={role.id} value={role.id}>
                                        {role.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        
                        {!isEditMode && (
                             <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                                <Input.Password placeholder="Enter password" />
                            </Form.Item>
                        )}


                    </div>

                    {!isViewMode && (
                        <div className="flex justify-end mt-4">
                            <Button type="primary" htmlType="submit" loading={loading} size="large">
                                {isEditMode ? 'Update User' : 'Create User'}
                            </Button>
                        </div>
                    )}
                </Form>
            </Card>
        </div>
    );
};

export default AddEditUser;
