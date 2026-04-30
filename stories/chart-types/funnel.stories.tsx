import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Funnel',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

export const SignupConversion: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
          legend: { bottom: 0 },
          series: [
            {
              type: 'funnel',
              left: '10%',
              top: 30,
              bottom: 40,
              width: '80%',
              min: 0,
              max: 100,
              gap: 2,
              label: { show: true, position: 'inside' },
              labelLine: { length: 10, lineStyle: { width: 1, type: 'solid' } },
              itemStyle: { borderColor: '#fff', borderWidth: 1 },
              emphasis: { label: { fontSize: 18 } },
              data: [
                { value: 100, name: 'Visited' },
                { value: 72, name: 'Signed up' },
                { value: 54, name: 'Activated' },
                { value: 33, name: 'Paid' },
                { value: 18, name: 'Retained' },
              ],
            },
          ],
        }}
      />
    </SizedBox>
  ),
};
