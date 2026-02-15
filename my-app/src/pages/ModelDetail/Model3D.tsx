import { useState, useRef } from 'react';
import { Button, Card } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

interface Model3DProps {
  children?: React.ReactNode;
  title?: string;
}

function Model3D({ children, title = "Mô hình 3D" }: Model3DProps) {
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err: any) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div id="model-3d-section" className="mb-8 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#0f6cbf] flex items-center gap-2">
          {title}
        </h2>
        <div className="flex gap-2">
            <Button
                type="default"
                onClick={toggleFullscreen}
                disabled={!visible}
            >
                Toàn màn hình
            </Button>
            <Button 
            type="text" 
            icon={visible ? <EyeOutlined /> : <EyeInvisibleOutlined />} 
            onClick={() => setVisible(!visible)}
            className="text-gray-500 hover:text-[#0f6cbf]"
            >
            {visible ? 'Ẩn' : 'Hiện'}
            </Button>
        </div>
      </div>
      
      {visible && (
        <Card className="shadow-md overflow-hidden" bodyStyle={{ padding: 0 }}>
          <div 
            ref={containerRef}
            className="w-full h-[500px] bg-slate-100 flex items-center justify-center relative [&:fullscreen]:w-screen [&:fullscreen]:h-screen [&:fullscreen]:bg-black [&:fullscreen]:flex [&:fullscreen]:items-center [&:fullscreen]:justify-center"
          >
            {children || (
                <div className="text-center text-gray-400">
                    <p>Khu vực hiển thị Mô hình 3D</p>
                    <p className="text-sm">(Component con sẽ được render tại đây)</p>
                </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default Model3D;
