import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    icons?: React.ReactNode;
    children: React.ReactNode;
    actions?: React.ReactNode;
    iconsContainerClassName?: string;
    childrenContainerClassName?: string;
    actionsContainerClassName?: string;
}

function useBasicLayout(props: Props) {
    const {
        className,
        icons,
        children,
        actions,
        iconsContainerClassName,
        childrenContainerClassName,
        actionsContainerClassName,
    } = props;

    const containerClassName = _cs(styles.layoutContainer, className);
    const content = (
        <>
            {icons && (
                <div className={_cs(styles.iconsContainer, iconsContainerClassName)}>
                    {icons}
                </div>
            )}
            <div className={_cs(styles.childrenContainer, childrenContainerClassName)}>
                {children}
            </div>
            {actions && (
                <div className={_cs(styles.actionsContainer, actionsContainerClassName)}>
                    {actions}
                </div>
            )}
        </>
    );

    return {
        containerClassName,
        content,
    };
}

export default useBasicLayout;
