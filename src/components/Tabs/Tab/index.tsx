import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { CheckFillIcon, CloseFillIcon } from '@ifrc-go/icons';

import RawButton, { Props as RawButtonProps } from '#components/RawButton';
import { TabKey, TabContext } from '#components/Tabs/TabContext';

import styles from './styles.module.css';

export interface Props<T extends TabKey> extends Omit<RawButtonProps<T>, 'onClick' | 'variant'> {
    name: T;
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
        className,
        name,
        step = 0,
        disabled: disabledFromProps,
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

    const stepCompleted = stepFromContext > step;

    const tabChildren = (
        <>
            {variant === 'step' && (
                <div className={styles.visualElements}>
                    <div className={styles.progressBarStart} />
                    <div className={styles.stepCircle}>
                        <div className={styles.innerCircle}>
                            {errored && <CloseFillIcon className={styles.icon} />}
                            {!errored && stepCompleted && (
                                <CheckFillIcon className={styles.icon} />
                            )}
                        </div>
                    </div>
                    <div className={styles.progressBarEnd} />
                </div>
            )}
            {variant === 'primary' && (
                <div className={styles.dummy} />
            )}
            <div className={styles.childrenWrapper}>
                {children}
            </div>
            {variant === 'primary' && (
                <div className={styles.dummy} />
            )}
        </>
    );

    const disabled = disabledFromContext || disabledFromProps;
    return (
        <RawButton
            className={_cs(
                styles.tab,
                isActive && styles.active,
                disabled && styles.disabled,
                variant === 'primary' && styles.primary,
                variant === 'secondary' && styles.secondary,
                variant === 'tertiary' && styles.tertiary,
                variant === 'step' && styles.step,
                variant === 'vertical' && styles.vertical,
                stepCompleted && styles.completed,
                errored && styles.errored,
                className,
            )}
            onClick={context.setActiveTab}
            name={name}
            disabled={disabled}
            type="button"
            // FIXME: use translations
            title={typeof children === 'string' ? children : 'Tab'}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        >
            {/* errored && <span className={styles.errorIcon} /> */}
            {tabChildren}
        </RawButton>
    );
}
