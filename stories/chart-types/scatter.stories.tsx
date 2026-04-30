import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Scatter',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

const points = Array.from({ length: 200 }, () => [
  Math.random() * 100,
  Math.random() * 100,
]);

export const Basic: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          xAxis: {},
          yAxis: {},
          tooltip: { trigger: 'item' },
          series: [{ type: 'scatter', symbolSize: 8, data: points }],
        }}
      />
    </SizedBox>
  ),
};

export const Bubble: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          xAxis: {},
          yAxis: {},
          tooltip: { trigger: 'item' },
          series: [
            {
              type: 'scatter',
              symbolSize: (val: number[]) => Math.sqrt(val[2] ?? 0) * 4,
              data: Array.from({ length: 60 }, () => [
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 200,
              ]),
            },
          ],
        }}
      />
    </SizedBox>
  ),
};
