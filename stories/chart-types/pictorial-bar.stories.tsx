import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Pictorial bar',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

export const Diamonds: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
          yAxis: { type: 'value' },
          tooltip: { trigger: 'axis' },
          series: [
            {
              type: 'pictorialBar',
              symbol: 'diamond',
              symbolSize: [22, 12],
              symbolRepeat: true,
              symbolMargin: '6%',
              symbolClip: true,
              data: [12, 18, 7, 22, 15],
              z: 10,
            },
          ],
        }}
      />
    </SizedBox>
  ),
};
