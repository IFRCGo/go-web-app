import { useState } from 'react';
import {
    Description,
    ListView,
    Menu,
    TabList,
    Tabs,
} from '@ifrc-go/ui';

import styles from './styles.module.css';

interface Props {
    label: React.ReactNode;
    initialValue: string;
    tabs: React.ReactNode;
    children: React.ReactNode;
}

function NavDropdownMenu(props: Props) {
    const {
        label,
        tabs,
        children,
        initialValue,
    } = props;

    const [tabValue, setTabValue] = useState<string>(initialValue);

    return (
        <Menu
            popupClassName={styles.dropdown}
            label={label}
            labelVariant="tertiary"
            persistent
            preferredPopupWidth={42}
            withoutPopupPadding
        >
            <Tabs
                value={tabValue}
                onChange={setTabValue}
                styleVariant="vertical-compact"
            >
                <ListView
                    layout="grid"
                    withSidebar
                    sidebarPosition="start"
                    sidebarSize="sm"
                    spacing="none"
                >
                    <ListView
                        className={styles.tabList}
                        layout="block"
                        withPadding
                    >
                        <Description
                            textSize="sm"
                            withLightText
                        >
                            {label}
                        </Description>
                        <TabList>
                            {tabs}
                        </TabList>
                    </ListView>
                    <ListView layout="block">
                        <div />
                        {children}
                    </ListView>
                </ListView>
            </Tabs>
        </Menu>
    );
}

export default NavDropdownMenu;
