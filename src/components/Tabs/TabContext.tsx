import React from 'react';

export type TabKey = string;
export type TabVariant = 'primary' | 'secondary' | 'step';

interface BaseTabContextProps {
  variant?: TabVariant;
  disabled?: boolean;
  tabs: TabKey[];
  registerTab: (tab: TabKey) => void;
  unregisterTab: (tab: TabKey) => void;
  step: number;
  setStep?: React.Dispatch<React.SetStateAction<number>>;
}

export type TabContextProps = BaseTabContextProps & (
  {
    useHash: true;
    hash: string | undefined;
  } | {
    useHash?: false;
    activeTab: TabKey | undefined;
    setActiveTab: (key: TabKey | undefined) => void;
  }
);

export const TabContext = React.createContext<TabContextProps>({
  tabs: [],
  step: 0,
  disabled: false,
  activeTab: '',
  variant: 'primary',
  setActiveTab: () => { console.warn('setActiveTab called before it was initialized'); },
  registerTab: () => { console.warn('registerTab called before it was initialized'); },
  unregisterTab: () => { console.warn('unregisterTab called before it was initialized'); },
});
