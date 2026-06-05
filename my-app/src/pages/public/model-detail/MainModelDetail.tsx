import { useState, useMemo, useEffect } from 'react';
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
import ModelRegistry from '../../../components/3d-models/ModelRegistry';
import { HologramScene } from './components/physicmut-bot/HologramScene';
import ChatInterface from './components/physicmut-bot/ChatInterface';
import type { AvatarState } from './components/physicmut-bot/HoloAvatar';
import Theory from './Theory';
import ExampleExerciseTab from './ExampleExerciseTab';
import { useParams } from 'react-router-dom';
import { useModel3DByTypeName } from '../../../hooks/useContent';
import useSEO from '../../../hooks/useSEO';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Route param is now typeName (model_type_name)
  const { typeName } = useParams<{ typeName: string }>();
  const { data: model, isLoading, error } = useModel3DByTypeName(typeName);

  // ── Dynamic SEO per model ─────────────────────────────────────────────────
  const seoKeywords = model
    ? `${model.name}, mô hình 3D, Vật lý 12, PhysicMUT, ${model.model_type_name}`.replace(/_/g, ' ')
    : 'Vật lý 12, mô hình 3D, PhysicMUT';
  const seoDescription = model
    ? (model.description ||
        `Khám phá mô hình 3D ${model.name} trên PhysicMUT. Tìm hiểu lý thuyết, làm bài tập mẫu và luyện tập trực quan.`)
    : 'Mô hình 3D Vật lý trên PhysicMUT';

  useSEO({
    title: model ? `Mô hình 3D ${model.name}` : 'Mô hình 3D',
    description: seoDescription,
    keywords: seoKeywords,
    imageUrl: model?.thumbnail_url || undefined,
    canonicalUrl: model ? `${window.location.origin}/models/${model.model_type_name}` : undefined,
  });

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
    // Phát sự kiện ra window để Model 3D (ví dụ: CyclotronSimulation) bắt lấy và tự động cập nhật
    window.dispatchEvent(new CustomEvent('update_3d_model', { 
      detail: { modelName, params } 
    }));
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

  // Strip HTML tags to get plain-text description for Microdata using DOMParser
  let plainDescription = model.description || '';
  if (theoryData?.content_html) {
    const doc = new DOMParser().parseFromString(theoryData.content_html, 'text/html');
    plainDescription = (doc.body.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  }

  return (
    <Layout className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Layout className="w-full max-w-[1600px] bg-transparent flex flex-row px-4 md:px-8 py-6 gap-6 justify-center">
        <Content
          style={{ minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}
          className="flex-1 w-full max-w-[1000px] shadow-sm p-6 overflow-hidden md:min-w-0"
        >
          {/* ── Microdata: schema.org/Article bao phủ toàn bộ nội dung của bài học ── */}
          <article itemScope itemType="https://schema.org/Article">

            {/* SEO header: tên mô hình + tác giả */}
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-[#0f6cbf] break-words" itemProp="name">
                {model.name}
              </h1>
              <p className="text-gray-500" itemProp="description">
                {model.description || 'Mô phỏng và lý thuyết chi tiết'}
              </p>
              {/* Tác giả — ẩn về mặt thị giác nhưng Google đọc được */}
              <div
                className="sr-only"
                itemProp="author"
                itemScope
                itemType="https://schema.org/Organization"
              >
                <span itemProp="name">Phòng Thí nghiệm PhysicMUT</span>
              </div>
              {/* Thumbnail của mô hình (SEO image + fallback cho GoogleBot) */}
              {model.thumbnail_url && (
                <meta itemProp="image" content={model.thumbnail_url} />
              )}
              <meta itemProp="url" content={`${window.location.origin}/models/${model.model_type_name}`} />
              {/* Tóm tắt nội dung ẩn giúp Google Rich Snippet */}
              <meta itemProp="abstract" content={plainDescription} />
            </header>

            {/* 3D Model Viewer */}
            <section aria-label="Khu vực mô hình 3D tương tác">
              {/* Thumbnail ẩn dành cho GoogleBot (không đọc được Canvas/WebGL) */}
              {model.thumbnail_url && (
                <figure className="sr-only" aria-hidden="true">
                  <img
                    src={model.thumbnail_url}
                    alt={`Sơ đồ mô hình 3D ${model.name} – PhysicMUT`}
                    itemProp="image"
                    width={800}
                    height={600}
                    loading="lazy"
                  />
                </figure>
              )}
              <ModelRegistry
                modelType={model.model_type_name}
                modelName={model.name}
                description={model.description}
                thumbnailUrl={model.thumbnail_url}
              />
            </section>

            {/* Theory Section — nội dung chính (articleBody) */}
            <div itemProp="articleBody">
              <Theory
                title={theoryData?.title || `Lý thuyết ${model.name}`}
                content={theoryData?.content_html}
              />
            </div>

            {/* Examples & Exercises */}
            <ExampleExerciseTab
              examples={model.examples}
              exercises={model.exercises}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

          </article>

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
      <div className="md:hidden fixed bottom-[90px] right-[30px] z-50">
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

      {/* Floating Hologram Bot - Disabled on Mobile to save performance */}
      {!isMobile && (
        <div style={{ position: 'fixed', bottom: '20px', right: '400px', width: '200px', height: '300px', zIndex: 1000, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
            <HologramScene botState={botState} />
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <ChatInterface onUpdateSimulation={handleUpdateSimulation} onStateChange={setBotState} isMobile={isMobile} currentModel={typeName || "cyclotron"} />
    </Layout>
  );
}

export default MainModelDetail;
