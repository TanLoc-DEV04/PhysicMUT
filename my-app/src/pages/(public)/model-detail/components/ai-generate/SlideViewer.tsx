import { Carousel, Card, Typography, List } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export interface SlideData {
  title: string;
  content: string[];
}

interface SlideViewerProps {
  slides: SlideData[];
}

export default function SlideViewer({ slides }: SlideViewerProps) {
  if (!slides || slides.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 relative bg-gray-50 p-4 rounded-xl shadow-inner">
      <Carousel
        arrows
        prevArrow={
          <div className="text-gray-400 hover:text-blue-500 text-3xl">
            <LeftOutlined />
          </div>
        }
        nextArrow={
          <div className="text-gray-400 hover:text-blue-500 text-3xl">
            <RightOutlined />
          </div>
        }
        dots={{ className: "custom-carousel-dots" }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="px-10 py-4 outline-none">
            <Card className="h-[400px] flex flex-col justify-center border-t-4 border-t-blue-500 shadow-lg rounded-2xl bg-white">
              <div className="text-center mb-6">
                <Title level={2} className="text-blue-700 m-0">
                  {slide.title}
                </Title>
              </div>
              <div className="flex-grow flex flex-col justify-center px-8">
                <List
                  dataSource={slide.content}
                  renderItem={(item) => (
                    <List.Item className="border-b-0 py-2">
                      <div className="flex items-start">
                        <span className="text-blue-500 font-bold mr-3 mt-1 text-xl">
                          •
                        </span>
                        <Paragraph className="text-lg m-0">{item}</Paragraph>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
              <div className="absolute bottom-4 right-6 text-gray-400 text-sm">
                {index + 1} / {slides.length}
              </div>
            </Card>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
