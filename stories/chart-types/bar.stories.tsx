import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Bar',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

export const Basic: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
          yAxis: { type: 'value' },
          tooltip: { trigger: 'axis' },
          series: [{ type: 'bar', data: [120, 200, 150, 80, 70, 110, 130] }],
        }}
      />
    </SizedBox>
  ),
};

export const Stacked: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          legend: {},
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
          yAxis: { type: 'value' },
          series: [
            { name: 'A', type: 'bar', stack: 'total', data: [120, 132, 101, 134, 90] },
            { name: 'B', type: 'bar', stack: 'total', data: [220, 182, 191, 234, 290] },
            { name: 'C', type: 'bar', stack: 'total', data: [150, 232, 201, 154, 190] },
          ],
        }}
      />
    </SizedBox>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: ['Brazil', 'Indonesia', 'USA', 'India', 'China'] },
          series: [{ type: 'bar', data: [18203, 23489, 29034, 104970, 131744] }],
        }}
      />
    </SizedBox>
  ),
};
