import { Modal, Form, Input, Select, Switch } from 'antd';
import { useEffect } from 'react';
import { useUpdateAndAddAdmin } from './hooks/useUpdateAndAddAdmin';
import { useQuery } from '@tanstack/react-query';
import { roleService } from '../../../../services/role.service';

interface AddAdminModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: any;
}

const DEPARTMENTS = [
  'Administration',
  'Academic',
  'Content & Media',
  '3D Lab',
  'IT & Technical',
  'HR & Operations',
  'Other',
];

const AddAdminModal = ({ visible, onCancel, onSuccess, initialValues }: AddAdminModalProps) => {
  const [form] = Form.useForm();
  const isEditMode = !!initialValues;
  const { addAdmin, updateAdmin, loading } = useUpdateAndAddAdmin(onSuccess);

  // Fetch only admin-level active roles
  const { data: adminRoles = [] } = useQuery({
      queryKey: ['adminRoles'],
      queryFn: roleService.getAdminRoles,
  });

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
            full_name: initialValues.full_name,
            email: initialValues.email,
            username: initialValues.username,
            role_name: initialValues.role?.name || initialValues.role_name,
            department: initialValues.department,
            is_active: initialValues.is_active !== false,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ is_active: true });
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEditMode) {
        await updateAdmin(initialValues.id, values);
      } else {
        await addAdmin(values);
      }
      onCancel();
    } catch (error) {
      // Validation errors are shown inline — no need to handle here
    }
  };

  return (
    <Modal
      title={isEditMode ? 'Edit Admin' : 'Add New Admin'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={isEditMode ? 'Update' : 'Add New'}
      cancelText="Hủy"
      width={600}
    >
      <Form form={form} layout="vertical" className="mt-4">
        
        {/* Full Name */}
        <Form.Item
          label="Full Name"
          name="full_name"
          rules={[{ required: true, message: 'Please enter full name' }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Email is not in the correct format' },
          ]}
        >
          <Input type="email" placeholder="example@physicmut.com" disabled={isEditMode} />
        </Form.Item>

        {/* Username */}
        <Form.Item
          label="Username"
          name="username"
          rules={[
            { required: true, message: 'Please enter username' },
            { min: 3, message: 'Username must be at least 3 characters' },
          ]}
        >
          <Input placeholder="Enter username (no spaces)" disabled={isEditMode} />
        </Form.Item>

        {/* Password — only shown when adding */}
        {!isEditMode && (
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter password (at least 6 characters)" />
          </Form.Item>
        )}

        {/* Role — only admin roles */}
        <Form.Item
          label="Role"
          name="role_name"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select placeholder="Select an admin role">
            {adminRoles.map((role: any) => (
              <Select.Option key={role.id} value={role.name}>
                {role.name}
                {role.description && ` — ${role.description}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Department */}
        <Form.Item label="Department" name="department">
          <Select placeholder="Select a department (optional)" allowClear>
            {DEPARTMENTS.map((dept) => (
              <Select.Option key={dept} value={dept}>{dept}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Status */}
        <Form.Item label="Account Status" name="is_active" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default AddAdminModal;
