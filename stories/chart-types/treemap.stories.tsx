import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Treemap',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

export const Basic: Story = {
  render: () => (
    <SizedBox width={720} height={420}>
      <Chart
        option={{
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
        }}
      />
    </SizedBox>
  ),
};
