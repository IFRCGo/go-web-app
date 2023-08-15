import { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import NavigationTabContext, { NavigationTabVariant } from '#contexts/navigation-tab';

import styles from './styles.module.css';

export interface Props extends React.HTMLProps<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    variant?: NavigationTabVariant;
}

export default function NavigationTabList(props: Props) {
    const {
        children,
        variant = 'primary',
        className,
        ...otherProps
    } = props;

    const tabContextValue = useMemo(
        () => ({
            variant,
        }),
        [variant],
    );

    return (
        <NavigationTabContext.Provider value={tabContextValue}>
            <div
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                className={_cs(
                    className,
                    styles.navigationTabList,
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
        </NavigationTabContext.Provider>
    );
}
