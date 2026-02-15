import { useState } from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useExampleManagement } from './useExampleManagement';
import { useExampleMutations } from './useExampleMutations';
import SearchInput from '../../../components/shared/SearchInput';
import MultiFilterSelect from '../../../components/shared/MultiFilterSelect';
import Pagination from '../../../components/shared/Pagination';

function ExampleList() {
  const { data, loading } = useExampleManagement();
  const { deleteExample } = useExampleMutations();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const onPageChange = (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
  };

  const handleDelete = (id: string) => {
      deleteExample.mutate(id);
  };



  const columns = [
    { title: 'Example ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Example Title', dataIndex: 'title', key: 'title' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Reference', dataIndex: 'reference', key: 'reference' },
    { 
        title: 'Last Update', 
        dataIndex: 'updated_at', 
        key: 'updated_at',
        render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },

    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/dashboard/examples/${record.id}`)}
          >
            View
          </Button>
          <Popconfirm
            title="Delete this Example?"
            description="Are you sure to delete this example?"
            onConfirm={() => handleDelete(record.id)}
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
        <h2 className="text-2xl font-bold">Example Management</h2>
        <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/dashboard/examples/add')}
        >
          Add New Example
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-1/3">
            <SearchInput 
                value={searchText} 
                onChange={(e) => setSearchText(e.target.value)} 
                placeholder="Search example..."
            />
        </div>
        <div className="w-1/4">
             <MultiFilterSelect
                value={filterType}
                onChange={(val) => setFilterType(val)}
                options={[
                    { label: 'Mechanics', value: 'Mechanics' },
                    { label: 'Electromagnetism', value: 'Electromagnetism' },
                    { label: 'Optics', value: 'Optics' }
                ]}
                placeholder="Filter by Type"
            />
        </div>
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

export default ExampleList;
