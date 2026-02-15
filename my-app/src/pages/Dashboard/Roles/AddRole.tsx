import { Form, Input, Button, Checkbox, Card, Row, Col } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roleService } from '../../../services/roleService';
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
      title: '3D Model Management',
      options: [
          { label: 'View List', value: 'view_model_list' },
          { label: 'Add Model', value: 'add_model' },
          { label: 'Edit Model', value: 'edit_model' },
          { label: 'Delete Model', value: 'delete_model' },
      ]
  }
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
      form.setFieldsValue(roleData);
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
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Card className="mb-4">
            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item name="name" label="Role Name" rules={[{ required: true, message: 'Please enter role name' }]}>
                        <Input placeholder="e.g. Teacher" />
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
            {isEditMode ? 'Update Role' : 'Save Role'}
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
