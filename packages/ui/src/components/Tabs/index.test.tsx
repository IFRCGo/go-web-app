import { useState } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    describe,
    expect,
    it,
} from 'vitest';

import Tabs from './index';
import Tab from './Tab';
import TabList from './TabList';
import TabPanel from './TabPanel';

function ControlledTabs() {
    const [value, setValue] = useState<'a' | 'b' | 'c'>('a');
    return (
        <Tabs value={value} onChange={setValue}>
            <TabList>
                <Tab name="a">Tab A</Tab>
                <Tab name="b">Tab B</Tab>
                <Tab name="c">Tab C</Tab>
            </TabList>
            <TabPanel name="a">Panel A</TabPanel>
            <TabPanel name="b">Panel B</TabPanel>
            <TabPanel name="c">Panel C</TabPanel>
        </Tabs>
    );
}

describe('Tabs APG keyboard model', () => {
    it('wires roles, roving tabindex, and tab<->panel ids', () => {
        const { getAllByRole, getByRole } = render(<ControlledTabs />);
        const tabs = getAllByRole('tab');

        expect(tabs).toHaveLength(3);
        // roving tabindex: only the active tab is in the tab order
        expect(tabs[0]).toHaveAttribute('tabindex', '0');
        expect(tabs[1]).toHaveAttribute('tabindex', '-1');
        expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

        // active tab controls the panel; panel is labelled by the tab
        const panel = getByRole('tabpanel');
        expect(tabs[0].getAttribute('aria-controls')).toBe(panel.id);
        expect(panel.getAttribute('aria-labelledby')).toBe(tabs[0].id);
    });

    it('moves selection with ArrowRight (automatic activation)', async () => {
        const { getAllByRole, getByRole } = render(<ControlledTabs />);
        getAllByRole('tab')[0].focus();

        await userEvent.keyboard('{ArrowRight}');

        expect(getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
        expect(getByRole('tabpanel')).toHaveTextContent('Panel B');
    });
});
