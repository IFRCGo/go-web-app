import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { CheckLineIcon, CloseFillIcon } from '@ifrc-go/icons';

import RawButton, { Props as RawButtonProps } from '#components/RawButton';
import { TabKey, TabContext, TabVariant } from '#components/Tabs/TabContext';

import styles from './styles.module.css';

const tabVariantToStyleMap: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [key in TabVariant]: string;
} = {
    primary: styles.primary,
    secondary: styles.secondary,
    step: styles.step,
};

export interface Props<T extends TabKey> extends Omit<RawButtonProps<T>, 'onClick' | 'variant'> {
    name: T;
    activeClassName?: string;
    borderWrapperClassName?: string;
    step?: number;
    errored?: boolean;
}

export default function Tab<T extends TabKey>(props: Props<T>) {
    const context = React.useContext(TabContext);

    const {
        variant,
        disabled: disabledFromContext,
        registerTab,
        unregisterTab,
        setStep,
        step: stepFromContext,
    } = context;

    const {
        activeClassName,
        className,
        name,
        step = 0,
        disabled: disabledFromProps,
        borderWrapperClassName,
        children,
        errored,
        ...otherProps
    } = props;

    React.useEffect(() => {
        registerTab(name);

        return () => { unregisterTab(name); };
    }, [registerTab, unregisterTab, name]);

    const isActive = context.activeTab === name;
    React.useEffect(() => {
        if (isActive && setStep) {
            setStep(step);
        }
    }, [isActive, setStep, step]);

    const disabled = disabledFromContext || disabledFromProps;
    const button = (
        <RawButton
            className={_cs(
                className,
                styles.tab,
                isActive && styles.active,
                isActive && activeClassName,
                disabled && styles.disabled,
                variant && tabVariantToStyleMap[variant],
                errored && styles.errored,
            )}
            onClick={context.setActiveTab}
            name={name}
            disabled={disabled}
            type="button"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        >
            {errored && <span className={styles.errorIcon} />}
            {children}
            {variant === 'primary' && isActive && (
                <div className={styles.activeBorder} />
            )}
        </RawButton>
    );

    // The clip path used for step tab does not support border
    // So we wrap it into a container and set its background as border
    if (variant === 'step') {
        const completed = stepFromContext > step;
        return (
            <div
                className={_cs(
                    styles.stepTabWrapper,
                    disabled && styles.disabled,
                    isActive && styles.active,
                    borderWrapperClassName,
                    completed && styles.completed,
                )}
            >
                <div className={styles.stepCircle}>
                    <div className={styles.innerCircle}>
                        {errored && <CloseFillIcon className={styles.icon} />}
                        {(!errored && completed) && <CheckLineIcon className={styles.icon} />}
                    </div>
                </div>
                {button}
            </div>
        );
    }

    if (variant === 'primary') {
        return (
            <div
                className={_cs(
                    styles.primaryTabWrapper,
                    isActive && styles.active,
                    disabled && styles.disabled,
                )}
            >
                {button}
            </div>
        );
    }

    return button;
}

export interface TabListProps extends React.HTMLProps<HTMLDivElement> {
    children: React.ReactNode;
}
