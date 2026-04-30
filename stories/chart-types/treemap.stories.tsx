import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Treemap',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: { ...controlledChartDefaults, width: 720, height: 420 },
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

export const Basic: Story = {
  args: {
    option: {
      tooltip: {},
      series: [
        {
          type: 'treemap',
          data: [
            {
              name: 'Frontend',
              value: 40,
              children: [
                { name: 'React', value: 18 },
                { name: 'Storybook', value: 6 },
                { name: 'Vite', value: 8 },
                { name: 'TypeScript', value: 8 },
              ],
            },
            {
              name: 'Backend',
              value: 35,
              children: [
                { name: 'Node', value: 12 },
                { name: 'Postgres', value: 10 },
                { name: 'Redis', value: 6 },
                { name: 'Workers', value: 7 },
              ],
            },
            {
              name: 'Ops',
              value: 25,
              children: [
                { name: 'CI', value: 9 },
                { name: 'Monitoring', value: 8 },
                { name: 'Infra', value: 8 },
              ],
            },
          ],
        },
      ],
    },
  },
};
