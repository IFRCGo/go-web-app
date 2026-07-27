import React from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import RawButton from '#components/RawButton';
import TabLayout, { Props as TabLayoutProps } from '#components/TabLayout';
import TabContext, {
    getTabNodeId,
    getTabPanelNodeId,
    type TabKey,
} from '#contexts/tab';

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
        idBase,
        activeTab,
        setActiveTab,
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

    const isActive = activeTab === name;
    React.useEffect(() => {
        if (isActive && setStep) {
            setStep(step);
        }
    }, [isActive, setStep, step]);

    const stepCompleted = isDefined(stepFromContext) && stepFromContext > step;
    const isFirstTab = styleVariant === 'step' && step === 1;
    const isLastTab = styleVariant === 'step' && step === numTabs;

    const disabled = disabledFromContext || disabledFromProps;

    const tabId = getTabNodeId(idBase, name);
    const panelId = getTabPanelNodeId(idBase, name);
    const isVertical = styleVariant === 'vertical' || styleVariant === 'vertical-compact';

    // Roving tabindex: only the active tab is in the tab order. If nothing is
    // active yet, the first registered tab stays focusable so the tablist is
    // reachable with Tab.
    const isFocusable = isActive || (isNotDefined(activeTab) && tabs[0] === name);

    const handleKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLButtonElement>) => {
            const currentIndex = tabs.indexOf(name);
            if (currentIndex === -1) {
                return;
            }
            const lastIndex = tabs.length - 1;
            const forwardKey = isVertical ? 'ArrowDown' : 'ArrowRight';
            const backwardKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

            let nextIndex: number | undefined;
            if (event.key === forwardKey) {
                nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
            } else if (event.key === backwardKey) {
                nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = lastIndex;
            } else {
                return;
            }

            event.preventDefault();
            const nextTab = tabs[nextIndex];
            setActiveTab(nextTab);
            // Automatic activation: move focus to the newly-activated tab.
            document.getElementById(getTabNodeId(idBase, nextTab))?.focus();
        },
        [tabs, name, isVertical, setActiveTab, idBase],
    );

    return (
        <RawButton
            id={tabId}
            className={styles.tab}
            onClick={setActiveTab}
            name={name}
            disabled={disabled}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={isActive ? panelId : undefined}
            tabIndex={isFocusable ? 0 : -1}
            onKeyDown={handleKeyDown}
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
