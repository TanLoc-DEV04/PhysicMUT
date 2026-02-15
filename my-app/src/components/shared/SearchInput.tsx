import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  'aria-label'?: string;
}

function SearchInput({ placeholder = 'Tìm kiếm...', value, onChange, className = '', 'aria-label': ariaLabel = 'Search' }: SearchInputProps) {
  return (
    <Input
      size="large"
      placeholder={placeholder}
      prefix={<SearchOutlined className="text-gray-500" />}
      value={value}
      onChange={onChange}
      className={`rounded-lg ${className}`}
      allowClear
      aria-label={ariaLabel}
    />
  );
}

export default SearchInput;
