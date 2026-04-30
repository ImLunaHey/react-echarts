import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Sankey',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: { ...controlledChartDefaults, width: 720, height: 420 },
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

export const Basic: Story = {
  args: {
    option: {
      tooltip: { trigger: 'item', triggerOn: 'mousemove' },
      series: [
        {
          type: 'sankey',
          emphasis: { focus: 'adjacency' },
          data: [
            { name: 'Source A' },
            { name: 'Source B' },
            { name: 'Mid 1' },
            { name: 'Mid 2' },
            { name: 'Sink X' },
            { name: 'Sink Y' },
          ],
          links: [
            { source: 'Source A', target: 'Mid 1', value: 8 },
            { source: 'Source A', target: 'Mid 2', value: 4 },
            { source: 'Source B', target: 'Mid 1', value: 3 },
            { source: 'Source B', target: 'Mid 2', value: 9 },
            { source: 'Mid 1', target: 'Sink X', value: 6 },
            { source: 'Mid 1', target: 'Sink Y', value: 5 },
            { source: 'Mid 2', target: 'Sink X', value: 4 },
            { source: 'Mid 2', target: 'Sink Y', value: 9 },
          ],
        },
      ],
    },
  },
};
