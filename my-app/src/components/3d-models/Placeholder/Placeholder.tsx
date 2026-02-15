
import { Result } from 'antd';
import { CameraOutlined } from '@ant-design/icons';

interface PlaceholderProps {
    modelName: string;
    description?: string;
}

const Placeholder = ({ modelName, description }: PlaceholderProps) => {
    return (
        <div className="flex items-center justify-center w-full h-full bg-slate-100 rounded-lg">
            <Result
                icon={<CameraOutlined className="text-gray-400 text-6xl" />}
                title={`Mô hình "${modelName}" chưa có mô phỏng`}
                subTitle={description || "Hiện tại chưa có mã nguồn mô phỏng cho mô hình này. Vui lòng quay lại sau."}
            />
        </div>
    );
};

export default Placeholder;
