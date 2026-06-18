import {
    useCallback,
    useId,
    useMemo,
    useState,
} from 'react';

import TabContext, {
    type TabColorVariant,
    TabContextProps,
    type TabKey,
    type TabStyleVariant,
} from '#contexts/tab';

export interface Props<VALUE> {
    children: React.ReactNode;
    colorVariant?: TabColorVariant;
    styleVariant?: TabStyleVariant;
    disabled?: boolean;
    value: VALUE | undefined;
    onChange: (key: VALUE) => void;
}

function Tabs<const VALUE extends TabKey>(props: Props<VALUE>) {
    const {
        styleVariant = 'tab',
        colorVariant = styleVariant === 'tab' ? 'text' : 'primary',
        disabled,
        value,
        onChange,
        children,
    } = props;

    const [tabs, setTabs] = useState<TabKey[]>([]);
    const [step, setStep] = useState(0);
    const idBase = useId();

    const registerTab = useCallback((name: TabKey) => {
        setTabs((prevTabs) => {
            const i = prevTabs.findIndex((d) => d === name);
            if (i === -1) {
                return [...prevTabs, name];
            }

            return prevTabs;
        });
    }, [setTabs]);

    const unregisterTab = useCallback((name: TabKey) => {
        setTabs((prevTabs) => {
            const i = prevTabs.findIndex((d) => d === name);
            if (i !== -1) {
                const newTabs = [...prevTabs];
                newTabs.splice(i, 1);
                return newTabs;
            }

            return prevTabs;
        });
    }, [setTabs]);

    const contextValue = useMemo<TabContextProps>(() => ({
        tabs,
        colorVariant,
        styleVariant,
        disabled: !!disabled,
        activeTab: value,
        setActiveTab: onChange as (key: TabKey) => void,
        registerTab,
        unregisterTab,
        step,
        setStep,
        idBase,
    }), [
        tabs,
        value,
        onChange,
        colorVariant,
        styleVariant,
        disabled,
        registerTab,
        unregisterTab,
        step,
        setStep,
        idBase,
    ]);

    return (
        <TabContext.Provider value={contextValue}>
            {children}
        </TabContext.Provider>
    );
}

export default Tabs;
