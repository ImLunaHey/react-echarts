import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Theme river',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

const days = Array.from({ length: 14 }, (_, i) => `2026-04-${String(i + 1).padStart(2, '0')}`);
const topics = ['React', 'Vue', 'Svelte', 'Solid', 'Astro'];
const data: Array<[string, number, string]> = [];
for (const day of days) {
  for (const topic of topics) {
    data.push([day, Math.floor(Math.random() * 50) + 10, topic]);
  }
}

export const Mentions: Story = {
  render: () => (
    <SizedBox width={720} height={400}>
      <Chart
        option={{
          tooltip: { trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: 'rgba(0,0,0,0.2)', width: 1, type: 'solid' } } },
          legend: { bottom: 0, data: topics },
          singleAxis: { top: 30, bottom: 50, axisTick: {}, axisLabel: {}, type: 'time' },
          series: [
            {
              type: 'themeRiver',
              emphasis: { itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.4)' } },
              data,
            },
          ],
        }}
      />
    </SizedBox>
  ),
};
