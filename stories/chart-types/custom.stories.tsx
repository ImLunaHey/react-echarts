import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Custom',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: controlledChartDefaults,
  parameters: {
    docs: {
      description: {
        component:
          'The `custom` series lets you draw arbitrary shapes per data point. This example renders horizontal range bars (Gantt-style) with rounded corners.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

const data = [
  { name: 'Design', start: 0, end: 4, category: 0 },
  { name: 'Build', start: 3, end: 11, category: 1 },
  { name: 'Review', start: 10, end: 14, category: 2 },
  { name: 'Ship', start: 13, end: 16, category: 3 },
];

const palette = ['#5470c6', '#91cc75', '#fac858', '#ee6666'];

export const Gantt: Story = {
  args: {
    option: {
      tooltip: { trigger: 'item' },
      xAxis: { type: 'value', min: 0, max: 18, name: 'Day' },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        inverse: true,
      },
      series: [
        {
          type: 'custom',
          renderItem: (
            _params: unknown,
            api: {
              value: (n: number) => number;
              coord: (p: [number, number]) => [number, number];
              size: (p: [number, number]) => [number, number];
              style: () => Record<string, unknown>;
            },
          ) => {
            const start = api.coord([api.value(1), api.value(0)]);
            const end = api.coord([api.value(2), api.value(0)]);
            const height = api.size([0, 1])[1] * 0.6;
            return {
              type: 'rect',
              shape: {
                x: start[0],
                y: start[1] - height / 2,
                width: end[0] - start[0],
                height,
                r: 4,
              },
              style: api.style(),
            };
          },
          encode: { x: [1, 2], y: 0 },
          data: data.map((d, i) => ({
            value: [i, d.start, d.end, d.name],
            itemStyle: { color: palette[d.category] },
          })),
        },
      ],
    },
  },
};
