import { useState, useMemo } from "react";
import { Layout, Menu, Button } from "antd";
import {
  DashboardOutlined,
  UsergroupAddOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  CodeSandboxOutlined,
  ReadOutlined,
  FileTextOutlined,
  FormOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import type { MenuProps } from "antd";
import { useAuth } from "../../contexts/AuthContext";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number] & { permission?: string };

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  permission?: string,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    permission,
  } as MenuItem;
}

const allItems: MenuItem[] = [
  getItem("Dashboard", "/dashboard", <DashboardOutlined />, "view_dashboard"),
  getItem("Admin Management", "/dashboard/admins", <UsergroupAddOutlined />, "view_admin_list"),
  getItem("Role Management", "/dashboard/roles", <SafetyCertificateOutlined />, "view_role_list"),
  getItem("User Management", "/dashboard/users", <UserOutlined />, "view_user_list"),
  getItem("3D Model Management", "/dashboard/3d-models", <CodeSandboxOutlined />, "view_model_list"),
  getItem("Theory Management", "/dashboard/theory", <ReadOutlined />, "view_theory_list"),
  getItem("Example Management", "/dashboard/examples", <FileTextOutlined />, "view_example_list"),
  getItem("Exercise Management", "/dashboard/exercises", <FormOutlined />, "view_exercise_list"),
];

function MenuSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (!item.permission) return true;
      return hasPermission(item.permission);
    });
  }, [hasPermission]);

  const onClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      theme="dark"
      width={250}
      className="overflow-auto min-h-screen left-0 top-0 bottom-0 shadow-xl"
      trigger={null}
    >
      <div className="h-16 flex items-center justify-center m-4 bg-white/10 rounded-lg">
        {collapsed ? (
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
        ) : (
          <span className="text-white font-bold text-xl truncate px-2">
            PhysicMUT Admin
          </span>
        )}
      </div>

      <div className="flex justify-center mb-4">
        <Button
          type="text"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        />
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={filteredItems}
        onClick={onClick}
      />
    </Sider>
  );
}

export default MenuSidebar;
