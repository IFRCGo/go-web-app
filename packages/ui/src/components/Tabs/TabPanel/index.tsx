import React from 'react';
import { _cs } from '@togglecorp/fujs';

import TabContext, { type TabKey } from '#contexts/tab';

import styles from './styles.module.css';

export interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'name'> {
    name: TabKey;
    elementRef?: React.Ref<HTMLDivElement>;
    withContentsOnly?: boolean;
}

export default function TabPanel(props: Props) {
    const context = React.useContext(TabContext);

    const {
        name,
        elementRef,
        withContentsOnly,
        className,
        ...otherProps
    } = props;

    const isActive = context.activeTab === name;

    if (!isActive) {
        return null;
    }

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(
                styles.tabPanel,
                withContentsOnly && styles.withContentsOnly,
                className,
            )}
            role="tabpanel"
            ref={elementRef}
        />
    );
}
