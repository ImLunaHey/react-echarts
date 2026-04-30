import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Candlestick',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

// Each row: [open, close, lowest, highest]
const data = [
  [20, 34, 10, 38],
  [40, 35, 30, 50],
  [31, 38, 33, 44],
  [38, 15, 5, 42],
  [55, 25, 12, 60],
  [25, 47, 18, 55],
  [33, 25, 10, 38],
];

export const Basic: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          tooltip: { trigger: 'axis' },
          xAxis: {
            type: 'category',
            data: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
          },
          yAxis: { type: 'value' },
          series: [{ type: 'candlestick', data }],
        }}
      />
    </SizedBox>
  ),
};
