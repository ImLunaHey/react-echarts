import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Heatmap',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: controlledChartDefaults,
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a'];
const days = ['Sat', 'Fri', 'Thu', 'Wed', 'Tue', 'Mon', 'Sun'];

const data: [number, number, number][] = [];
for (let d = 0; d < days.length; d++) {
  for (let h = 0; h < hours.length; h++) {
    data.push([h, d, Math.floor(Math.random() * 10)]);
  }
}

export const Basic: Story = {
  args: {
    option: {
      tooltip: { position: 'top' },
      grid: { height: '60%', top: '10%' },
      xAxis: { type: 'category', data: hours, splitArea: { show: true } },
      yAxis: { type: 'category', data: days, splitArea: { show: true } },
      visualMap: { min: 0, max: 10, calculable: true, orient: 'horizontal', bottom: '5%' },
      series: [
        {
          type: 'heatmap',
          data,
          label: { show: true },
          emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
        },
      ],
    },
  },
};
