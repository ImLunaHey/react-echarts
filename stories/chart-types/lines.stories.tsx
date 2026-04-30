import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Lines',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: controlledChartDefaults,
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

const flights = [
  { coords: [[10, 12], [80, 88]] },
  { coords: [[15, 60], [90, 18]] },
  { coords: [[5, 30], [55, 70], [95, 45]] },
  { coords: [[25, 8], [45, 92]] },
  { coords: [[2, 80], [60, 30], [98, 70]] },
];

export const Trails: Story = {
  args: {
    option: {
      xAxis: { type: 'value', min: 0, max: 100 },
      yAxis: { type: 'value', min: 0, max: 100 },
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          polyline: true,
          effect: { show: true, period: 4, trailLength: 0.3, symbolSize: 6 },
          lineStyle: { width: 1.5, opacity: 0.7, curveness: 0.2 },
          data: flights,
        },
      ],
    },
  },
};
