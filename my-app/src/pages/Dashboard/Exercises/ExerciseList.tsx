import { useState } from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useExerciseManagement } from './useExerciseManagement';
import { useExerciseMutations } from './useExerciseMutations';
import SearchInput from '../../../components/shared/SearchInput';
import MultiFilterSelect from '../../../components/shared/MultiFilterSelect';
import Pagination from '../../../components/shared/Pagination';

function ExerciseList() {
  const { data, loading } = useExerciseManagement();
  const { deleteExercise } = useExerciseMutations();
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
      deleteExercise.mutate(id);
  };

  const columns = [
    { title: 'Exercise ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Question', dataIndex: 'question', key: 'question', ellipsis: true },
    { title: 'Level', dataIndex: 'level', key: 'level', width: 100 },
    { title: 'Correct', dataIndex: 'correct_answer', key: 'correct_answer', width: 80 },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Reference', dataIndex: 'reference', key: 'reference' },
    { 
        title: 'Last Update', 
        dataIndex: 'updated_at', 
        key: 'updated_at',
        render: (val: string) => val ? new Date(val).toLocaleDateString() : 'N/A'
    },

    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
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

export default ExerciseList;
