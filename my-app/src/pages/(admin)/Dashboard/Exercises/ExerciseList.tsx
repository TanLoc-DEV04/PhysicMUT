import { useState } from 'react';
import { Table, Button, Space, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useExerciseManagement, useExerciseCategories } from './useExerciseManagement';
import { use3DModelTypes } from '../../../3DModels/use3DModelManagement';
import { useExerciseMutations } from './useExerciseMutations';
import SearchInput from '../../../../../components/shared/SearchInput';
import MultiFilterSelect from '../../../../../components/shared/MultiFilterSelect';
import Pagination from '../../../../../components/shared/Pagination';

// Exercise type is always one of these two values
const EXERCISE_TYPE_OPTIONS = [
  { label: 'Multiple Choice', value: 'MultipleChoice' },
  { label: 'Essay', value: 'Essay' },
];

function ExerciseList() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const { data, loading } = useExerciseManagement(filterCategory, null, filterType, searchText);
  const { categories: categoryOptions, loadingCategories } = useExerciseCategories();
  const { types: modelTypes, loadingTypes } = use3DModelTypes();
  const { deleteExercise, updateExerciseStatus } = useExerciseMutations();

  // Merge: prefer live Model3D types, fall back to cached exercise categories
  const mergedCategoryOptions = modelTypes.length > 0
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
      deleteExercise.mutate(id);
  };

  const handleStatusChange = (id: string, currentStatus: string) => {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      updateExerciseStatus.mutate({ id, status: newStatus });
  };

  const columns = [
    { title: 'Exercise ID', dataIndex: 'id', key: 'id', ellipsis: true, width: 80 },
    { title: 'Question', dataIndex: 'question', key: 'question', ellipsis: true },
    { title: 'Model Category', dataIndex: 'exercise_type_name', key: 'exercise_type_name' },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 130 },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Popconfirm
            title={record.status === 'ACTIVE' ? 'Deactivate this Exercise?' : 'Activate this Exercise?'}
            description={record.status === 'ACTIVE'
              ? 'Are you sure you want to deactivate this exercise? It will be hidden from users.'
              : 'Are you sure you want to activate this exercise? It will be visible to users.'}
            onConfirm={() => handleStatusChange(record.id, record.status)}
            okText="Confirm"
            cancelText="Cancel"
          >
            <Switch
              checked={record.status === 'ACTIVE'}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              loading={updateExerciseStatus.isPending}
            />
          </Popconfirm>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/dashboard/exercises/${record.id}`)}
          >
            View
          </Button>
          <Popconfirm
            title="Delete this Exercise?"
            description="Are you sure to delete this exercise?"
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
        <h2 className="text-2xl font-bold">Exercise Management</h2>
        <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/dashboard/exercises/add')}
        >
          Add New Exercise
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-1/3">
            <SearchInput 
                value={searchText} 
                onChange={(e) => setSearchText(e.target.value)} 
                placeholder="Search exercise..."
            />
        </div>
        <div className="w-1/4">
             <MultiFilterSelect
                value={filterCategory}
                onChange={(val) => setFilterCategory(val)}
                options={mergedCategoryOptions}
                loading={loadingTypes || loadingCategories}
                placeholder="Filter by Model Category"
            />
        </div>
        <div className="w-1/4">
             <MultiFilterSelect
                value={filterType}
                onChange={(val) => setFilterType(val)}
                options={EXERCISE_TYPE_OPTIONS}
                loading={false}
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

export default ExerciseList;
