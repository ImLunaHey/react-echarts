import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Sunburst',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

export const Basic: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
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
        }}
      />
    </SizedBox>
  ),
};
