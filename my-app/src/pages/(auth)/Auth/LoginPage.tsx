import { Form, Input, Button, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { authService } from '../../../services/auth.service';
import { useAuth } from '../../../contexts/AuthContext';
import { GoogleLogin } from "@react-oauth/google";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await authService.googleLogin(
        credentialResponse.credential,
      );
      const apiUser = response.user;
      const roleName =
        typeof apiUser.role === "object"
          ? (apiUser.role as any).name?.toLowerCase()
          : apiUser.role;
      const mappedUser = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.full_name || apiUser.username || "",
        role: apiUser.role, // Maintain the entire role object
        avatar: "/assets/home/avatar.png",
      };
      login(mappedUser as any);
      localStorage.setItem("token", response.token || "");
      message.success("Đăng nhập Google thành công!");
      // Redirect logic based on generic permissions or fallback
      const hasDashboardAccess = (apiUser.role as any)?.permissions?.['Dashboard']?.includes('view_dashboard') || roleName === "admin";
      
      if (hasDashboardAccess) {
        navigate("/dashboard");
      } else {
        navigate("/models");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      message.error(
        error.response?.data?.error || "Đăng nhập bằng Google thất bại.",
      );
    }
  };

  const handleGoogleFailure = () => {
    message.error("Kết nối Google thất bại!");
  };

  const onFinish = async (values: any) => {
    try {
      const response = await authService.login(
        values.username,
        values.password,
      );

      // Map API response to AuthContext User type
      const apiUser = response.user;
      const roleName =
        typeof apiUser.role === "object"
          ? (apiUser.role as any).name?.toLowerCase()
          : apiUser.role;
      const mappedUser = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.full_name || apiUser.username || "",
        role: apiUser.role, // Maintain the entire role object
        avatar: "/assets/home/avatar.png",
      };

      // Use context login to update state and localStorage
      login(mappedUser as any);
      localStorage.setItem("token", response.token || "");

      message.success("Đăng nhập thành công");

      // Redirect based on generic permissions or fallback
      const hasDashboardAccess = (apiUser.role as any)?.permissions?.['Dashboard']?.includes('view_dashboard') || roleName === "admin" || (apiUser.role as any)?.permissions?.all === true;

      if (hasDashboardAccess) {
        navigate("/dashboard");
      } else {
        navigate("/models");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      message.error(
        error.response?.data?.error ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản",
      );
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
            rules={[{ required: true, message: "Vui lòng nhập Username!" }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username / Email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập Mật khẩu!" }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>

            <Link className="float-right text-[#0f6cbf]" to="/forgot-password">
              Quên mật khẩu?
            </Link>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-[#0f6cbf]"
            >
              Đăng nhập
            </Button>
            <div
              className="mt-4 text-center mt-3 flex justify-center w-full"
              style={{ marginTop: "15px" }}
            >
              <span>Chưa có tài khoản? </span>
              <Link
                to="/register"
                className="text-[#0f6cbf] hover:underline"
                style={{ marginLeft: "0.5rem" }}
              >
                Đăng ký
              </Link>
            </div>

            <div
              className="mt-6 border-t pt-4 text-center w-full"
              style={{
                marginTop: "20px",
                borderTop: "1px solid #ddd",
                paddingTop: "15px",
              }}
            >
              <p
                className="text-gray-500 mb-4 text-sm"
                style={{ marginBottom: "10px" }}
              >
                Hoặc đăng nhập nhanh bằng:
              </p>
              <div className="flex justify-center" id="google-signin-btn">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                />
              </div>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default LoginPage;
