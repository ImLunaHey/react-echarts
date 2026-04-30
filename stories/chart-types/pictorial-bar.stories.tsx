import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Pictorial bar',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: controlledChartDefaults,
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

export const Diamonds: Story = {
  args: {
    option: {
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
    },
  },
};
