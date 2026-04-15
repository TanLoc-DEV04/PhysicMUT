import { useState, useMemo } from 'react';
import { Spin, Result, Button, Empty } from 'antd';
import Card from '../../../components/shared/Card';
import SearchInput from '../../../components/shared/SearchInput';
import MultiFilterSelect from '../../../components/shared/MultiFilterSelect';
import Pagination from '../../../components/shared/Pagination';
import { useModels3D } from '../../../hooks/useContent';

function ModelsListHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(8);

  // Fetch directly from Model3D table
  const { data: models3d = [], isLoading, error, refetch } = useModels3D();

  // Only show ACTIVE models to students
  const activeModels = useMemo(
    () => models3d.filter((m: any) => m.status !== 'INACTIVE'),
    [models3d]
  );

  // Extract unique model_type_name values as category options
  const categories = useMemo(
    () => [...new Set(activeModels.map((m: any) => m.model_type_name))]
      .map(c => ({ label: c as string, value: c as string })),
    [activeModels]
  );

  // Filter models by search + category
  const filteredModels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return activeModels.filter((m: any) => {
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q) ||
        m.model_type_name.toLowerCase().includes(q);
      const matchCat = !selectedCategory || m.model_type_name === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory, activeModels]);

  const displayModels = filteredModels.slice(first, first + rows);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spin size="large" tip="Đang tải danh sách mô hình..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Result
          status="500"
          title="Đã có lỗi xảy ra"
          subTitle="Không thể tải dữ liệu từ máy chủ."
          extra={<Button type="primary" onClick={() => refetch()}>Thử lại</Button>}
        />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen container mx-auto px-4 py-8">
      {/* Search and Filter Section */}
      <div className="bg-[#f8f9fa] rounded-2xl p-8 mb-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-0 gap-4">
          <h1 className="text-3xl font-bold text-[#044CC8] whitespace-nowrap">
            Danh sách Mô hình
          </h1>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="w-full md:w-64">
              <MultiFilterSelect
                value={selectedCategory}
                onChange={(val) => { setSelectedCategory(val); setFirst(0); }}
                options={categories}
                placeholder="Tất cả danh mục"
              />
            </div>
            <div className="w-full md:w-80">
              <SearchInput
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setFirst(0); }}
                placeholder="Tìm kiếm mô hình..."
              />
            </div>
          </div>
        </div>

        {/* Model Grid */}
        <div className="mt-8">
          {displayModels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {displayModels.map((model: any) => (
                <Card
                  key={model.model_type_name}
                  title={model.name}
                  description={model.description || 'Khám phá mô hình vật lý 3D tương tác'}
                  imageUrl={model.thumbnail_url || '/anhmau.png'}
                  link={`/models/${model.model_type_name}`}
                  category={model.model_type_name}
                  tags={[]}
                />
              ))}
            </div>
          ) : (
            <div className="col-span-full w-full text-center py-16">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-gray-500 text-base">
                    {searchQuery ? 'Không tìm thấy mô hình nào phù hợp' : 'Chưa có mô hình nào'}
                  </span>
                }
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredModels.length > rows && (
          <Pagination
            current={Math.floor(first / rows) + 1}
            pageSize={rows}
            total={filteredModels.length}
            onChange={(page, pageSize) => {
              setFirst((page - 1) * pageSize);
              setRows(pageSize);
            }}
            pageSizeOptions={['8', '12', '24', '48']}
          />
        )}
      </div>
    </div>
  );
}

export default ModelsListHome;
