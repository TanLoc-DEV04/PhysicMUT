import { Modal, Form, DatePicker, Select } from 'antd';
import { useEffect } from 'react';
import RenderFormItem from './RenderFormItem';
import { useUpdateAndAddAdmin } from './useUpdateAndAddAdmin';
import { useQuery } from '@tanstack/react-query';
import { roleService } from '../../../services/roleService';

interface AddAdminModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: any;
}

const AddAdminModal = ({ visible, onCancel, onSuccess, initialValues }: AddAdminModalProps) => {
  const [form] = Form.useForm();
  const { addAdmin, updateAdmin, loading } = useUpdateAndAddAdmin(onSuccess);

  // Fetch Roles
  const { data: roles = [] } = useQuery({
      queryKey: ['roles'],
      queryFn: roleService.getRoles
  });

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
            ...initialValues,
            // If initialValues has role object, map it. If it has role_id, good.
            // The form likely expects role_name or role_id depending on backend.
            // Let's assume we send role_id for robustness if possible, or name.
            // The existing code used role_name. Let's stick to name for now or switch to ID if backend supports it better.
            // Backend createUser takes role_id OR role_name.
            role_name: initialValues.role?.name || initialValues.role_name
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // If we use Select with role name values, values.role_name will be the name.
      // If we use ID, we need to send role_id.
      // Let's use role name as value in Select to match previous logic, or switch to ID?
      // Previous logic used role_name.
      if (initialValues) {
        await updateAdmin(initialValues.id, values);
      } else {
        await addAdmin(values);
      }
      onCancel();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Admin' : 'Add New Admin'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <RenderFormItem label="Admin Name" name="full_name" required placeholder="Enter admin name" />
        <RenderFormItem label="Email" name="email" type="email" required placeholder="Enter email" />
        
        <Form.Item 
            label="Role Name" 
            name="role_name" 
            rules={[{ required: true, message: 'Please select a role' }]}
        >
            <Select placeholder="Select role">
                {roles.map((role: any) => (
                    <Select.Option key={role.id} value={role.name}>
                        {role.name}
                    </Select.Option>
                ))}
            </Select>
        </Form.Item>

        <Form.Item name="dob" label="Date of Birth" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
        <RenderFormItem label="Phone Number" name="phone_number" required placeholder="Enter phone number" />
      </Form>
    </Modal>
  );
};

export default AddAdminModal;
