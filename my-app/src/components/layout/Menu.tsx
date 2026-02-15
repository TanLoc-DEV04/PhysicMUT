import { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
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
  MenuFoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('Dashboard', '/dashboard', <DashboardOutlined />),
  getItem('Admin Management', '/dashboard/admins', <UsergroupAddOutlined />),
  getItem('Role Management', '/dashboard/roles', <SafetyCertificateOutlined />),
  getItem('User Management', '/dashboard/users', <UserOutlined />),
  getItem('3D Model Management', '/dashboard/3d-models', <CodeSandboxOutlined />),
  getItem('Theory Management', '/dashboard/theory', <ReadOutlined />),
  getItem('Example Management', '/dashboard/examples', <FileTextOutlined />),
  getItem('Exercise Management', '/dashboard/exercises', <FormOutlined />),
];

function MenuSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onClick: MenuProps['onClick'] = (e) => {
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
             <span className="text-white font-bold text-xl truncate px-2">PhysicMUT Admin</span>
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
        items={items}
        onClick={onClick}
      />
    </Sider>
  );
}

export default MenuSidebar;
