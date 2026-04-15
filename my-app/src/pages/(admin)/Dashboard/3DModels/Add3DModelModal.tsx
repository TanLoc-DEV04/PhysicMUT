import { Modal, Form, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import RenderFormItem from '../../../Admin/RenderFormItem'; // Reuse shared component

interface Add3DModelModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: any;
}

const Add3DModelModal = ({ visible, onCancel, onSuccess, initialValues }: Add3DModelModalProps) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Submitting Model:', values);
      message.success('Lưu Mô hình thành công');
      onSuccess();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Modal
      title={initialValues ? 'Chỉnh sửa Mô hình 3D' : 'Thêm Mô hình 3D mới'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={700}
    >
      <Form form={form} layout="vertical">
        <RenderFormItem label="Tên Mô hình" name="name" required placeholder="Nhập tên mô hình" />
        <RenderFormItem label="Loại Mô hình" name="category" type="select" required options={[
            { label: 'Cơ học', value: 'Mechanics' },
            { label: 'Điện từ', value: 'Electromagnetism' },
            { label: 'Quang học', value: 'Optics' }
        ]} />
         <RenderFormItem 
            label="Trạng thái" 
            name="status" 
            type="select" 
            required 
            options={[
                { label: 'Active', value: 'active' }, 
                { label: 'Inactive', value: 'inactive' }
            ]} 
        />
        
        <Form.Item
            name="thumbnail"
            label="Hình nền (Thumbnail)"
            valuePropName="fileList"
            getValueFromEvent={normFile}
        >
            <Upload name="logo" action="/upload.do" listType="picture">
                <Button icon={<UploadOutlined />}>Click to upload image</Button>
            </Upload>
        </Form.Item>

         <Form.Item
            name="modelFile"
            label="File Mô hình (GLTF/GLB)"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: !initialValues, message: 'Vui lòng upload file mô hình' }]}
        >
            <Upload name="file" action="/upload.do">
                <Button icon={<UploadOutlined />}>Click to upload GLB/GLTF</Button>
            </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Add3DModelModal;
