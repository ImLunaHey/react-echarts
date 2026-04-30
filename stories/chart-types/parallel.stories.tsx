import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Parallel',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

export const Basic: Story = {
  render: () => (
    <SizedBox width={720} height={420}>
      <Chart
        option={{
          parallelAxis: [
            { dim: 0, name: 'Price' },
            { dim: 1, name: 'Volume' },
            { dim: 2, name: 'P/E' },
            { dim: 3, name: 'Yield' },
            { dim: 4, name: 'Growth' },
          ],
          parallel: { left: '6%', right: '15%', bottom: '12%', top: '12%' },
          series: [
            {
              type: 'parallel',
              lineStyle: { width: 2, opacity: 0.6 },
              data: [
                [12, 1100, 14, 1.2, 8],
                [40, 320, 22, 2.1, 12],
                [80, 80, 35, 0.4, 20],
                [25, 540, 12, 1.8, 6],
                [60, 220, 27, 2.4, 16],
              ],
            },
          ],
        }}
      />
    </SizedBox>
  ),
};
