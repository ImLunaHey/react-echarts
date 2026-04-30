import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Line',
  component: Chart,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Chart>;

export const Basic: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          },
          yAxis: { type: 'value' },
          tooltip: { trigger: 'axis' },
          series: [{ type: 'line', data: [820, 932, 901, 934, 1290, 1330, 1320] }],
        }}
      />
    </SizedBox>
  ),
};

export const Smooth: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          xAxis: { type: 'category', data: Array.from({ length: 12 }, (_, i) => `M${i + 1}`) },
          yAxis: { type: 'value' },
          tooltip: { trigger: 'axis' },
          series: [
            {
              type: 'line',
              smooth: true,
              areaStyle: {},
              data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330],
            },
          ],
        }}
      />
    </SizedBox>
  ),
};

export const MultiSeries: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          legend: { data: ['Email', 'Union Ads', 'Direct'] },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
          yAxis: { type: 'value' },
          series: [
            { name: 'Email', type: 'line', data: [120, 132, 101, 134, 90, 230, 210] },
            { name: 'Union Ads', type: 'line', data: [220, 182, 191, 234, 290, 330, 310] },
            { name: 'Direct', type: 'line', data: [320, 332, 301, 334, 390, 330, 320] },
          ],
        }}
      />
    </SizedBox>
  ),
};
