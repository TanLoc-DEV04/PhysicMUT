import { Fragment } from 'react';
import { useLocation, Link } from 'react-router-dom';

const breadcrumbNameMap: Record<string, string> = {
  'dashboard': 'Dashboard',
  'admins': 'Admins',
  'roles': 'Roles',
  'users': 'Users',
  '3d-models': '3D Models',
  'theory': 'Theory',
  'examples': 'Examples',
  'exercises': 'Exercises',
  'add': 'Add',
  'edit': 'Edit'
};

function DashboardBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If we are just at /dashboard, maybe show nothing or just "Dashboard"
  // But usually breadcrumb is useful for nested pages.
  
  return (
    <div className="bg-white py-3 px-6 border-b border-gray-200 mb-6">
      <div className="flex items-center text-sm text-gray-600">
        {/* Optional: Dashboard Icon/Link as Root */}
        {/* <Link to="/dashboard" className="hover:text-[#044CC8] flex items-center gap-1 transition-colors">
            <i className="pi pi-th-large text-xs"></i>
            <span>Dashboard</span>
        </Link> */}
        
        {/* Or just start mapping. Since path usually starts with 'dashboard', 
            we can handle the first item specifically if we want "Home > Dashboard..." 
            or just "Dashboard > ..." 
        */}

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          let displayName = breadcrumbNameMap[value];
          
          if (!displayName) {
             if (value.length > 20 || !isNaN(Number(value))) {
                 displayName = "Chi tiết"; 
             } else {
                 displayName = value.charAt(0).toUpperCase() + value.slice(1);
             }
          }

          return (
            <Fragment key={to}>
              {index > 0 && <span className="mx-2 text-gray-400">/</span>}
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

export default DashboardBreadcrumb;
