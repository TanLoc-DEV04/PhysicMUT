import { useState, useMemo } from 'react';
import { Layout, Menu, Button, theme, Drawer, Spin, Result } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  ReadOutlined,
  ExperimentOutlined,
  BookOutlined,
  FileTextOutlined,
  FormOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import ModelRegistry from '../../components/3d-models/ModelRegistry';
import { HologramScene } from '../../components/physicmut-bot/HologramScene';
import ChatInterface from '../../components/physicmut-bot/ChatInterface';
import type { AvatarState } from '../../components/physicmut-bot/HoloAvatar';
import Theory from './Theory';
import ExampleExerciseTab from './ExampleExerciseTab';
import { useParams } from 'react-router-dom';
import { useModel3DByTypeName } from '../../hooks/useContent';

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return { key, icon, children, label, type } as MenuItem;
}

function MainModelDetail() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [botState, setBotState] = useState<AvatarState>('IDLE');

  // Route param is now typeName (model_type_name)
  const { typeName } = useParams<{ typeName: string }>();
  const { data: model, isLoading, error } = useModel3DByTypeName(typeName);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Build sidebar menu from model's linked content
  const items: MenuItem[] = useMemo(() => {
    if (!model) return [];

    const exampleItems = (model.examples || [])
      .filter((ex: any) => ex.status !== 'INACTIVE')
      .map((ex: any, index: number) =>
        getItem(`Bài ${index + 1}: ${ex.title || 'Bài tập'}`, `example-${ex.id}`, <FileTextOutlined />)
      );

    const exerciseItems = (model.exercises || [])
      .filter((ex: any) => ex.status !== 'INACTIVE')
      .map((ex: any, index: number) =>
        getItem(`Câu ${index + 1}`, `exercise-${ex.id}`, <FormOutlined />)
      );

    return [
      getItem('Mô hình 3D', 'model-3d-section', <ExperimentOutlined />),
      getItem('Lý Thuyết', 'theory-section', <ReadOutlined />),
      getItem('Bài tập mẫu', 'examples-group', <BookOutlined />, exampleItems),
      getItem('Luyện tập', 'exercises-group', <FormOutlined />, exerciseItems),
    ];
  }, [model]);

  const handleMenuClick = (e: any) => {
    const key = e.key as string;
    if (key.startsWith('example-') || key === 'examples-group') setActiveTab('1');
    else if (key.startsWith('exercise-') || key === 'exercises-group') setActiveTab('2');

    setTimeout(() => {
      const targetId = (key === 'examples-group' || key === 'exercises-group') ? 'exercises-section' : key;
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const SidebarContent = (
    <>
      <div className="p-4 text-center font-bold text-lg border-b truncate text-[#0f6cbf]">
        {collapsed ? '•••' : (model?.name || 'Mục lục')}
      </div>
      <Menu
        defaultSelectedKeys={['model-3d-section']}
        defaultOpenKeys={['examples-group', 'exercises-group']}
        mode="inline"
        theme="light"
        inlineCollapsed={collapsed}
        items={items}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
        className="h-full border-r-0"
      />
    </>
  );

  const handleUpdateSimulation = (modelName: string, params: any) => {
    console.log(`[MainModelDetail] Updating ${modelName}:`, params);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang tải dữ liệu mô hình..." />
      </div>
    );
  }

  if (error || !model || model.status === 'INACTIVE') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Result
          status="404"
          title="Không tìm thấy mô hình"
          subTitle="Xin lỗi, mô hình bạn tìm kiếm không tồn tại hoặc đã bị ẩn."
        />
      </div>
    );
  }

  // Use the first ACTIVE theory
  const theoryData = (model.theories || []).find((t: any) => t.status !== 'INACTIVE') || null;

  return (
    <Layout className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Layout className="w-full max-w-[1600px] bg-transparent flex flex-row px-4 md:px-8 py-6 gap-6 justify-center">
        <Content
          style={{ minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}
          className="flex-1 w-full max-w-[1000px] shadow-sm p-6 overflow-hidden md:min-w-0"
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#0f6cbf] break-words">{model.name}</h1>
            <p className="text-gray-500">{model.description || 'Mô phỏng và lý thuyết chi tiết'}</p>
          </div>

          {/* 3D Model Viewer */}
          <ModelRegistry
            modelType={model.model_type_name}
            modelName={model.name}
            description={model.description}
            thumbnailUrl={model.thumbnail_url}
          />

          {/* Theory Section */}
          <Theory
            title={theoryData?.title || `Lý thuyết ${model.name}`}
            content={theoryData?.content_html}
          />

          {/* Examples & Exercises */}
          <ExampleExerciseTab
            examples={model.examples}
            exercises={model.exercises}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="h-60" />
        </Content>

        {/* Desktop Sidebar */}
        <Sider
          width={320}
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          theme="light"
          className="hidden md:block shadow-sm rounded-lg border border-gray-100 sticky top-24 h-[calc(100vh-120px)] overflow-hidden flex flex-col"
          style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}
          trigger={null}
        >
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: '100%', height: 48, borderBottom: '1px solid #f0f0f0', textAlign: 'left', paddingLeft: 24, flexShrink: 0 }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {SidebarContent}
          </div>
        </Sider>
      </Layout>

      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed bottom-8 right-8 z-50">
        <Button type="primary" shape="circle" size="large" icon={<AppstoreOutlined />} onClick={() => setMobileDrawerOpen(true)} className="shadow-lg" />
      </div>

      {/* Mobile Drawer */}
      <Drawer title="Mục lục" placement="right" onClose={() => setMobileDrawerOpen(false)} open={mobileDrawerOpen}>
        <Menu
          mode="inline"
          defaultOpenKeys={['examples-group', 'exercises-group']}
          items={items}
          onClick={(e) => { handleMenuClick(e); setMobileDrawerOpen(false); }}
        />
      </Drawer>

      {/* Floating Hologram Bot */}
      <div style={{ position: 'fixed', bottom: '20px', right: '400px', width: '200px', height: '300px', zIndex: 1000, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
          <HologramScene botState={botState} />
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterface onUpdateSimulation={handleUpdateSimulation} onStateChange={setBotState} />
    </Layout>
  );
}

export default MainModelDetail;
