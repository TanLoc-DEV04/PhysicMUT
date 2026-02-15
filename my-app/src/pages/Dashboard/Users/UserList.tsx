import { useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, Skeleton, Empty } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUsers } from './useUsers';
import { useUserMutations } from './useUserMutations';
import SearchInput from '../../../components/shared/SearchInput';
import Pagination from '../../../components/shared/Pagination';
import MultiFilterSelect from '../../../components/shared/MultiFilterSelect';
import Breadcrumb from '../../../components/shared/Breadcrumb';

function UserList() {
  const { data, loading } = useUsers();
  const { deleteUser } = useUserMutations();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDelete = (id: string) => {
    deleteUser.mutate(id);
  };

  const onPageChange = (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
  };

  // Client-side filtering for demo (Cognitive Load: Filters)
  const filteredData = data.filter((user: any) => {
    const matchesSearch = (user.full_name || '').toLowerCase().includes(searchText.toLowerCase()) || 
                          (user.email || '').toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = roleFilter ? user.role?.name === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <Breadcrumb 
        items={[
          { title: 'Home', href: '/' },
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'User Management' }
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        {/* Add User button removed as requested */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <SearchInput 
              value={searchText} 
              onChange={(e) => setSearchText(e.target.value)} 
              placeholder="Search user by name or email..."
              aria-label="Search users"
          />
        </div>
        <div>
          <MultiFilterSelect
            options={[
              { label: 'Teacher', value: 'Teacher' },
              { label: 'Student', value: 'Student' }
            ]}
            value={roleFilter}
            onChange={setRoleFilter}
            placeholder="Filter by Role"
            aria-label="Filter by Role"
          />
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : filteredData.length > 0 ? (
        <>
          <Table 
            columns={[
                { title: 'User ID', dataIndex: 'id', key: 'id' },
                { title: 'Full Name', dataIndex: 'full_name', key: 'full_name' },
                { title: 'Email', dataIndex: 'email', key: 'email' },
                { 
                    title: 'Role', 
                    dataIndex: 'role', 
                    key: 'role',
                    render: (role: any) => (
                        <Tag color={role?.name === 'Teacher' ? 'blue' : 'green'}>{role?.name || 'N/A'}</Tag>
                    )
                },
                {
                  title: 'Actions',
                  key: 'action',
                  render: (_: any, record: any) => (
                    <Space size="middle">
                      <Button 
                        icon={<EyeOutlined />} 
                        onClick={() => navigate(`/dashboard/users/${record.id}?view=true`)}
                        aria-label={`View ${record.full_name}`}
                      >
                        View
                      </Button>
                      <Popconfirm
                        title="Delete this User?"
                        description="Are you sure to delete this user? This action cannot be undone."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                         <Button 
                           icon={<DeleteOutlined />} 
                           danger 
                           aria-label={`Delete user ${record.full_name}`} 
                         >
                           Delete
                         </Button>
                      </Popconfirm>
                    </Space>
                  ),
                },
            ]} 
            dataSource={filteredData} 
            loading={loading}
            rowKey="id" 
            pagination={false}
            locale={{ emptyText: <Empty description="No users found" /> }}
            summary={() => <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={6}>Total {filteredData.length} users</Table.Summary.Cell></Table.Summary.Row>}
          />

          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredData.length}
            onChange={onPageChange}
          />
        </>
      ) : (
         <Empty description="No users found matching your criteria" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
}

export default UserList;
