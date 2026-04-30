import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Features/SVG renderer',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

const option = {
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  yAxis: { type: 'value' },
  tooltip: { trigger: 'axis' },
  series: [{ type: 'line', data: [120, 132, 101, 134, 90], smooth: true }],
};

export const Svg: Story = {
  render: () => (
    <SizedBox>
      <Chart option={option} renderer="svg" />
    </SizedBox>
  ),
};

export const Canvas: Story = {
  render: () => (
    <SizedBox>
      <Chart option={option} renderer="canvas" />
    </SizedBox>
  ),
};
