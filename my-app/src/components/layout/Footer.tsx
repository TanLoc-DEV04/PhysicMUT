

function Footer() {
  return (
    <footer className="bg-[#343a40] text-white py-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h2 className="text-xl font-bold mb-2">PhysicMUT</h2>
            <p className="text-gray-400 text-sm">
              Nền tảng học tập Vật lý trực quan 3D.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              &copy; {new Date().getFullYear()} PhysicMUT. All rights reserved.
            </p>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <i className="pi pi-facebook text-xl"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <i className="pi pi-github text-xl"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <i className="pi pi-envelope text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
