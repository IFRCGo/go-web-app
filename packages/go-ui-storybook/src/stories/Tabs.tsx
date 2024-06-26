import {
    Tabs as PureTabs,
    TabsProps,
} from '@ifrc-go/ui';

function Tabs<T extends string | number>(props: TabsProps<T>) {
    return (
        <PureTabs {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Tabs;
