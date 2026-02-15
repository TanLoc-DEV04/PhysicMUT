import { useState, useMemo } from 'react';
import Card from '../../components/shared/Card';
import SearchInput from '../../components/shared/SearchInput';
import MultiFilterSelect from '../../components/shared/MultiFilterSelect';
import Pagination from '../../components/shared/Pagination';
import { models } from '../../data/mockData';
import type { Model } from '../../types/model';

function ModelList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(6);

  // Extract unique categories
  const categories = useMemo(() => {
    const unique = Array.from(new Set(models.map((m) => m.category).filter(Boolean)));
    return unique.map((c) => ({ label: c, value: c }));
  }, []);

  // Filter models
  const filteredModels = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return models.filter((model) => {
      const matchesSearch =
        !query ||
        model.name.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query) ||
        (model.tags?.some((tag) => tag.toLowerCase().includes(query)) ?? false);

      const matchesCategory = !selectedCategory || model.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const displayModels = filteredModels.slice(first, first + rows);

  const getModelLink = (model: Model) => `/models/${model.id}`;
  const getModelImage = (model: Model) => model.thumbnail || model.previewImage || '/anhmau.png';

  return (
    <div className="bg-white min-h-screen container mx-auto px-4 py-8">
      {/* Search and Filter Section */}
      <div className="bg-[#f8f9fa] rounded-2xl p-8 mb-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-0 gap-4">
          <h1 className="text-3xl font-bold text-[#044CC8] whitespace-nowrap">Mô hình 3D</h1>
          
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
                    imageUrl={getModelImage(model)}
                    link={getModelLink(model)}
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
                    {searchQuery ? 'Không tìm thấy mô hình nào phù hợp' : 'Chưa có mô hình nào'}
                </p>
                </div>
            )}
            </div>
        </div>

        {/* Pagination */}
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
      </div>
    </div>
  );
}

export default ModelList;
