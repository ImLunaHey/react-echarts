import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Effect scatter',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: controlledChartDefaults,
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

export const Basic: Story = {
  args: {
    option: {
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
    },
  },
};
