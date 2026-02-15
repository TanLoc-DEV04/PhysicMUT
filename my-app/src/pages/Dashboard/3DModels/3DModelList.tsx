import { useState } from 'react';
import { Table, Button, Space, Avatar, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, CodeSandboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { use3DModelManagement } from './use3DModelManagement';
import { use3DModelMutations } from './use3DModelMutations';
import SearchInput from '../../../components/shared/SearchInput';
import MultiFilterSelect from '../../../components/shared/MultiFilterSelect';
import Pagination from '../../../components/shared/Pagination';

function ModelList() {
  const { data, loading } = use3DModelManagement();
  const { deleteModel } = use3DModelMutations();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);



  const onPageChange = (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
  };

  const handleDelete = (id: string) => {
      deleteModel.mutate(id);
  };

  const columns = [
    { title: 'Model ID', dataIndex: 'id', key: 'id' },
    { 
        title: 'Thumbnail', 
        dataIndex: 'thumbnail_url', 
        key: 'thumbnail_url',
        render: (src: string) => {
            const imageUrl = src ? (src.startsWith('http') ? src : `http://localhost:3000/${src}`) : '/anhmau.png';
            return <Avatar shape="square" size={64} src={imageUrl} icon={<CodeSandboxOutlined />} />;
        }
    },
    { title: 'Model Name', dataIndex: 'name', key: 'name' },
    { title: 'Model Type Name', dataIndex: 'type', key: 'type' },

    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/dashboard/3d-models/${record.id}`)}
          >
            View
          </Button>
          <Popconfirm
            title="Delete this Model?"
            description="Are you sure to delete this model?"
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
        <h2 className="text-2xl font-bold">3D Model Management</h2>
        <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/dashboard/3d-models/add')}
        >
          Add New Model
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-1/3">
            <SearchInput 
                value={searchText} 
                onChange={(e) => setSearchText(e.target.value)} 
                placeholder="Search model..."
            />
        </div>
        <div className="w-1/4">
             <MultiFilterSelect
                value={filterCategory}
                onChange={(val) => setFilterCategory(val)}
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

export default ModelList;
