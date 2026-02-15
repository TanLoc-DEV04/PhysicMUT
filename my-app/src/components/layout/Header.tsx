import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layout, Row, Col, Avatar, Button, Dropdown, Modal } from 'antd';
import {
  CaretDownFilled,
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
const { Header } = Layout;
const { confirm } = Modal;

function HeaderCommon() {
  const { currentUser, logout: contextLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const showLogoutConfirm = () => {
    confirm({
      title: 'Are you sure you want to logout?',
      icon: <ExclamationCircleFilled />,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk() {
        contextLogout();
        navigate('/login');
      },
    });
  };

  const itemsUser = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: <Link to="/profile">My Profile</Link>,
    },
    {
      key: '2',
      icon: <LockOutlined />,
      label: <Link to="/change-password">Change Password</Link>,
    },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: showLogoutConfirm,
    },
  ];

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <Header className="bg-[#0f6cbf] px-4 h-16 leading-none flex items-center shadow-md z-50 sticky top-0">
      <Row align="middle" justify="space-between" className="w-full">
        {/* Left Section: Logo + Text - Hidden on Dashboard */}
        {!isDashboard && (
            <Col className="flex items-center gap-3">
            <img src="/logo.png" className="w-[83px] h-[64px] object-contain" alt="Logo" />
            <span className="text-[25px] font-bold text-white font-russo tracking-wide">PhysicMUT</span>
            
            {/* Navigation Links - integrated here for layout balance */}
            {/* Navigation Links - integrated here for layout balance */}
            {/* Navigation Links - REMOVED for focused flow */}
            <div className="flex gap-4 ml-8 text-white items-center">
                {/* Links removed as per refactoring plan */}
            </div>
            </Col>
        )}
        
        {/* If dashboard, we might want an empty col to keep spacing or just nothing. 
            If Flex space-between is used, finding one child might shift it. 
            If isDashboard is true, left side is empty. Right side will be pushed to end because of justify="space-between". 
            So this is fine.
        */}
        {isDashboard && <Col></Col>}


        {/* Right Section: Avatar + Email/Role + Dropdown - Only if Logged In */}
        <Col className="flex items-center gap-[12px]">
          {currentUser ? (
              <>
                <Avatar 
                    size="large" 
                    src="/assets/home/avatar.png" 
                    icon={<UserOutlined />} 
                    className="border-2 border-white"
                />
                <div className="flex flex-col leading-[1.2] text-right">
                    <span className="font-bold text-white text-[14px]">
                    {currentUser.email}
                    </span>
                    <span className="text-[12px] text-gray-200 uppercase">
                    {typeof currentUser.role === 'object' ? (currentUser.role as any).name : currentUser.role || 'N/A'}
                    </span>
                </div>
                <div>
                    <Dropdown
                    menu={{ items: itemsUser }}
                    trigger={['click']}
                    arrow
                    placement="bottomRight"
                    >
                    <Button
                        icon={<CaretDownFilled className="text-white text-lg" />}
                        type="text"
                        className="flex items-center justify-center hover:bg-white/10"
                    />
                    </Dropdown>
                </div>
              </>
          ) : (
              // Empty if not logged in
              <div className="w-[100px]"></div> 
          )}
        </Col>
      </Row>
    </Header>
  );
}

export default HeaderCommon;
