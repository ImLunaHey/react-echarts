import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Pie',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: controlledChartDefaults,
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

const data = [
  { value: 1048, name: 'Search' },
  { value: 735, name: 'Direct' },
  { value: 580, name: 'Email' },
  { value: 484, name: 'Union Ads' },
  { value: 300, name: 'Video Ads' },
];

export const Basic: Story = {
  args: {
    option: {
      tooltip: { trigger: 'item' },
      legend: { top: 'bottom' },
      series: [{ type: 'pie', radius: '60%', data }],
    },
  },
};

export const Donut: Story = {
  args: {
    option: {
      tooltip: { trigger: 'item' },
      legend: { top: 'bottom' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 24, fontWeight: 'bold' } },
          labelLine: { show: false },
          data,
        },
      ],
    },
  },
};

export const Rose: Story = {
  args: {
    option: {
      tooltip: { trigger: 'item' },
      legend: { top: 'bottom' },
      series: [{ type: 'pie', radius: [40, 140], roseType: 'area', data }],
    },
  },
};
