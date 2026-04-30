import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Chart types/Sankey',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

export const Basic: Story = {
  render: () => (
    <SizedBox width={720} height={420}>
      <Chart
        option={{
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
        }}
      />
    </SizedBox>
  ),
};
