import { Form, Input } from 'antd';

// In a real app, this would be a Rich Text Editor like ReactQuill or TinyMCE
// For now, we use a TextArea as a placeholder for "Content Management"
interface InputFormProps {
    label?: string;
    name: string;
    required?: boolean;
    placeholder?: string;
}

const InputForm = ({ label = "Nội dung", name, required = true, placeholder = "Nhập nội dung chi tiết (công thức, văn bản...)" }: InputFormProps) => {
    return (
        <Form.Item 
            label={label} 
            name={name} 
            rules={[{ required, message: 'Vui lòng nhập nội dung' }]}
        >
            <Input.TextArea 
                rows={10} 
                placeholder={placeholder}
                className="font-mono text-sm"
            />
        </Form.Item>
    );
};

export default InputForm;
