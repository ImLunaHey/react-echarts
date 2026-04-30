import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Tree',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

const data = {
  name: 'root',
  children: [
    {
      name: 'apps',
      children: [
        { name: 'web' },
        { name: 'admin' },
        { name: 'mobile', children: [{ name: 'ios' }, { name: 'android' }] },
      ],
    },
    {
      name: 'libs',
      children: [
        { name: 'ui' },
        { name: 'data' },
        { name: 'utils', children: [{ name: 'date' }, { name: 'string' }] },
      ],
    },
    {
      name: 'tools',
      children: [{ name: 'eslint' }, { name: 'tsdown' }],
    },
  ],
};

export const Horizontal: Story = {
  render: () => (
    <SizedBox width={720} height={420}>
      <Chart
        option={{
          tooltip: { trigger: 'item' },
          series: [
            {
              type: 'tree',
              data: [data],
              top: '5%',
              bottom: '5%',
              left: '12%',
              right: '12%',
              symbol: 'emptyCircle',
              symbolSize: 8,
              label: { position: 'left', verticalAlign: 'middle', align: 'right' },
              leaves: { label: { position: 'right', verticalAlign: 'middle', align: 'left' } },
              emphasis: { focus: 'descendant' },
              expandAndCollapse: true,
            },
          ],
        }}
      />
    </SizedBox>
  ),
};

export const Radial: Story = {
  render: () => (
    <SizedBox width={520} height={520}>
      <Chart
        option={{
          tooltip: { trigger: 'item' },
          series: [
            {
              type: 'tree',
              data: [data],
              layout: 'radial',
              symbol: 'emptyCircle',
              symbolSize: 7,
              initialTreeDepth: 3,
              animationDurationUpdate: 750,
            },
          ],
        }}
      />
    </SizedBox>
  ),
};
