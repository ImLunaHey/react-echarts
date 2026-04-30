import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Features/Theme',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

const option = {
  title: { text: 'Quarterly revenue', left: 'center' },
  legend: { data: ['Plan', 'Actual'], bottom: 0 },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
  yAxis: { type: 'value' },
  series: [
    { name: 'Plan', type: 'bar', data: [320, 332, 301, 334] },
    { name: 'Actual', type: 'bar', data: [220, 182, 191, 234] },
  ],
};

export const Default: Story = {
  render: () => (
    <SizedBox>
      <Chart option={option} />
    </SizedBox>
  ),
};

export const InlineDarkTheme: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={option}
        theme={{
          backgroundColor: '#1c1f24',
          textStyle: { color: '#e6e6e6' },
          color: ['#7eb6ff', '#ff8a80', '#ffd180', '#b9f6ca'],
          title: { textStyle: { color: '#ffffff' } },
        }}
      />
    </SizedBox>
  ),
};
