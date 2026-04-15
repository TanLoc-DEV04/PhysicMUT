import { useState } from 'react';
import { Table, Button, Space, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useExampleManagement, useExampleCategories } from './useExampleManagement';
import { use3DModelTypes } from '../3DModels/use3DModelManagement';
import { useExampleMutations } from './useExampleMutations';
import SearchInput from '../../../../components/shared/SearchInput';
import MultiFilterSelect from '../../../../components/shared/MultiFilterSelect';
import Pagination from '../../../../components/shared/Pagination';

function ExampleList() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const { data, loading } = useExampleManagement(filterCategory, null, searchText);
  const { categories: categoryOptions, loadingCategories } = useExampleCategories();
  const { types: modelTypes, loadingTypes } = use3DModelTypes();
  const { deleteExample, updateExampleStatus } = useExampleMutations();

  // Merge: prefer live Model3D types, fall back to cached example categories
  const mergedOptions = modelTypes.length > 0
    ? modelTypes.map((t: string) => ({ label: t, value: t }))
    : categoryOptions.map((t: string) => ({ label: t, value: t }));

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

  const handleStatusChange = (id: string, currentStatus: string) => {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      updateExampleStatus.mutate({ id, status: newStatus });
  };

  const columns = [
    { title: 'Example ID', dataIndex: 'id', key: 'id', ellipsis: true, width: 80 },
    { title: 'Example Title', dataIndex: 'title', key: 'title' },
    { title: 'Model Category', dataIndex: 'example_type_name', key: 'example_type_name' },
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
          <Popconfirm
            title={record.status === 'ACTIVE' ? 'Deactivate this Example?' : 'Activate this Example?'}
            description={record.status === 'ACTIVE'
              ? 'Are you sure you want to deactivate this example? It will be hidden from users.'
              : 'Are you sure you want to activate this example? It will be visible to users.'}
            onConfirm={() => handleStatusChange(record.id, record.status)}
            okText="Confirm"
            cancelText="Cancel"
          >
            <Switch
              checked={record.status === 'ACTIVE'}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              loading={updateExampleStatus.isPending}
            />
          </Popconfirm>
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
                value={filterCategory}
                onChange={(val) => setFilterCategory(val)}
                options={mergedOptions}
                loading={loadingTypes || loadingCategories}
                placeholder="Filter by Model Category"
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
