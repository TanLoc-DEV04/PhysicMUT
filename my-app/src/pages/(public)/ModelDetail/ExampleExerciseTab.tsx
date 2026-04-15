import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import Example from './Tab/Example';
import Exercise from './Tab/Exercise';
import type { Example as ExampleType, Exercise as ExerciseType } from '../../../../hooks/useContent';

interface Props {
    examples?: ExampleType[];
    exercises?: ExerciseType[];
    activeTab?: string;
    onTabChange?: (key: string) => void;
}

function ExampleExerciseTab({ examples, exercises, activeTab, onTabChange }: Props) {
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Bài tập mẫu',
      children: <Example examples={examples} />,
    },
    {
      key: '2',
      label: 'Luyện tập',
      children: <Exercise exercises={exercises} />,
    },
  ];

  return (
    <div id="exercises-section" className="bg-white rounded-lg p-4 shadow-sm scroll-mt-20">
      <Tabs activeKey={activeTab} defaultActiveKey="1" items={items} onChange={onTabChange} />
    </div>
  );
}

export default ExampleExerciseTab;
