import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Scatter',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: controlledChartDefaults,
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

const points = Array.from({ length: 200 }, () => [
  Math.random() * 100,
  Math.random() * 100,
]);

export const Basic: Story = {
  args: {
    option: {
      xAxis: {},
      yAxis: {},
      tooltip: { trigger: 'item' },
      series: [{ type: 'scatter', symbolSize: 8, data: points }],
    },
  },
};

export const Bubble: Story = {
  args: {
    option: {
      xAxis: {},
      yAxis: {},
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'scatter',
          symbolSize: (val: number[]) => Math.sqrt(val[2] ?? 0) * 4,
          data: Array.from({ length: 60 }, () => [
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 200,
          ]),
        },
      ],
    },
  },
};
