import {
    useCallback,
    useMemo,
    useState,
} from 'react';

import {
    TabContext,
    TabKey,
    TabVariant,
} from './TabContext';

export interface Props<T> {
    children: React.ReactNode;
    variant?: TabVariant;
    disabled?: boolean;
    value: T;
    onChange: (key: T) => void;
}

function Tabs<T extends TabKey>(props: Props<T>) {
    const {
        children,
        variant = 'primary',
        disabled,
        value,
        onChange,
    } = props;

    const [tabs, setTabs] = useState<TabKey[]>([]);
    const [step, setStep] = useState(0);

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

    const contextValue = useMemo(() => ({
        tabs,
        variant,
        disabled,
        activeTab: value,
        setActiveTab: onChange as (key: TabKey) => void,
        registerTab,
        unregisterTab,
        step,
        setStep,
    }), [
        tabs,
        value,
        onChange,
        variant,
        disabled,
        registerTab,
        unregisterTab,
        step,
        setStep,
    ]);

    return (
        <TabContext.Provider value={contextValue}>
            {children}
        </TabContext.Provider>
    );
}

export default Tabs;
