import { Form, Input, Button, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

function ForgotPage() {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
    message.success('Mã OTP đã được gửi đến email của bạn');
    navigate('/otp'); // Mock flow
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <Link to="/login" className="mb-4 inline-block text-gray-500 hover:text-[#0f6cbf]">
            <ArrowLeftOutlined /> Quay lại
        </Link>
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#0f6cbf]">Quên Mật Khẩu</h1>
            <p className="text-gray-500">Nhập email để nhận mã OTP</p>
        </div>
        
        <Form
          name="forgot-password"
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[
                { required: true, message: 'Vui lòng nhập Email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-[#0f6cbf]">
              Gửi OTP
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default ForgotPage;
