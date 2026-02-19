
import { useState } from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useAdmin } from './useAdmin';
import { useUpdateAndAddAdmin } from './useUpdateAndAddAdmin';
import AddAdminModal from './AddAdminModal';
import SearchInput from '../../../components/shared/SearchInput';


function AdminManagementList() {
  const { data, loading, refetch } = useAdmin();
  useUpdateAndAddAdmin(() => refetch());
  
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



  // Filter only Admins and apply search
  const filteredData = (Array.isArray(data) ? data : []).filter((u: any) => {
      // Filter out Students and Teachers, assuming everyone else has some admin privileges or is a custom role
      const isAdmin = u.role?.name && u.role?.name !== 'Student' && u.role?.name !== 'Teacher';
      const matchesSearch = !searchText || 
          u.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchText.toLowerCase());
      return isAdmin && matchesSearch;
  });

  const columns = [
    { title: 'Admin ID', dataIndex: 'id', key: 'id' },
    { title: 'Full Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Role Name', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: any) => role?.name || 'N/A'
    },
    { 
      title: 'Last Login', 
      dataIndex: 'last_login', 
      key: 'last_login',
      render: (date: string) => date ? new Date(date).toLocaleString() : 'N/A'
    },

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
            description="Are you sure to delete this admin?"
            onConfirm={() => message.success('Delete functionality to be implemented in useUpdateAndAddAdmin if needed')}
            okText="Yes"
            cancelText="No"
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
            placeholder="Search admin..."
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
