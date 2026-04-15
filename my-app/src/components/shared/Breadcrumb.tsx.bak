import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const breadcrumbItems = items.map((item, index) => ({
    title: item.href ? <Link to={item.href}>{item.title}</Link> : item.title,
    key: index,
  }));

  return (
    <AntBreadcrumb 
      items={breadcrumbItems} 
      className={`mb-4 ${className}`} 
      aria-label="Breadcrumb"
    />
  );
}

export default Breadcrumb;
