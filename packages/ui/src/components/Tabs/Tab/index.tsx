import React from 'react';
import { isDefined } from '@togglecorp/fujs';

import RawButton from '#components/RawButton';
import TabLayout, { Props as TabLayoutProps } from '#components/TabLayout';
import TabContext, { type TabKey } from '#contexts/tab';

import styles from './styles.module.css';

export interface Props<NAME extends TabKey> extends Omit<TabLayoutProps, 'colorVariant' | 'styleVariant' | 'active'> {
    name: NAME;
    /** Position of this tab when used inside a 'step' style tab list (1-based) */
    step?: number;
    /** Show the errored state on the tab */
    errored?: boolean;
}

/**
 * Specific component for a single tab item, to be used inside Tabs.
 * Renders a RawButton wrapping a TabLayout; the visual variants and active
 * state come from the surrounding Tabs context, not from props.
 */
export default function Tab<NAME extends TabKey>(props: Props<NAME>) {
    const context = React.useContext(TabContext);

    const {
        styleVariant,
        colorVariant,
        disabled: disabledFromContext,
        registerTab,
        unregisterTab,
        setStep,
        step: stepFromContext,
        tabs,
    } = context;

    const numTabs = tabs.length;

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

    const stepCompleted = isDefined(stepFromContext) && stepFromContext > step;
    const isFirstTab = styleVariant === 'step' && step === 1;
    const isLastTab = styleVariant === 'step' && step === numTabs;

    const disabled = disabledFromContext || disabledFromProps;

    return (
        // FIXME(a11y-tier2): add roving tabindex / arrow-key navigation across tabs
        <RawButton
            className={styles.tab}
            onClick={context.setActiveTab}
            name={name}
            disabled={disabled}
            type="button"
            role="tab"
            aria-selected={isActive}
        >
            <TabLayout
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                className={className}
                styleVariant={styleVariant}
                colorVariant={colorVariant}
                errored={errored}
                stepCompleted={stepCompleted}
                isFirstStep={isFirstTab}
                isLastStep={isLastTab}
                disabled={disabled}
                active={isActive}
            >
                {children}
            </TabLayout>
        </RawButton>
    );
}
