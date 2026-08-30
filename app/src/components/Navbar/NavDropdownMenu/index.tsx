import { useState } from 'react';
import {
    Description,
    DropdownMenu,
    ListView,
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
        <DropdownMenu
            popupClassName={styles.dropdown}
            label={label}
            labelColorVariant="text"
            labelStyleVariant="action"
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
        </DropdownMenu>
    );
}

export default NavDropdownMenu;
