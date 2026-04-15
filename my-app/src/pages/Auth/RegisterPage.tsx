import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../contexts/AuthContext";
import { message } from "antd";
import { GoogleLogin } from "@react-oauth/google";

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
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
        role: roleName,
        avatar: "/assets/home/avatar.png",
      };

      login(mappedUser as any);
      localStorage.setItem("token", response.token || "");
      message.success("Đăng nhập Google thành công!");

      if (roleName === "admin" || roleName === "Admin") {
        navigate("/dashboard");
      } else {
        navigate("/models");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      message.error(
        error.response?.data?.error || "Đăng nhập bằng Google thất bại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    message.error("Kết nối Google thất bại!");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullname = formData.get("fullname") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      setLoading(true);
      const response = await authService.register({
        username: email, // Use email as username
        email,
        password,
        full_name: fullname,
      });

      // Map and auto-login
      const apiUser = response.user;
      const roleName =
        typeof apiUser.role === "object"
          ? (apiUser.role as any).name?.toLowerCase()
          : apiUser.role;
      const mappedUser = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.full_name || apiUser.username || "",
        role: roleName,
        avatar: "/assets/home/avatar.png",
      };

      login(mappedUser as any);
      localStorage.setItem("token", response.token || "");

      message.success("Đăng ký tài khoản thành công!");
      navigate("/models");
    } catch (error: any) {
      console.error("Registration error:", error);
      message.error(
        error.response?.data?.error || "Đăng ký thất bại. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#0f6cbf]">PhysicMUT</h1>
          <p className="text-gray-500">Đăng ký tài khoản</p>
        </div>

        <form onSubmit={handleSubmit} method="post">
          <fieldset disabled={loading}>
            {/* Họ và Tên */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="fullname"
              >
                Họ và tên:
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f6cbf]"
                type="text"
                id="fullname"
                name="fullname"
                required
              />
            </div>

            {/* Email: Sử dụng type="email" của HTML5 */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="email"
              >
                Địa chỉ Email:
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f6cbf]"
                type="email"
                id="email"
                name="email"
                required
              />
            </div>

            {/* Mật khẩu: Sử dụng type="password" */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="password"
              >
                Mật khẩu:
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f6cbf]"
                type="password"
                id="password"
                name="password"
                required
              />
            </div>

            {/* Nút Submit */}
            <div>
              <button
                type="submit"
                className="w-full bg-[#0f6cbf] text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
              >
                {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
              </button>
            </div>

            <div className="mt-4 text-center text-sm">
              <span>Đã có tài khoản? </span>
              <Link to="/login" className="text-[#0f6cbf] hover:underline">
                Đăng nhập
              </Link>
            </div>
          </fieldset>
        </form>

        {/* Khu vực đăng nhập bằng mạng xã hội */}
        <div className="mt-6 border-t pt-4 text-center">
          <p className="text-gray-500 mb-4 text-sm">
            Hoặc đăng nhập nhanh bằng:
          </p>
          <div className="flex justify-center" id="google-signin-btn">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
