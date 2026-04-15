import { Outlet } from 'react-router-dom';
import { Layout, theme } from 'antd';
import MenuSidebar from '../../../components/layout/Menu';
import HeaderCommon from '../../../components/layout/Header';

import DashboardBreadcrumb from '../../../components/layout/DashboardBreadcrumb';

const { Content } = Layout;

function MainDashboard() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="min-h-screen">
      <MenuSidebar />
      <Layout>
        {/* We can reuse the common header or create a specific dashboard header */}
        <HeaderCommon /> 
        <DashboardBreadcrumb />
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainDashboard;
