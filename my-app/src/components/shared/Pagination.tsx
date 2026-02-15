import { Pagination as AntPagination } from 'antd';

export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  className?: string;
  pageSizeOptions?: string[];
}

function Pagination({
  current,
  pageSize,
  total,
  onChange,
  className = '',
  pageSizeOptions = ['10', '20', '50']
}: PaginationProps) {
  return (
    <div className={`mt-8 flex justify-center border-t border-gray-200 pt-6 ${className}`}>
      <AntPagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        pageSizeOptions={pageSizeOptions}
        showSizeChanger
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
      />
    </div>
  );
}

export default Pagination;
