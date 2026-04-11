import { useState } from 'react';
import { Table, Button, Space, Avatar, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, CodeSandboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { use3DModelManagement, use3DModelTypes } from './use3DModelManagement';
import { use3DModelMutations } from './use3DModelMutations';
import SearchInput from '../../../components/shared/SearchInput';
import MultiFilterSelect from '../../../components/shared/MultiFilterSelect';
import Pagination from '../../../components/shared/Pagination';

function ModelList() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const { data, loading } = use3DModelManagement(filterCategory, searchText);
  const { types, loadingTypes } = use3DModelTypes();
  const { deleteModel, updateModelStatus } = use3DModelMutations();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);



  const onPageChange = (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
  };

  const handleDelete = (typeName: string) => {
      deleteModel.mutate(typeName);
  };

  const handleStatusChange = (typeName: string, currentStatus: string) => {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      updateModelStatus.mutate({ typeName, status: newStatus });
  };

  const columns = [
    { title: 'Type Name', dataIndex: 'model_type_name', key: 'model_type_name' },
    { 
        title: 'Thumbnail', 
        dataIndex: 'thumbnail_url', 
        key: 'thumbnail_url',
        render: (src: string) => {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
            const imageUrl = src ? (src.startsWith('http') ? src : `${API_URL}/${src.replace(/^\//,'')}`) : '/anhmau.png';
            return <Avatar shape="square" size={64} src={imageUrl} icon={<CodeSandboxOutlined />} />;
        }
    },
    { title: 'Model Name', dataIndex: 'name', key: 'name' },
    // {
    //     title: 'Status',
    //     dataIndex: 'status',
    //     key: 'status',
    //     render: (status: string) => (
    //         <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
    //             {status === 'ACTIVE' ? 'Active' : 'Inactive'}
    //         </Tag>
    //     )
    // },

    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Popconfirm
            title={record.status === 'ACTIVE' ? 'Deactivate this Model?' : 'Activate this Model?'}
            description={record.status === 'ACTIVE'
              ? 'Are you sure you want to deactivate this model? It will be hidden from users.'
              : 'Are you sure you want to activate this model? It will be visible to users.'}
            onConfirm={() => handleStatusChange(record.model_type_name, record.status)}
            okText="Confirm"
            cancelText="Cancel"
          >
            <Switch
              checked={record.status === 'ACTIVE'}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              loading={updateModelStatus.isPending}
            />
          </Popconfirm>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/dashboard/3d-models/${record.model_type_name}`)}
          >
            View
          </Button>
          <Popconfirm
            title="Delete this Model?"
            description="Are you sure to delete this model?"
            onConfirm={() => handleDelete(record.model_type_name)}
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
                options={types.map((type: string) => ({ label: type, value: type }))}
                loading={loadingTypes}
                placeholder="Filter by Type"
            />
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={data} 
        loading={loading} 
        rowKey="model_type_name" 
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
