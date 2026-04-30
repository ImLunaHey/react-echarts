import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';

import { Chart, type ChartHandle } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta = {
  title: 'Features/Imperative ref',
};

export default meta;
type Story = StoryObj;

const HighlightOnDemand = () => {
  const ref = useRef<ChartHandle>(null);

  return (
    <div>
      <SizedBox>
        <Chart
          ref={ref}
          option={{
            xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
            yAxis: { type: 'value' },
            tooltip: { trigger: 'axis' },
            series: [
              {
                type: 'bar',
                data: [12, 18, 7, 22, 15],
                itemStyle: { color: '#5470c6' },
                emphasis: {
                  focus: 'self',
                  itemStyle: { color: '#ff5c5c', borderColor: '#1f1f1f', borderWidth: 2 },
                },
                blur: { itemStyle: { opacity: 0.2 } },
              },
            ],
          }}
        />
      </SizedBox>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <button
            key={i}
            onClick={() =>
              ref.current?.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: i })
            }
          >
            Highlight {String.fromCharCode(65 + i)}
          </button>
        ))}
        <button
          onClick={() =>
            ref.current?.dispatchAction({ type: 'downplay', seriesIndex: 0 })
          }
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export const HighlightDispatch: Story = {
  render: () => <HighlightOnDemand />,
};
