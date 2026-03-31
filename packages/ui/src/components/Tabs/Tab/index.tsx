import React from 'react';
import { isDefined } from '@togglecorp/fujs';

import RawButton from '#components/RawButton';
import TabLayout, { Props as TabLayoutProps } from '#components/TabLayout';
import TabContext, { type TabKey } from '#contexts/tab';

import styles from './styles.module.css';

export interface Props<NAME extends TabKey> extends Omit<TabLayoutProps, 'colorVariant' | 'styleVariant' | 'isActive'> {
    name: NAME;
    step?: number;
    errored?: boolean;
}

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
        <RawButton
            className={styles.tab}
            onClick={context.setActiveTab}
            name={name}
            disabled={disabled}
            type="button"
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
