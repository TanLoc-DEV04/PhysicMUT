import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Avatar, Tag, Divider, Result, Spin } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/userService';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id!),
    enabled: !!id,
    retry: false
  });

  if (isLoading) {
      return <div className="p-6 flex justify-center"><Spin size="large" /></div>;
  }

  if (error || !user) {
      return (
        <div className="p-6">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/users')} className="mb-4">Back to List</Button>
            <Result status="404" title="User Not Found" subTitle="The user you are looking for does not exist." />
        </div>
      );
  }

  const roleName = user.role?.name || 'N/A';


  return (
    <div className="p-6">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/dashboard/users')}
        className="mb-4"
      >
        Back to List
      </Button>

      <Card title="User Detail" bordered={false} className="shadow-md">
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center justify-center min-w-[200px]">
                <Avatar size={128} icon={<UserOutlined />} />
                <h2 className="text-xl font-bold mt-4">{user.full_name}</h2>
                <Tag color={roleName === 'Teacher' ? 'blue' : 'green'} className="mt-2 text-base px-3 py-1">
                    {roleName}
                </Tag>
            </div>
            
            <div className="flex-1">
                <Descriptions title="Personal Information" layout="vertical" bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Full Name">{user.full_name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                    <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
                    {/* Add placeholder for missing fields if requested, or just show available */}
                </Descriptions>

                <Divider />

                <Descriptions title="System Information" layout="vertical" bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                     <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
                     <Descriptions.Item label="Role">{roleName}</Descriptions.Item>
                     <Descriptions.Item label="Joined Date">{new Date(user.created_at).toLocaleDateString()}</Descriptions.Item>
                </Descriptions>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default UserDetail;
