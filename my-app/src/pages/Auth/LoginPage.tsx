import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: any) => {
    try {
        const response = await authService.login(values.username, values.password);
        
        // Map API response to AuthContext User type
        const apiUser = response.user;
        const roleName = typeof apiUser.role === 'object' ? (apiUser.role as any).name?.toLowerCase() : apiUser.role;
        
        const mappedUser = {
            id: apiUser.id,
            email: apiUser.email,
            name: apiUser.full_name || apiUser.username || '',
            role: roleName, // Ensure this matches 'student' | 'teacher' | 'admin' if possible, or string
            avatar: '/assets/home/avatar.png', // Default avatar since API might not return it
        };

        // Use context login to update state and localStorage
        login(mappedUser as any); // Cast to any to avoid strict type checks if types slightly differ, but mappedUser aligns better now.
        
        // Also save token (AuthContext might not handle token yet broadly, but login clears it on logout)
        localStorage.setItem('token', response.access_token);
        
        message.success('Đăng nhập thành công');
        
        // Redirect based on role
        if (roleName === 'admin' || roleName === 'Admin') { 
            navigate('/dashboard');
        } else {
            navigate('/models');
        }
    } catch (error: any) {
        console.error('Login error:', error);
        message.error(error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#0f6cbf]">PhysicMUT</h1>
            <p className="text-gray-500">Đăng nhập hệ thống</p>
        </div>
        
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username / Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Ghi nhớ đặng nhập</Checkbox>
            </Form.Item>

            <Link className="float-right text-[#0f6cbf]" to="/forgot-password">
              Quên mật khẩu?
            </Link>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-[#0f6cbf]">
              Đăng nhập
            </Button>

          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default LoginPage;
