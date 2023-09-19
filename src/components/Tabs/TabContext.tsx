import { createContext } from 'react';

export type TabKey = string | number;
export type TabVariant = 'primary' | 'secondary' | 'tertiary' | 'step' | 'vertical' | 'vertical-compact';

interface TabContextProps {
    variant?: TabVariant;
    disabled?: boolean;
    tabs: TabKey[];
    registerTab: (tab: TabKey) => void;
    unregisterTab: (tab: TabKey) => void;
    step: number;
    setStep?: React.Dispatch<React.SetStateAction<number>>;
    activeTab: TabKey;
    setActiveTab: (key: TabKey) => void;
}

export const TabContext = createContext<TabContextProps>({
    tabs: [],
    step: 0,
    disabled: false,
    activeTab: '',
    variant: 'primary',
    // eslint-disable-next-line no-console
    setActiveTab: () => { console.warn('setActiveTab called before it was initialized'); },
    // eslint-disable-next-line no-console
    registerTab: () => { console.warn('registerTab called before it was initialized'); },
    // eslint-disable-next-line no-console
    unregisterTab: () => { console.warn('unregisterTab called before it was initialized'); },
});
