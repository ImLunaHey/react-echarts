import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Gauge',
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
              type: 'gauge',
              progress: { show: true },
              detail: { valueAnimation: true, formatter: '{value}' },
              data: [{ value: 72, name: 'Score' }],
            },
          ],
        }}
      />
    </SizedBox>
  ),
};

export const Speedometer: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          series: [
            {
              type: 'gauge',
              startAngle: 180,
              endAngle: 0,
              min: 0,
              max: 220,
              splitNumber: 11,
              axisLine: {
                lineStyle: {
                  width: 18,
                  color: [
                    [0.3, '#67e0e3'],
                    [0.7, '#37a2da'],
                    [1, '#fd666d'],
                  ],
                },
              },
              detail: { formatter: '{value} km/h' },
              data: [{ value: 145 }],
            },
          ],
        }}
      />
    </SizedBox>
  ),
};
