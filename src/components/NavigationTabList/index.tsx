import { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import NavigationTabContext, { NavigationTabVariant } from '#contexts/navigation-tab';

import styles from './styles.module.css';

export interface Props extends React.HTMLProps<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    variant?: NavigationTabVariant;
}

export default function TabList(props: Props) {
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
                )}
                role="tablist"
            >
                {variant === 'primary' && (
                    <div className={styles.startDummyContent} />
                )}
                {children}
                {variant === 'primary' && (
                    <div className={styles.endDummyContent} />
                )}
            </div>
        </NavigationTabContext.Provider>
    );
}
