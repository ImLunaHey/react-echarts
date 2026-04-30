import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Radar',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: controlledChartDefaults,
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

export const Basic: Story = {
  args: {
    option: {
      legend: { data: ['Allocated', 'Actual Spending'] },
      radar: {
        indicator: [
          { name: 'Sales', max: 6500 },
          { name: 'Admin', max: 16000 },
          { name: 'IT', max: 30000 },
          { name: 'Customer Support', max: 38000 },
          { name: 'Development', max: 52000 },
          { name: 'Marketing', max: 25000 },
        ],
      },
      series: [
        {
          type: 'radar',
          data: [
            { value: [4200, 3000, 20000, 35000, 50000, 18000], name: 'Allocated' },
            { value: [5000, 14000, 28000, 26000, 42000, 21000], name: 'Actual Spending' },
          ],
        },
      ],
    },
  },
};
