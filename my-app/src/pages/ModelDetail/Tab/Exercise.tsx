import { List, Card, Button, Typography, Tag, Radio, Input } from 'antd'; // Added Input
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'; // Added Eye icons
import type { Exercise as ExerciseType } from '../../../hooks/useContent';
import { useState } from 'react';

import { useMathJax } from '../../../hooks/useMathJax';

interface ExerciseProps {
    exercises?: ExerciseType[];
}

function Exercise({ exercises = [] }: ExerciseProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean | null>>({});
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({}); // Track solution visibility for Essay

  // Trigger MathJax whenever exercises list changes
  useMathJax(JSON.stringify(exercises));

  const handleCheck = (id: string, correctAnswer: string) => {
      const isCorrect = answers[id] === correctAnswer;
      setResults(prev => ({ ...prev, [id]: isCorrect }));
  };

  const toggleSolution = (id: string) => {
      setShowSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!exercises || exercises.length === 0) {
      return <div className="text-gray-500 italic">Chưa có bài tập luyện tập.</div>;
  }

  return (
    <div className="py-4">
       <Typography.Title level={4}>Luyện tập</Typography.Title>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={exercises}
        renderItem={(item) => {
            const options = item.options as {id: string, text: string}[];
            const result = results[item.id];
            const isEssay = item.type === 'Essay';
            const isSolutionVisible = showSolutions[item.id];

            return (
              <List.Item>
                <div id={`exercise-${item.id}`} className="scroll-mt-24">
                <Card 
                    title={<div className="flex justify-between items-center w-full">
                        <span className="font-bold">Câu hỏi</span>
                        <Tag color={item.level === 'EASY' ? 'green' : item.level === 'MEDIUM' ? 'orange' : 'red'}>
                            {item.level}
                        </Tag>
                    </div>} 
                    className={`hover:shadow-md transition-shadow ${result === true ? 'border-green-500' : result === false ? 'border-red-500' : ''}`}
                >
                  <div className="mb-4 text-base" dangerouslySetInnerHTML={{ __html: item.question }} />

                  {isEssay ? (
                      <div className="space-y-4">
                          <Input.TextArea 
                              rows={4} 
                              placeholder="Nhập câu trả lời của bạn vào đây (tự luyện tập)..." 
                          />
                           <div>
                                <Button 
                                    icon={isSolutionVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                    onClick={() => toggleSolution(item.id)}
                                >
                                    {isSolutionVisible ? 'Ẩn đáp án' : 'Xem đáp án tham khảo'}
                                </Button>
                           </div>
                           
                           {isSolutionVisible && (
                               <div className="bg-green-50 p-4 rounded border border-green-200 mt-2">
                                   <div className="font-bold text-green-800 mb-2">Đáp án / Hướng dẫn:</div>
                                   <div className="text-gray-800 whitespace-pre-wrap">{item.correct_answer}</div>
                               </div>
                           )}
                      </div>
                  ) : (
                      options && options.length > 0 ? (
                        <>
                          <Radio.Group 
                            onChange={(e) => setAnswers(prev => ({ ...prev, [item.id]: e.target.value }))} 
                            value={answers[item.id]}
                            className="w-full flex flex-col gap-2 mb-4"
                          >
                              {options.map((opt) => (
                                  <Radio key={opt.id} value={opt.id} className="text-base">
                                      <span className="font-bold mr-2">{opt.id}.</span> {opt.text}
                                  </Radio>
                              ))}
                          </Radio.Group>
                          
                          <div className="flex gap-2">
                               <Button 
                                    type="primary" 
                                    size="small" 
                                    onClick={() => handleCheck(item.id, item.correct_answer)}
                                    disabled={!answers[item.id]}
                                >
                                    Kiểm tra
                                </Button>
                                {result === true && <span className="text-green-600 flex items-center gap-1"><CheckCircleOutlined /> Chính xác!</span>}
                                {result === false && <span className="text-red-600 flex items-center gap-1"><CloseCircleOutlined /> Sai rồi, đáp án là {item.correct_answer}</span>}
                          </div>
                        </>
                      ) : (
                         <div className="text-gray-500 italic text-sm">
                            (Câu hỏi này không có trắc nghiệm, vui lòng đọc và tham khảo thông tin trên)
                         </div>
                      )
                  )}
                </Card>
                </div>
              </List.Item>
            );
        }}
      />
    </div>
  );
}

export default Exercise;
