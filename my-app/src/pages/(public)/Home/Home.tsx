import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CaretRightOutlined } from '@ant-design/icons';

  import { useAuth } from '../../../contexts/AuthContext';

  function Home() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
  
    const handleStartLearning = () => {
      if (currentUser) {
        navigate('/models');
      } else {
        navigate('/login');
      }
    };

  return (
    <div className="min-h-[calc(100vh-64px)] relative flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
         <img src="/logo.png" alt="Background" className="w-full h-full object-contain transform translate-x-1/4 scale-150" />
      </div>

      <div className="relative z-10 text-center max-w-4xl px-6">
        <h1 className="text-6xl font-russo font-bold text-[#0f6cbf] mb-6 drop-shadow-sm">
          PHYSIC<span className="text-orange-500">MUT</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
          Nền tảng mô phỏng thí nghiệm VẬT LÝ ảo 3D trực quan,<br/>
          giúp việc học tập và giảng dạy trở nên sinh động và hiệu quả hơn.
        </p>
        
        <Button 
          type="primary" 
          size="large" 
          shape="round"
          icon={<CaretRightOutlined />}
          className="h-14 px-10 text-xl font-bold uppercase tracking-wider bg-[#0f6cbf] hover:bg-blue-600 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          onClick={handleStartLearning}
        >
          Bắt đầu học ngay
        </Button>
      </div>
    </div>
  );
}

export default Home;
