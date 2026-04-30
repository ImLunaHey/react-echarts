import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Gauge',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: controlledChartDefaults,
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

export const Basic: Story = {
  args: {
    option: {
      series: [
        {
          type: 'gauge',
          progress: { show: true },
          detail: { valueAnimation: true, formatter: '{value}' },
          data: [{ value: 72, name: 'Score' }],
        },
      ],
    },
  },
};

export const Speedometer: Story = {
  args: {
    option: {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 220,
          splitNumber: 11,
          axisLine: {
            lineStyle: {
              width: 18,
              color: [
                [0.3, '#67e0e3'],
                [0.7, '#37a2da'],
                [1, '#fd666d'],
              ],
            },
          },
          detail: { formatter: '{value} km/h' },
          data: [{ value: 145 }],
        },
      ],
    },
  },
};
