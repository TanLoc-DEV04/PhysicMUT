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
import { useLesson } from '../../hooks/useContent';

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

function MainModelDetail() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1'); // '1' = Examples, '2' = Exercises
  const [botState, setBotState] = useState<AvatarState>('IDLE');

  const { id } = useParams();
  const { data: lesson, isLoading, error } = useLesson(id);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Dynamically generate menu items based on lesson data
  const items: MenuItem[] = useMemo(() => {
    if (!lesson) return [];

    const exampleItems = lesson.examples
        ?.filter((ex: any) => ex.status !== 'INACTIVE')
        .map((ex: any, index: number) => 
            getItem(`Bài ${index + 1}: ${ex.title || 'Bài tập'}`, `example-${ex.id}`, <FileTextOutlined />)
        ) || [];

    const exerciseItems = lesson.exercises
        ?.filter((ex: any) => ex.status !== 'INACTIVE')
        .map((ex: any, index: number) => 
            getItem(`Câu ${index + 1}`, `exercise-${ex.id}`, <FormOutlined />)
        ) || [];

    return [
      getItem('Mô hình 3D', 'model-3d-section', <ExperimentOutlined />),
      getItem('Lý Thuyết', 'theory-section', <ReadOutlined />),
      getItem('Bài tập mẫu', 'examples-group', <BookOutlined />, exampleItems),
      getItem('Luyện tập', 'exercises-group', <FormOutlined />, exerciseItems), 
    ];
  }, [lesson]);

  const handleMenuClick = (e: any) => {
    const key = e.key as string;
    
    // Switch tab logic
    if (key.startsWith('example-') || key === 'examples-group') {
        setActiveTab('1');
    } else if (key.startsWith('exercise-') || key === 'exercises-group') {
        setActiveTab('2');
    }

    // Scroll logic
    setTimeout(() => {
        let targetId = key;
        
        // Map group keys to the main tab section for generic scroll
        if (key === 'examples-group' || key === 'exercises-group') {
            targetId = 'exercises-section';
        }

        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
  };

  const SidebarContent = (
    <>
       <div className="p-4 text-center font-bold text-lg border-b truncate text-[#0f6cbf]">
        {collapsed ? 'Mục lục' : (lesson?.name || 'Mục lục')}
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
    // Future integration can happen here
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
      );
  }

  if (error || !lesson || lesson.status === 'INACTIVE') {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Result
                status="404"
                title="Không tìm thấy bài học"
                subTitle="Xin lỗi, bài học bạn tìm kiếm không tồn tại, đã bị ẩn hoặc đã bị xóa."
              />
          </div>
      );
  }

  const modelData = lesson.models3d && lesson.models3d.length > 0 ? lesson.models3d[0] : null;
  const theoryData = lesson.theories && lesson.theories.length > 0 ? lesson.theories[0] : null;

  return (
    <Layout className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Centered Container for Content and Sidebar */}
      <Layout className="w-full max-w-[1600px] bg-transparent flex flex-row px-4 md:px-8 py-6 gap-6 justify-center">
        <Content
          style={{
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
          className="flex-1 w-full max-w-[1000px] shadow-sm p-6 overflow-hidden md:min-w-0" 
        >
          <div className="mb-6">
             <h1 className="text-3xl font-bold text-[#0f6cbf] break-words">{lesson.name}</h1>
             <p className="text-gray-500">{modelData?.description || 'Mô phỏng và lý thuyết chi tiết'}</p>
          </div>


          <ModelRegistry 
            modelType={modelData?.type}
            modelName={modelData?.name}
            description={modelData?.description}
            thumbnailUrl={modelData?.thumbnail_url}
          />

          <Theory 
            title={theoryData?.title || `Lý thuyết ${lesson.name}`} 
            content={theoryData?.content_html} 
          />

          <ExampleExerciseTab 
            examples={lesson.examples} 
            exercises={lesson.exercises} 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
           {/* Spacer for bottom scrolling */}
           <div className="h-60"></div>
        </Content>

        {/* Desktop Sidebar */}
        <Sider
          width={320}
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          theme="light"
          className="hidden md:block shadow-sm rounded-lg border border-gray-100 sticky top-24 h-[calc(100vh-120px)] overflow-hidden flex flex-col"
          style={{ 
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
          }}
          trigger={null}
        >
             <Button
                type="text"
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    fontSize: '16px',
                    width: '100%',
                    height: 48,
                    borderBottom: '1px solid #f0f0f0',
                    textAlign: 'left',
                    paddingLeft: 24,
                    flexShrink: 0
                }}
            >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {SidebarContent}
            </div>
        </Sider>
      </Layout>
      
        {/* Mobile Sidebar Button */}
        <div className="md:hidden fixed bottom-8 right-8 z-50">
            <Button 
                type="primary" 
                shape="circle" 
                size="large" 
                icon={<AppstoreOutlined />} 
                onClick={() => setMobileDrawerOpen(true)}
                className="shadow-lg"
            />
        </div>
        
        {/* Mobile Drawer */}
        <Drawer
            title="Mục lục"
            placement="right"
            onClose={() => setMobileDrawerOpen(false)}
            open={mobileDrawerOpen}
        >
             <Menu
                mode="inline"
                defaultOpenKeys={['examples-group', 'exercises-group']}
                items={items}
                onClick={(e) => {
                    handleMenuClick(e);
                    setMobileDrawerOpen(false);
                }}
            />
        </Drawer>

        {/* Floating Hologram Bot */}
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '400px', // Adjusted to be left of chat
            width: '200px',
            height: '300px',
            zIndex: 1000,
            pointerEvents: 'none'
        }}>
            <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
               <HologramScene botState={botState} />
            </div>
        </div>

        {/* Chat Interface */}
        <ChatInterface 
            onUpdateSimulation={handleUpdateSimulation} 
            onStateChange={setBotState} 
        />

    </Layout>
  );
}

export default MainModelDetail;
