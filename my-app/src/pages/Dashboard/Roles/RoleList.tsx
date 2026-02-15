import { useState } from 'react';
import { Table, Button, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useRole } from './useRole';
import SearchInput from '../../../components/shared/SearchInput';
import Pagination from '../../../components/shared/Pagination';

function RoleList() {
  const { data, loading } = useRole();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const onPageChange = (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
  };

  const columns = [
    { 
        title: 'No', 
        key: 'no',
        render: (_: any, __: any, index: number) => index + 1,
        width: 60,
    },
    { title: 'Role Name', dataIndex: 'name', key: 'name' },

    { 
        title: 'Last Update', 
        dataIndex: 'updated_at', 
        key: 'updated_at',
        render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/dashboard/roles/${record.id}`)}
          >
             Edit
          </Button>
          <Popconfirm
            title="Delete this Role?"
            description="Are you sure to delete this role?"
            onConfirm={() => message.success('Deleted successfully (mock)')}
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
        <h2 className="text-2xl font-bold">Role Management</h2>
        <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/dashboard/roles/add')}
        >
          Add New Role
        </Button>
      </div>

      <div className="mb-6 w-1/3">
        <SearchInput 
            value={searchText} 
            onChange={(e) => setSearchText(e.target.value)} 
            placeholder="Search role..."
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={data} 
        loading={loading} 
        rowKey="id" 
        pagination={false}
      />

      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={data.length}
        onChange={onPageChange}
      />
    </div>
  );
}

export default RoleList;
