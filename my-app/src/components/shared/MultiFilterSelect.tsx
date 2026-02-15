import { Select } from 'antd';

export interface OptionValue {
  label: string;
  value: string;
}

interface MultiFilterSelectProps {
  options: OptionValue[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

function MultiFilterSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Chọn danh mục', 
  className = '',
  'aria-label': ariaLabel = 'Filter'
}: MultiFilterSelectProps) {
  return (
    <Select
      size="large"
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      allowClear
      className={`w-full ${className}`}
      popupMatchSelectWidth={false}
      aria-label={ariaLabel}
    />
  );
}

export default MultiFilterSelect;
