const fs = require("fs");
const path = "src/components/shared/Breadcrumb.tsx";
if (fs.existsSync(path)) fs.unlinkSync(path);

const correct = `import { Breadcrumb as AntBreadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import React from 'react';

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const breadcrumbNameMap: Record<string, string> = {
  'models': 'Mô hình 3D',
  'examples': 'Bài tập mẫu',
  'exercises': 'Luyện tập',
  'cyclotron': 'Cyclotron',
  'login': 'Đăng nhập',
  'registers': 'Đăng ký'
};

function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const location = useLocation();

  if (items) {
    const breadcrumbItems = items.map((item, index) => ({
      title: item.href ? <Link to={item.href}>{item.title}</Link> : item.title,
      key: index,
    }));
    return (
      <AntBreadcrumb
        items={breadcrumbItems}
        className={\`mb-4 \${className}\`}
        aria-label="Breadcrumb"
      />
    );
  }

  const pathnames = location.pathname.split('/').filter((x) => x);
  if (pathnames.length === 0) return null;

  const breadcrumbItems = [
    {
      title: <Link to="/" className="flex items-center gap-1 hover:text-[#044CC8] transition-colors"><i className="pi pi-home text-xs"></i><span>Trang chủ</span></Link>,
      key: 'home',
    },
    ...pathnames.map((value, index) => {
      const url = \`/\${pathnames.slice(0, index + 1).join('/')}\`;
      const name = breadcrumbNameMap[value.toLowerCase()] || decodeURIComponent(value);
      const isLast = index === pathnames.length - 1;

      return {
        title: isLast ? <span className="font-semibold text-gray-800">{name}</span> : <Link to={url} className="hover:text-[#044CC8] transition-colors">{name}</Link>,
        key: url,
      };
    }),
  ];

  return (
    <div className={\`bg-gray-100 py-3 px-6 border-b border-gray-200 \${className}\`}>
      <div className="container mx-auto">
        <AntBreadcrumb items={breadcrumbItems} aria-label="Breadcrumb" separator={<i className="pi pi-angle-right text-gray-400 text-xs mx-1"></i>} />
      </div>
    </div>
  );
}

export default Breadcrumb;
`;
fs.writeFileSync(path, correct, "utf8");
