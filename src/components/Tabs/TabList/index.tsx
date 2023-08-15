import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { TabContext } from '#components/Tabs/TabContext';

import styles from './styles.module.css';

export interface Props extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function TabList(props: Props) {
    const context = React.useContext(TabContext);
    const {
        variant,
        disabled,
    } = context;

    const {
        children,
        className,
        ...otherProps
    } = props;

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(
                className,
                styles.tabList,
                disabled && styles.disabled,
                variant === 'primary' && styles.primary,
                variant === 'secondary' && styles.secondary,
                variant === 'tertiary' && styles.tertiary,
                variant === 'step' && styles.step,
                variant === 'vertical' && styles.vertical,
            )}
            role="tablist"
        >
            <div className={styles.startDummyContent} />
            <div className={styles.content}>
                {children}
            </div>
            <div className={styles.endDummyContent} />
        </div>
    );
}
