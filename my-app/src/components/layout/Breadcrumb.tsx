import { Fragment } from 'react';
import { useLocation, Link } from 'react-router-dom';

const breadcrumbNameMap: Record<string, string> = {
  'models': 'Mô hình 3D',
  'examples': 'Bài tập mẫu',
  'exercises': 'Luyện tập',
  'cyclotron': 'Cyclotron',
  'login': 'Đăng nhập',
  'registers': 'Đăng ký'
};

function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumb on home page
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-100 py-3 px-6 border-b border-gray-200">
      <div className="container mx-auto flex items-center text-sm text-gray-600">
        <Link to="/" className="hover:text-[#044CC8] flex items-center gap-1 transition-colors">
            <i className="pi pi-home text-xs"></i>
            <span>Trang chủ</span>
        </Link>
        
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          // Use mapped name or fallback to capitalized value
          let displayName = breadcrumbNameMap[value];
          
          // Handle dynamic IDs or unmapped naming (simple heuristic)
          if (!displayName) {
             // Try to make it look decent if it's an ID or unknown slug
             if (value.length > 20 || !isNaN(Number(value))) {
                 displayName = "Chi tiết"; 
             } else {
                 displayName = value.charAt(0).toUpperCase() + value.slice(1);
             }
          }

          return (
            <Fragment key={to}>
              <span className="mx-2 text-gray-400">/</span>
              {isLast ? (
                <span className="text-gray-800 font-medium text-[#044CC8]">{displayName}</span>
              ) : (
                <Link to={to} className="hover:text-[#044CC8] transition-colors">{displayName}</Link>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default Breadcrumb;
