import { useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useAdmin } from './useAdmin';
import { useUpdateAndAddAdmin } from './useUpdateAndAddAdmin';
import AddAdminModal from './AddAdminModal';
import SearchInput from '../../../components/shared/SearchInput';
import { userService } from '../../../services/userService';
import { useMutation, useQueryClient } from '@tanstack/react-query';


function AdminManagementList() {
  const { data, loading, refetch } = useAdmin();
  const { deleteAdmin } = useUpdateAndAddAdmin(() => refetch());
  const queryClient = useQueryClient();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const onPageChange = (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
  };

  // Toggle status mutation
  const toggleStatus = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      userService.updateUserStatus(id, is_active),
    onSuccess: (_, variables) => {
      message.success(variables.is_active ? 'Account has been activated' : 'Account has been deactivated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => message.error('Failed to update status'),
  });

  // Filter only admin-level users (exclude USER and deprecated STUDENT/TEACHER roles)
  const NON_ADMIN_ROLES = ['USER', 'STUDENT', 'TEACHER'];
  const filteredData = (Array.isArray(data) ? data : []).filter((u: any) => {
      const isAdmin = u.role?.name && !NON_ADMIN_ROLES.includes(u.role?.name);
      const matchesSearch = !searchText || 
          u.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          u.username?.toLowerCase().includes(searchText.toLowerCase());
      return isAdmin && matchesSearch;
  });

  const columns = [
    { title: 'Full Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Role', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: any) => role?.name || 'N/A'
    },
    // { 
    //   title: 'Department', 
    //   dataIndex: 'department', 
    //   key: 'department',
    //   render: (dept: string) => dept || '—'
    // },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active: boolean, record: any) => (
        <Switch
          checked={is_active}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={(checked) => toggleStatus.mutate({ id: record.id, is_active: checked })}
          loading={toggleStatus.isPending}
        />
      ),
      width: 130,
    },
    // { 
    //   title: 'Lần đăng nhập cuối', 
    //   dataIndex: 'last_login', 
    //   key: 'last_login',
    //   render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : 'Chưa đăng nhập'
    // },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => {
              setEditingAdmin(record);
              setModalVisible(true);
            }}
          >
            View
          </Button>
          <Popconfirm
            title="Delete this Admin?"
            description={`Are you sure you want to delete this admin "${record.full_name}"?`}
            onConfirm={() => deleteAdmin(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} danger>
                Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Admin Management</h2>
        <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
                setEditingAdmin(null);
                setModalVisible(true);
            }}
        >
          Add New Admin
        </Button>
      </div>

      <div className="mb-6 w-1/3">
        <SearchInput 
            value={searchText} 
            onChange={(e) => setSearchText(e.target.value)} 
            placeholder="Search by name, email, username..."
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredData} 
        loading={loading} 
        rowKey="id" 
        pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredData.length,
            onChange: onPageChange,
            showSizeChanger: true
        }}
      />

      <AddAdminModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => {
            setModalVisible(false);
            refetch();
        }}
        initialValues={editingAdmin}
      />
    </div>
  );
}

export default AdminManagementList;
