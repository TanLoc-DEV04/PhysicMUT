import { useState } from 'react';
import { Card, Button, Typography, Dropdown, Spin, message, Divider } from 'antd';
import type { MenuProps } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, RobotOutlined } from '@ant-design/icons';
import MathJaxRenderer from '../../components/shared/MathJaxRenderer';
import SlideViewer from '../../components/ai-generate/SlideViewer';
import type { SlideData } from '../../components/ai-generate/SlideViewer';
import QuizViewer from '../../components/ai-generate/QuizViewer';
import type { QuizData } from '../../components/ai-generate/QuizViewer';

const { Paragraph, Title } = Typography;

interface TheoryProps {
    title?: string;
    content?: string;
}

function Theory({ title = "Lý thuyết", content }: TheoryProps) {
    const [visible, setVisible] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedSlides, setGeneratedSlides] = useState<SlideData[] | null>(null);
    const [generatedQuizzes, setGeneratedQuizzes] = useState<QuizData[] | null>(null);

    const handleGenerate = async (type: 'slide' | 'quiz', numQuestions?: number) => {
        if (!content) {
            message.warning("Không có nội dung lý thuyết để tạo!");
            return;
        }

        setIsGenerating(true);
        // Reset previous generated content
        setGeneratedSlides(null);
        setGeneratedQuizzes(null);

        try {
            const response = await fetch('http://localhost:8000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    theory_content: content.substring(0, 4000), // Limit payload size slightly if huge
                    type: type,
                    num_questions: numQuestions || 5
                }),
            });

            if (!response.ok) {
                throw new Error("Có lỗi xảy ra khi kết nối tới máy chủ AI.");
            }

            const data = await response.json();
            
            if (type === 'slide') {
                if (data.slides) {
                    setGeneratedSlides(data.slides);
                    message.success("Đã tạo Slide thành công!");
                } else {
                    throw new Error("Dữ liệu trả về không hợp lệ.");
                }
            } else if (type === 'quiz') {
                if (data.quizzes) {
                    setGeneratedQuizzes(data.quizzes);
                    message.success(`Đã tạo ${data.quizzes.length} câu hỏi trắc nghiệm thành công!`);
                } else {
                    throw new Error("Dữ liệu trả về không hợp lệ.");
                }
            }

        } catch (error: any) {
            console.error("Lỗi AI Generate:", error);
            message.error(error.message || "Tạo thất bại. Vui lòng thử lại sau.");
        } finally {
            setIsGenerating(false);
        }
    };

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: 'Tạo Slide Bài Giảng',
            onClick: () => handleGenerate('slide')
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            label: 'Tạo Quiz (5 câu)',
            onClick: () => handleGenerate('quiz', 5)
        },
        {
            key: '3',
            label: 'Tạo Quiz (10 câu)',
            onClick: () => handleGenerate('quiz', 10)
        },
        {
            key: '4',
            label: 'Tạo Quiz (15 câu)',
            onClick: () => handleGenerate('quiz', 15)
        }
    ];

    return (
        <div id="theory-section" className="mb-8 scroll-mt-20">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#0f6cbf] flex items-center gap-2">
                    {title}
                </h2>
                <div className="flex gap-4 items-center">
                    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
                        <Button 
                            type="primary" 
                            icon={<RobotOutlined />} 
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 border-none flex items-center shadow-md shadow-purple-200"
                        >
                            AI Generate
                        </Button>
                    </Dropdown>

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
                <Card className="shadow-sm border-l-4 border-l-[#0f6cbf]">
                    <Typography>
                        <Title level={4}>Lý thuyết mô hình</Title>
                        {content ? (
                            <MathJaxRenderer html={content} />
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

            {isGenerating && (
                <div className="mt-8 text-center p-8 bg-indigo-50 rounded-xl border border-indigo-100">
                    <Spin size="large" />
                    <Title level={5} className="mt-4 text-indigo-500">
                        AI đang phân tích lý thuyết và thiết kế nội dung...
                    </Title>
                    <Paragraph className="text-gray-500">Quá trình này có thể mất từ 10 - 20 giây, vui lòng đợi.</Paragraph>
                </div>
            )}

            {!isGenerating && generatedSlides && (
                <div className="mt-8 animate-fade-in">
                    <Divider>
                        <span className="text-lg font-bold text-indigo-600 flex items-center gap-2">
                            <RobotOutlined /> AI Generated Slide Deck
                        </span>
                    </Divider>
                    <SlideViewer slides={generatedSlides} />
                </div>
            )}

            {!isGenerating && generatedQuizzes && (
                <div className="mt-8 animate-fade-in">
                    <Divider>
                        <span className="text-lg font-bold text-indigo-600 flex items-center gap-2">
                            <RobotOutlined /> Interactive Quizzes
                        </span>
                    </Divider>
                    <QuizViewer quizzes={generatedQuizzes} />
                </div>
            )}
        </div>
    );
}

export default Theory;
