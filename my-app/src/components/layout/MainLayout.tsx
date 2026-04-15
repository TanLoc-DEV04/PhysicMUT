import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Breadcrumb from '../shared/Breadcrumb';

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb />
      <main className="flex-1 w-full max-w-[1920px] mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
