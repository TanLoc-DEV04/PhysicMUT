import { Form, Input, Button, Checkbox, Card, Row, Col, Switch } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roleService } from '../../../services/role.service';
import { useRoleMutations } from './useRoleMutations';

const permissionGroups = [
  {
    title: 'Dashboard',
    options: [
        { label: 'View Dashboard', value: 'view_dashboard' }
    ]
  },
  {
    title: 'Admin Management',
    options: [
      { label: 'View Admin List', value: 'view_admin_list' },
      { label: 'View Admin Details', value: 'view_admin_details' },
      { label: 'Add New Admin', value: 'add_new_admin' },
      { label: 'Edit Admin', value: 'edit_admin' },
      { label: 'Delete Admin', value: 'delete_admin' },
    ],
  },
  {
    title: 'Role Management',
    options: [
      { label: 'View Role List', value: 'view_role_list' },
      { label: 'Add New Role', value: 'add_role' },
      { label: 'Edit Role', value: 'edit_role' },
      { label: 'Delete Role', value: 'delete_role' },
    ],
  },
  {
    title: 'Theory Management',
    options: [
      { label: 'View Theory List', value: 'view_theory_list' },
      { label: 'Add New Theory', value: 'add_theory' },
      { label: 'Edit Theory', value: 'edit_theory' },
      { label: 'Delete Theory', value: 'delete_theory' },
    ],
  },
  {
    title: 'Example Management',
    options: [
      { label: 'View Example List', value: 'view_example_list' },
      { label: 'Add New Example', value: 'add_example' },
      { label: 'Edit Example', value: 'edit_example' },
      { label: 'Delete Example', value: 'delete_example' },
    ],
  },
  {
    title: 'Exercise Management',
    options: [
      { label: 'View Exercise List', value: 'view_exercise_list' },
      { label: 'Add New Exercise', value: 'add_exercise' },
      { label: 'Edit Exercise', value: 'edit_exercise' },
      { label: 'Delete Exercise', value: 'delete_exercise' },
    ],
  },
  {
      title: '3D Model Management',
      options: [
          { label: 'View 3D Model List', value: 'view_model_list' },
          { label: 'Add New 3D Model', value: 'add_model' },
          { label: 'Edit 3D Model', value: 'edit_model' },
          { label: 'Delete 3D Model', value: 'delete_model' },
      ]
  },
  {
    title: 'User Management',
    options: [
      { label: 'View User List', value: 'view_user_list' },
      { label: 'Edit User', value: 'edit_user' },
      { label: 'Delete User', value: 'delete_user' },
    ],
  },
];

function AddRole() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { createRole, updateRole } = useRoleMutations();

  // Fetch Role Details
  const { data: roleData, isLoading: isLoadingRole } = useQuery({
    queryKey: ['role', id],
    queryFn: () => roleService.getRoleById(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (roleData) {
      form.setFieldsValue({
        ...roleData,
        is_active: roleData.is_active !== false, // default to true
      });
    }
  }, [roleData, form]);

  const onFinish = (values: any) => {
    if (isEditMode && id) {
        updateRole.mutate({ id, data: values });
    } else {
        createRole.mutate(values);
    }
  };

  const loading = isLoadingRole || createRole.isPending || updateRole.isPending;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit Role' : 'Add New Role'}</h2>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ is_active: true }}>
        <Card className="mb-4">
            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item name="name" label="Role Name" rules={[{ required: true, message: 'Please enter role name' }]}>
                        <Input placeholder="Example: TEACHER THEORY" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="description" label="Description">
                        <Input placeholder="Description of this role" />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="is_active" label="Status" valuePropName="checked">
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Col>
            </Row>
        </Card>

        {permissionGroups.map((group) => (
          <Card key={group.title} title={group.title} className="mb-4" size="small">
            <Form.Item name={['permissions', group.title]} noStyle>
              <Checkbox.Group style={{ width: '100%' }}>
                <Row>
                  {group.options.map((option) => (
                    <Col span={8} key={option.value}>
                      <Checkbox value={option.value}>{option.label}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Card>
        ))}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="mr-2">
            {isEditMode ? 'Update Role' : 'Add New Role'}
          </Button>
          <Button onClick={() => navigate('/dashboard/roles')}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default AddRole;
