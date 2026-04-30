import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Heatmap',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a'];
const days = ['Sat', 'Fri', 'Thu', 'Wed', 'Tue', 'Mon', 'Sun'];

const data: [number, number, number][] = [];
for (let d = 0; d < days.length; d++) {
  for (let h = 0; h < hours.length; h++) {
    data.push([h, d, Math.floor(Math.random() * 10)]);
  }
}

export const Basic: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
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
        }}
      />
    </SizedBox>
  ),
};
