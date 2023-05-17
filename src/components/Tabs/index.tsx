import React from 'react';

import {
  TabKey,
  TabVariant,
  TabContext,
} from './TabContext';

import useHash from '#hooks/useHash';

export interface BaseProps {
  children: React.ReactNode;
  variant?: TabVariant;
  disabled?: boolean;
}

export type Props<T extends TabKey> = BaseProps & (
  {
    useHash: true;
    initialHash?: string;
    value?: never;
    onChange?: never;
  } | {
    useHash?: false;
    value: T;
    onChange: (key: T) => void;
  }
);

export function Tabs<T extends TabKey>(props: Props<T>) {
  const {
    children,
    variant = 'primary',
    disabled,
  } = props;

  const [tabs, setTabs] = React.useState<TabKey[]>([]);
  const [step, setStep] = React.useState(0);

  const registerTab = React.useCallback((name: string) => {
    setTabs((prevTabs) => {
      const i = prevTabs.findIndex(d => d === name);
      if (i === -1) {
        return [...prevTabs, name];
      }

      return prevTabs;
    });
  }, [setTabs]);

  const unregisterTab = React.useCallback((name: string) => {
    setTabs((prevTabs) => {
      const i = prevTabs.findIndex(d => d === name);
      if (i !== -1) {
        const newTabs = [...prevTabs];
        newTabs.splice(i, 1);
        return newTabs;
      }

      return prevTabs;
    });
  }, [setTabs]);

  // eslint-disable-next-line react/destructuring-assignment
  const hash = useHash(props.useHash ? props.initialHash : undefined, !!props.useHash);

  const contextValue = React.useMemo(() => {
    if (props.useHash) {
      return {
        tabs,
        variant,
        disabled,
        hash,
        useHash: props.useHash,
        registerTab,
        unregisterTab,
        step,
        setStep,
      };
    }

    // Note: following cast is required since we do not have any other method
    // to provide template in the context type
    return {
      tabs,
      variant,
      disabled,
      activeTab: props.value,
      setActiveTab: props.onChange as (key: TabKey | undefined) => void,
      registerTab,
      unregisterTab,
      step,
      setStep,
    };
  }, [
    tabs,
    props.value,
    props.onChange,
    variant,
    disabled,
    props.useHash,
    hash,
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
