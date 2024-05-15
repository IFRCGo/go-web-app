import {
    Tabs as PureTabs,
    TabsProps as PureTabsProps,
} from '@ifrc-go/ui';

interface TabsProps<T extends string | number> extends PureTabsProps<T> {}

function WrappedTabs<T extends string | number>(props: TabsProps<T>) {
    return (
        <PureTabs {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedTabs;
