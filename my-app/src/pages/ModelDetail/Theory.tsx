import { useState } from 'react';
import { Card, Button, Typography } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const { Paragraph, Title } = Typography;

interface TheoryProps {
    title?: string;
    content?: string;
}

import { useMathJax } from '../../hooks/useMathJax';

function Theory({ title = "Lý thuyết", content }: TheoryProps) {
    const [visible, setVisible] = useState(true);

  useMathJax(content);

  return (
    <div id="theory-section" className="mb-8 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#0f6cbf] flex items-center gap-2">
            {title}
        </h2>
         <Button 
          type="text" 
          icon={visible ? <EyeOutlined /> : <EyeInvisibleOutlined />} 
          onClick={() => setVisible(!visible)}
          className="text-gray-500 hover:text-[#0f6cbf]"
        >
          {visible ? 'Ẩn' : 'Hiện'}
        </Button>
      </div>

      {visible && (
        <Card className="shadow-sm border-l-4 border-l-[#0f6cbf]">
          <Typography>
            <Title level={4}>Lý thuyết mô hình</Title>
            {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
                <>
                <Paragraph>
                Đây là khu vực hiển thị nội dung lý thuyết chi tiết của mô hình. 
                Nội dung này có thể bao gồm các công thức, định luật, và giải thích hiện tượng vật lý.
                </Paragraph>
                <Paragraph>
                Ví dụ: Trong máy gia tốc Cyclotron, hạt mang điện được gia tốc bởi điện trường biến thiên và bị uốn cong bởi từ trường đều.
                Bán kính quỹ đạo được tính theo công thức: R = mv / (qB).
                </Paragraph>
                </>
            )}
            
          </Typography>
        </Card>
      )}
    </div>
  );
}

export default Theory;
