import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Pie',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

const data = [
  { value: 1048, name: 'Search' },
  { value: 735, name: 'Direct' },
  { value: 580, name: 'Email' },
  { value: 484, name: 'Union Ads' },
  { value: 300, name: 'Video Ads' },
];

export const Basic: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          tooltip: { trigger: 'item' },
          legend: { top: 'bottom' },
          series: [{ type: 'pie', radius: '60%', data }],
        }}
      />
    </SizedBox>
  ),
};

export const Donut: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
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
        }}
      />
    </SizedBox>
  ),
};

export const Rose: Story = {
  render: () => (
    <SizedBox>
      <Chart
        option={{
          tooltip: { trigger: 'item' },
          legend: { top: 'bottom' },
          series: [{ type: 'pie', radius: [40, 140], roseType: 'area', data }],
        }}
      />
    </SizedBox>
  ),
};
