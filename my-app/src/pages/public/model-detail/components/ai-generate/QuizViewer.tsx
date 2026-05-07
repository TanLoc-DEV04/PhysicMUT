import { useState } from "react";
import { Card, Typography, Radio, Button, Result, Progress } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export interface QuizData {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface QuizViewerProps {
  quizzes: QuizData[];
}

export default function QuizViewer({ quizzes }: QuizViewerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!quizzes || quizzes.length === 0) return null;

  const currentQuiz = quizzes[currentIdx];

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    if (selectedOption === currentQuiz.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < quizzes.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / quizzes.length) * 100);
    return (
      <Card className="max-w-3xl mx-auto my-6 shadow-md border-t-4 border-t-green-500">
        <Result
          status={percentage >= 50 ? "success" : "warning"}
          title={
            percentage >= 50
              ? "Tuyệt vời! Bạn đã hoàn thành bài tập."
              : "Bạn cần cố gắng hơn nhé!"
          }
          subTitle={`Bạn đã trả lời đúng ${score}/${quizzes.length} câu hỏi.`}
          extra={[
            <Progress
              key="prog"
              type="circle"
              percent={percentage}
              size={120}
              className="mb-6 block mx-auto"
            />,
            <Button
              key="restart"
              type="primary"
              onClick={handleRestart}
              size="large"
            >
              Làm lại bài
            </Button>,
          ]}
        />
      </Card>
    );
  }

  const isCorrect = selectedOption === currentQuiz.answer;

  return (
    <Card className="max-w-3xl mx-auto my-6 shadow-md border-t-4 border-t-blue-500">
      <div className="flex justify-between items-center mb-6 text-gray-500">
        <Text strong className="text-blue-600">
          Câu hỏi {currentIdx + 1} / {quizzes.length}
        </Text>
        <Text>Điểm: {score}</Text>
      </div>

      <Title level={4} className="mb-6 leading-relaxed">
        {currentQuiz.question}
      </Title>

      <Radio.Group
        onChange={(e) => setSelectedOption(e.target.value)}
        value={selectedOption}
        className="w-full flex flex-col gap-4 mb-8"
        disabled={isSubmitted}
      >
        {currentQuiz.options.map((option, idx) => {
          let optionClass =
            "p-4 border rounded-lg transition-all w-full text-base";
          if (isSubmitted) {
            if (option === currentQuiz.answer) {
              optionClass += " border-green-500 bg-green-50 animate-pulse-once";
            } else if (
              option === selectedOption &&
              option !== currentQuiz.answer
            ) {
              optionClass += " border-red-500 bg-red-50";
            }
          } else if (option === selectedOption) {
            optionClass += " border-blue-500 bg-blue-50";
          } else {
            optionClass += " hover:bg-gray-50";
          }

          return (
            <Radio key={idx} value={option} className={optionClass}>
              <div className="flex w-full items-center whitespace-normal break-words">
                <span className="flex-grow">{option}</span>
                {isSubmitted && option === currentQuiz.answer && (
                  <CheckCircleOutlined className="text-green-500 ml-2 text-xl" />
                )}
                {isSubmitted &&
                  option === selectedOption &&
                  option !== currentQuiz.answer && (
                    <CloseCircleOutlined className="text-red-500 ml-2 text-xl" />
                  )}
              </div>
            </Radio>
          );
        })}
      </Radio.Group>

      {isSubmitted && (
        <div
          className={`p-4 rounded-lg mb-6 ${isCorrect ? "bg-green-100 border border-green-300" : "bg-orange-100 border border-orange-300"}`}
        >
          <Text
            strong
            className={isCorrect ? "text-green-700" : "text-orange-700"}
          >
            {isCorrect ? "Chính xác! 🎉" : "Opps! Chưa đúng rồi."}
          </Text>
          <Paragraph className="mt-2 text-gray-700 mb-0">
            <Text strong>Giải thích: </Text>
            {currentQuiz.explanation}
          </Paragraph>
        </div>
      )}

      <div className="flex justify-end mt-4">
        {!isSubmitted ? (
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="w-32"
          >
            Kiểm tra
          </Button>
        ) : (
          <Button
            type="primary"
            size="large"
            onClick={handleNext}
            className="w-32"
          >
            {currentIdx < quizzes.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
          </Button>
        )}
      </div>
    </Card>
  );
}
