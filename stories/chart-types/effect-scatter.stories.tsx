import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Effect scatter',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

export const Basic: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          xAxis: { type: 'value' },
          yAxis: { type: 'value' },
          tooltip: { trigger: 'item' },
          series: [
            {
              type: 'effectScatter',
              symbolSize: 18,
              rippleEffect: { period: 4, scale: 4, brushType: 'fill' },
              data: [
                [12, 38],
                [42, 70],
                [55, 21],
                [78, 56],
                [90, 88],
              ],
            },
          ],
        }}
      />
    </SizedBox>
  ),
};
