import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Graph',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: { ...controlledChartDefaults, width: 640, height: 420 },
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

const nodes = [
  { id: '0', name: 'A', symbolSize: 40, category: 0 },
  { id: '1', name: 'B', symbolSize: 28, category: 0 },
  { id: '2', name: 'C', symbolSize: 32, category: 1 },
  { id: '3', name: 'D', symbolSize: 22, category: 1 },
  { id: '4', name: 'E', symbolSize: 36, category: 2 },
  { id: '5', name: 'F', symbolSize: 24, category: 2 },
  { id: '6', name: 'G', symbolSize: 30, category: 0 },
];

const links = [
  { source: '0', target: '1' },
  { source: '0', target: '2' },
  { source: '1', target: '3' },
  { source: '2', target: '4' },
  { source: '3', target: '5' },
  { source: '4', target: '5' },
  { source: '4', target: '6' },
  { source: '6', target: '0' },
];

export const ForceDirected: Story = {
  args: {
    option: {
      tooltip: { trigger: 'item' },
      legend: [{ data: ['Group 1', 'Group 2', 'Group 3'] }],
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          categories: [{ name: 'Group 1' }, { name: 'Group 2' }, { name: 'Group 3' }],
          data: nodes,
          links,
          label: { show: true, position: 'right' },
          force: { repulsion: 220, edgeLength: 80 },
          lineStyle: { color: 'source', curveness: 0.2 },
          emphasis: { focus: 'adjacency' },
        },
      ],
    },
  },
};
