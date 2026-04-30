import type { Meta, StoryObj } from '@storybook/react-vite';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { Chart } from '../../src/core';
import { SizedBox } from '../decorators';

echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  CanvasRenderer,
]);

const meta: Meta<typeof Chart> = {
  title: 'Features/Tree-shaken (core)',
  component: Chart,
  parameters: {
    docs: {
      description: {
        component:
          'Imports `<Chart>` from `@imlunahey/react-echarts/core`. Only the chart and component types you `echarts.use(...)` ship in your bundle.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chart>;

export const RegisteredOnly: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          title: { text: 'Tree-shaken bundle' },
          legend: { bottom: 0 },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
          yAxis: { type: 'value' },
          series: [
            { name: 'A', type: 'line', data: [120, 132, 101, 134, 90] },
            { name: 'B', type: 'bar', data: [220, 182, 191, 234, 290] },
          ],
        }}
      />
    </SizedBox>
  ),
};
