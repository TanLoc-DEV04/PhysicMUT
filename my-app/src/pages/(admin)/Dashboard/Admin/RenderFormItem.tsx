import { Form, Input, Select, DatePicker } from 'antd';

interface FormItemProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'select' | 'date';
  required?: boolean;
  options?: { label: string; value: any }[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}

const RenderFormItem = ({ label, name, type = 'text', required = false, options = [], placeholder, loading, disabled }: FormItemProps) => {
  const rules = required ? [{ required: true, message: `Please enter ${label.toLowerCase()}` }] : [];

  let inputNode;
  switch (type) {
    case 'select':
      inputNode = <Select options={options} placeholder={placeholder} loading={loading} disabled={disabled} />;
      break;
    case 'password':
      inputNode = <Input.Password placeholder={placeholder} disabled={disabled} />;
      break;
    case 'date':
      inputNode = <DatePicker style={{ width: '100%' }} placeholder={placeholder} disabled={disabled} />;
      break;
    default:
      inputNode = <Input placeholder={placeholder} disabled={disabled} />;
  }

  return (
    <Form.Item label={label} name={name} rules={rules}>
      {inputNode}
    </Form.Item>
  );
};

export default RenderFormItem;
