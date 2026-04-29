import { useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, Skeleton, Empty, Switch } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUsers, useRoles } from './hooks/useUsers';
import { useUserMutations } from './hooks/useUserMutations';
import SearchInput from '../../../../components/shared/SearchInput';
import Pagination from '../../../../components/shared/Pagination';
import MultiFilterSelect from '../../../../components/shared/MultiFilterSelect';
import Breadcrumb from '../../../../components/shared/Breadcrumb';

function UserList() {
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const { data, loading } = useUsers(roleFilter, searchText);
  const { roles, loadingRoles } = useRoles();
  const { deleteUser, updateUserStatus } = useUserMutations();
  const navigate = useNavigate();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDelete = (id: string) => {
    deleteUser.mutate(id);
  };

  const handleStatusChange = (id: string, currentIsActive: boolean) => {
    updateUserStatus.mutate({ id, is_active: !currentIsActive });
  };

  const onPageChange = (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
  };

  const displayData = data || [];

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
            options={roles.map((r: any) => ({ label: r.name, value: r.id }))}
            value={roleFilter}
            onChange={setRoleFilter}
            loading={loadingRoles}
            placeholder="Filter by Role"
            aria-label="Filter by Role"
          />
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : displayData.length > 0 ? (
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
                // {
                //     title: 'Status',
                //     dataIndex: 'is_active',
                //     key: 'is_active',
                //     render: (is_active: boolean) => (
                //         <Tag color={is_active !== false ? 'green' : 'red'}>
                //             {is_active !== false ? 'Active' : 'Inactive'}
                //         </Tag>
                //     )
                // },
                {
                  title: 'Actions',
                  key: 'action',
                  render: (_: any, record: any) => (
                    <Space size="middle">
                      <Popconfirm
                        title={record.is_active !== false ? 'Deactivate this User?' : 'Activate this User?'}
                        description={record.is_active !== false
                          ? 'Are you sure you want to deactivate this user? They will not be able to login.'
                          : 'Are you sure you want to activate this user? They will be able to login again.'}
                        onConfirm={() => handleStatusChange(record.id, record.is_active !== false)}
                        okText="Confirm"
                        cancelText="Cancel"
                      >
                        <Switch
                          checked={record.is_active !== false}
                          checkedChildren="Active"
                          unCheckedChildren="Inactive"
                          loading={updateUserStatus.isPending}
                        />
                      </Popconfirm>
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
            dataSource={displayData} 
            loading={loading}
            rowKey="id" 
            pagination={false}
            locale={{ emptyText: <Empty description="No users found" /> }}
            summary={() => <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={6}>Total {displayData.length} users</Table.Summary.Cell></Table.Summary.Row>}
          />

          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={displayData.length}
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
