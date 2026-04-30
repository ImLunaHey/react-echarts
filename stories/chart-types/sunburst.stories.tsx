import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Sunburst',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: controlledChartDefaults,
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

export const Basic: Story = {
  args: {
    option: {
      series: [
        {
          type: 'sunburst',
          radius: [0, '90%'],
          data: [
            {
              name: 'Sales',
              children: [
                { name: 'Q1', value: 6 },
                { name: 'Q2', value: 8 },
                { name: 'Q3', value: 12, children: [{ name: 'Promo', value: 5 }] },
                { name: 'Q4', value: 10 },
              ],
            },
            {
              name: 'Marketing',
              children: [
                { name: 'Email', value: 4 },
                { name: 'Paid', value: 9 },
                { name: 'Social', value: 7 },
              ],
            },
          ],
          label: { rotate: 'radial' },
        },
      ],
    },
  },
};
