import { useState, useMemo } from 'react';
import Card from '../../components/shared/Card';
import SearchInput from '../../components/shared/SearchInput';
import MultiFilterSelect from '../../components/shared/MultiFilterSelect';
import Pagination from '../../components/shared/Pagination';
import { useChapters } from '../../hooks/useContent';
// import { models } from '../../data/mockData'; // Removed mock data
import { Spin, Result, Button } from 'antd'; // Added UI states

function ModelsListHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(8);

  // Fetch real data
  const { data: chapters, isLoading, error, refetch } = useChapters();

  // Process data: Flatten Chapters -> Lessons (treated as Models here)
  const allModels = useMemo(() => {
    if (!chapters) return [];
    
    return chapters.flatMap(chapter => 
      (chapter.lessons || [])
        .filter(lesson => lesson.status !== 'INACTIVE') // Filter inactive lessons
        .map(lesson => {
          // Find the first 3D model for this lesson to get thumbnail/desc, or use defaults
          const model3d = lesson.models3d?.[0];
          
          // Optionally check model status too, if model is the primary view
          // if (model3d && model3d.status === 'INACTIVE') return null; 

          return {
              id: lesson.id,
              name: lesson.name,
              // Description priority: Model desc -> Lesson name -> generic
              description: model3d?.description || `Bài học: ${lesson.name}`,
              thumbnail: model3d?.thumbnail_url || '/anhmau.png',
              category: chapter.name, // Use Chapter name as category
              tags: [], // Tags might be added later to DB, defaulting empty for now
              views: 0
          };
      })
      .filter(Boolean) as any[] // Remove nulls if any
    );
  }, [chapters]);

  // Extract unique categories (Chapter names)
  const categories = useMemo(() => {
    if (!chapters) return [];
    return chapters.map(c => ({ label: c.name, value: c.name }));
  }, [chapters]);

  // Filter models
  const filteredModels = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return allModels.filter((model) => {
      const matchesSearch =
        !query ||
        model.name.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query);

      const matchesCategory = !selectedCategory || model.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, allModels]);

  const displayModels = filteredModels.slice(first, first + rows);

  const getModelLink = (id: string) => `/models/${id}`;

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-white">
              <Spin size="large" tip="Đang tải danh sách bài học..." />
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
          <h1 className="text-3xl font-bold text-[#044CC8] whitespace-nowrap">Danh sách Mô hình</h1>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
             <div className="w-full md:w-64">
                <MultiFilterSelect
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val);
                    setFirst(0);
                  }}
                  options={categories}
                  placeholder="Tất cả danh mục"
                />
            </div>
            <div className="w-full md:w-80">
              <SearchInput
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFirst(0);
                }}
              />
            </div>
          </div>
        </div>

        {/* Model Grid */}
        <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {displayModels.length > 0 ? (
                displayModels.map((model) => (
                <Card
                    key={model.id}
                    title={model.name}
                    description={model.description}
                    imageUrl={model.thumbnail}
                    link={getModelLink(model.id)}
                    category={model.category}
                    tags={model.tags}
                />
                ))
            ) : (
                <div className="col-span-full w-full text-center py-12">
                <div className="text-6xl text-gray-200 mb-4">
                    <i className="pi pi-search"></i>
                </div>
                <p className="text-gray-500 text-lg">
                    {searchQuery ? 'Không tìm thấy bài học nào phù hợp' : 'Chưa có bài học nào'}
                </p>
                </div>
            )}
            </div>
        </div>

        {/* Pagination */}
        {filteredModels.length > 0 && (
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
