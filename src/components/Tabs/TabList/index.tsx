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
        tabs,
        step: progress,
        disabled,
    } = context;

    const {
        children,
        className,
        ...otherProps
    } = props;

    const steps = tabs.length;

    const progressWidth = React.useMemo(() => {
        if (!steps || !progress) {
            return '0';
        }

        const progressPercentage = Math.max(
            0,
            Math.min(100, 100 * ((progress - 1) / (steps - 1))),
        );

        return `${progressPercentage}%`;
    }, [steps, progress]);

    const stepBorderWidth = React.useMemo(() => {
        if (!steps) {
            return '0';
        }

        return `${100 - 100 / steps}%`;
    }, [steps]);

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
            )}
            role="tablist"
        >
            {variant === 'step' && (
                <div
                    style={{ width: stepBorderWidth }}
                    className={styles.stepBorder}
                >
                    <div
                        style={{ width: progressWidth }}
                        className={styles.progress}
                    />
                </div>
            )}
            {variant === 'primary' && (
                <div className={styles.startDummyContent} />
            )}
            {children}
            {variant === 'primary' && (
                <div className={styles.endDummyContent} />
            )}
        </div>
    );
}
