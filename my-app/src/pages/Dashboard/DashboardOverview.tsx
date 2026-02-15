import { Spin, Row, Col, Card } from 'antd';
import { UserOutlined, CodeSandboxOutlined, ReadOutlined, FileTextOutlined, FormOutlined } from '@ant-design/icons';
import { useChapters } from '../../hooks/useContent';
import { useUsers } from '../../hooks/useUsers';
import { useMemo } from 'react';

const StatCard = ({ title, value, icon, color }: any) => (
  <Card hoverable className="h-full">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-gray-500 text-sm mb-1">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className={`p-3 rounded-full ${color} text-white text-xl`}>
        {icon}
      </div>
    </div>
  </Card>
);

function DashboardOverview() {
  const { data: chapters, isLoading: loadingContent } = useChapters();
  const { data: users, isLoading: loadingUsers } = useUsers();

  const stats = useMemo(() => {
    if (!chapters) return { models: 0, theories: 0, examples: 0, exercises: 0 };
    
    let modelsCount = 0;
    let theoriesCount = 0;
    let examplesCount = 0;
    let exercisesCount = 0;

    chapters.forEach(chapter => {
      chapter.lessons?.forEach(lesson => {
        modelsCount += lesson.models3d?.length || 0;
        theoriesCount += lesson.theories?.length || 0;
        examplesCount += lesson.examples?.length || 0;
        exercisesCount += lesson.exercises?.length || 0;
      });
    });

    return { 
        models: modelsCount, 
        theories: theoriesCount, 
        examples: examplesCount, 
        exercises: exercisesCount 
    };
  }, [chapters]);

  if (loadingContent || loadingUsers) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tổng quan hệ thống</h2>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="Tổng số người dùng" 
            value={users?.length || 0} 
            icon={<UserOutlined />} 
            color="bg-blue-500" 
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="Mô hình 3D" 
            value={stats.models} 
            icon={<CodeSandboxOutlined />} 
            color="bg-purple-500" 
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="Bài lý thuyết" 
            value={stats.theories} 
            icon={<ReadOutlined />} 
            color="bg-green-500" 
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
            <StatCard 
                title="Ví dụ minh họa" 
                value={stats.examples} 
                icon={<FileTextOutlined />} 
                color="bg-orange-500" 
            />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
            <StatCard 
                title="Bài tập thực hành" 
                value={stats.exercises} 
                icon={<FormOutlined />} 
                color="bg-red-500" 
            />
        </Col>
      </Row>

      <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
          <Card>
              <p className="text-gray-500 italic">Chưa có dữ liệu hoạt động.</p>
          </Card>
      </div>
    </div>
  );
}

export default DashboardOverview;
