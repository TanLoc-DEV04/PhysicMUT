import { Form, Input, Select, DatePicker } from 'antd';

interface FormItemProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'select' | 'date';
  required?: boolean;
  options?: { label: string; value: any }[];
  placeholder?: string;
}

const RenderFormItem = ({ label, name, type = 'text', required = false, options = [], placeholder }: FormItemProps) => {
  const rules = required ? [{ required: true, message: `Vui lòng nhập ${label.toLowerCase()}` }] : [];

  let inputNode;
  switch (type) {
    case 'select':
      inputNode = <Select options={options} placeholder={placeholder} />;
      break;
    case 'password':
      inputNode = <Input.Password placeholder={placeholder} />;
      break;
    case 'date':
      inputNode = <DatePicker style={{ width: '100%' }} placeholder={placeholder} />;
      break;
    default:
      inputNode = <Input placeholder={placeholder} />;
  }

  return (
    <Form.Item label={label} name={name} rules={rules}>
      {inputNode}
    </Form.Item>
  );
};

export default RenderFormItem;
