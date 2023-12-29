import React from 'react';

import {
    TabContext,
    TabKey,
} from '../TabContext';

export interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'name'> {
    name: TabKey;
    elementRef?: React.Ref<HTMLDivElement>;
}

export default function TabPanel(props: Props) {
    const context = React.useContext(TabContext);

    const {
        name,
        elementRef,
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
            role="tabpanel"
            ref={elementRef}
        />
    );
}
