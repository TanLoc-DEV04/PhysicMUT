import { Form, Input, Button, message } from 'antd';
import { SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

function OtpPage() {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log('Received OTP: ', values);
    if (values.otp === '123456') { // Mock OTP
        message.success('Xác thực thành công');
        navigate('/reset-password');
    } else {
        message.error('Mã OTP không đúng');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <Link to="/forgot-password" className="mb-4 inline-block text-gray-500 hover:text-[#0f6cbf]">
             <ArrowLeftOutlined /> Quay lại
        </Link>
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#0f6cbf]">Nhập OTP</h1>
            <p className="text-gray-500">Mã OTP đã được gửi đến email</p>
        </div>
        
        <Form onFinish={onFinish}>
          <Form.Item
            name="otp"
            rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}
          >
            <Input prefix={<SafetyCertificateOutlined />} placeholder="Nhập mã OTP (123456)" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-[#0f6cbf]">
              Xác thực
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default OtpPage;
