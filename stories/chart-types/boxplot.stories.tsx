import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Boxplot',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

export const Basic: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          tooltip: { trigger: 'item' },
          xAxis: {
            type: 'category',
            data: ['Q1', 'Q2', 'Q3', 'Q4'],
          },
          yAxis: { type: 'value' },
          series: [
            {
              type: 'boxplot',
              // each: [min, Q1, median, Q3, max]
              data: [
                [655, 850, 940, 980, 1175],
                [672, 780, 840, 940, 1100],
                [780, 840, 910, 985, 1170],
                [621, 845, 950, 1080, 1280],
              ],
            },
          ],
        }}
      />
    </SizedBox>
  ),
};
