import { Suspense, lazy, useState } from "react";
import { Spin, Button } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import Placeholder from "./Placeholder/Placeholder";
import Model3D from "../../pages/public/model-detail/Model3D";

// Lazy load heavy simulation components
const CyclotronSim = lazy(
  () => import("../../features/cyclotron/components/CyclotronGame"),
);
const LoudspeakerSim = lazy(
  () => import("../../features/loudspeaker/components/LSGame"),
);
const MassSpectrometerSim = lazy(
  () => import("../../features/mass-spectrometry/components/MSGame"),
);

interface ModelRegistryProps {
  modelType?: string; // e.g., 'CYCLOTRON', 'MASS_SPECTROMETER'
  modelName?: string;
  description?: string;
  thumbnailUrl?: string; // Fallback image if needed
}

export default function ModelRegistry({
  modelType,
  modelName,
  description,
  thumbnailUrl,
}: ModelRegistryProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const normalizedType = modelType?.toUpperCase().trim();

  const renderContent = () => {
    switch (normalizedType) {
      case "CYCLOTRON":
        return <CyclotronSim />;
      case "MASS_SPECTROMETER":
      case "MASS-SPECTROMETER":
        return <MassSpectrometerSim />;
      case "LOUDSPEAKER":
      case "SPEAKER":
        return <LoudspeakerSim />;
      default:
        return (
          <Placeholder modelName={modelName || ""} description={description} />
        );
    }
  };

  // ── FACADE PATTERN: Prevent loading 3D until user interaction ──
  if (!isLoaded && normalizedType !== "UNKNOWN") {
    return (
      <Model3D title={modelName}>
        <div
          className="relative w-full h-[500px] overflow-hidden group cursor-pointer bg-slate-200"
          onClick={() => setIsLoaded(true)}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={modelName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Chưa có hình ảnh mô phỏng
            </div>
          )}

          {/* Overlay with play button */}
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-all group-hover:bg-black/20">
            <div className="w-20 h-20 rounded-full bg-[#0f6cbf] flex items-center justify-center mb-4 shadow-xl transform transition-transform group-hover:scale-110">
              <PlayCircleOutlined
                style={{ fontSize: "48px", color: "white" }}
              />
            </div>
            <Button
              type="primary"
              size="large"
              className="bg-[#0f6cbf] border-none font-bold px-8 h-12 rounded-full shadow-lg"
            >
              TẢI MÔ HÌNH 3D TƯƠNG TÁC
            </Button>
            <p className="text-white mt-4 font-medium opacity-80">
              Tiết kiệm dữ liệu & Tăng tốc độ tải trang
            </p>
          </div>
        </div>
      </Model3D>
    );
  }

  return (
    <Model3D title={modelName}>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Spin size="large" />
            <p className="text-gray-500">Đang khởi tạo môi trường 3D...</p>
          </div>
        }
      >
        {renderContent()}
      </Suspense>
    </Model3D>
  );
}
