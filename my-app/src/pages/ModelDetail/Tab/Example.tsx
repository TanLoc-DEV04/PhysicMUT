import { List, Card, Typography, Collapse } from 'antd';
import type { Example as ExampleType } from '../../../hooks/useContent';
import MathJaxRenderer from '../../../components/shared/MathJaxRenderer';

export interface ExampleProps {
    examples?: ExampleType[];
}

function Example({ examples = [] }: ExampleProps) {
  // No global useMathJax needed here anymore.

  if (!examples || examples.length === 0) {
      return <div className="text-gray-500 italic">Chưa có bài tập mẫu.</div>;
  }

  return (
    <div className="py-4">
      <Typography.Title level={4}>Bài tập mẫu</Typography.Title>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={examples}
        renderItem={(item) => {
            let solutionData: any = {};
            try {
                solutionData = JSON.parse(item.solution);
            } catch (e) {
                solutionData = { finalAnswer: item.solution };
            }

            return (
              <List.Item>
                <div id={`example-${item.id}`} className="scroll-mt-24">
                <Card title={item.title} className="hover:shadow-md transition-shadow">
                  <MathJaxRenderer className="font-semibold mb-2" html={item.problem} />
                  
                  <Collapse ghost 
                    onChange={() => {
                        if ((window as any).MathJax) {
                            setTimeout(() => {
                                (window as any).MathJax.typesetPromise();
                            }, 100);
                        }
                    }}
                    items={[{
                      key: '1',
                      label: 'Xem lời giải',
                      children: (
                          <div>
                              {solutionData.steps ? (
                                  <div className="space-y-4">
                                      {solutionData.steps.map((step: any) => (
                                          <div key={step.stepNumber} className="border-l-4 border-blue-200 pl-4">
                                              <p className="font-bold text-blue-800">Bước {step.stepNumber}: {step.description}</p>
                                              {step.formula && <p className="font-mono bg-gray-50 p-1 rounded">Công thức: {step.formula}</p>}
                                              {step.calculation && <p>Thay số: {step.calculation}</p>}
                                              {step.explanation && <p className="text-gray-600 italic">{step.explanation}</p>}
                                          </div>
                                      ))}
                                      <div className="mt-4 pt-2 border-t font-bold text-green-700">
                                          Đáp án: {solutionData.finalAnswer}
                                      </div>
                                  </div>
                              ) : (
                                  <MathJaxRenderer html={item.solution} />
                              )}
                          </div>
                      )
                  }]} />
                </Card>
                </div>
              </List.Item>
            );
        }}
      />
    </div>
  );
}

export default Example;
